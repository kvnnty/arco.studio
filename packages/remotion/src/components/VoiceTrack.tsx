import type { ArcoProject, ScreenshotScene } from "@arco/project-schema";
import { msToFrames, projectHasVoiceover } from "@arco/project-schema";
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from "remotion";

type VoiceTrackProps = {
  project: ArcoProject;
};

function sceneStartFrame(
  scenes: ScreenshotScene[],
  index: number,
  fps: number,
): number {
  let ms = 0;
  for (let i = 0; i < index; i++) {
    ms += scenes[i]?.durationMs ?? 0;
  }
  return msToFrames(ms, fps);
}

export function VoiceTrack({ project }: VoiceTrackProps) {
  if (project.audio?.voiceEnabled === false) return null;

  const scenes = project.scenes ?? [];
  const fps = project.meta.fps;
  const voiced = scenes.filter((scene) => scene.voAudioSrc);
  if (voiced.length === 0) return null;

  return (
    <AbsoluteFill>
      {scenes.map((scene, index) => {
        if (!scene.voAudioSrc) return null;

        const from = sceneStartFrame(scenes, index, fps);
        const durationInFrames = msToFrames(scene.durationMs, fps);

        return (
          <Sequence
            key={`voice-${scene.id}`}
            from={from}
            durationInFrames={durationInFrames}
          >
            <Audio src={scene.voAudioSrc} volume={1} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

/** Base volume ignoring ducking. Library default is 0.25. */
export function baseMusicVolume(project: ArcoProject): number {
  return project.audio?.volume ?? 0.25;
}

/**
 * Flat duck (legacy). Prefer {@link musicVolumeAtFrame} for timed ducking.
 */
export function musicVolumeForProject(project: ArcoProject): number {
  const base = baseMusicVolume(project);
  if (!projectHasVoiceover(project)) return base;
  if (project.audio?.duckUnderVoice === false) return base;
  return base * 0.35;
}

/**
 * Timed duck: lower music while a scene with VO is active; rise between VO scenes.
 */
export function musicVolumeAtFrame(
  project: ArcoProject,
  frame: number,
): number {
  const base = baseMusicVolume(project);
  if (!projectHasVoiceover(project)) return base;
  if (project.audio?.duckUnderVoice === false) return base;

  const scenes = project.scenes ?? [];
  const fps = project.meta.fps;
  const ducked = base * 0.35;
  const fadeFrames = Math.max(4, Math.round(fps * 0.25));

  let volume = base;

  for (let index = 0; index < scenes.length; index++) {
    const scene = scenes[index];
    if (!scene?.voAudioSrc) continue;

    const start = sceneStartFrame(scenes, index, fps);
    const end = start + msToFrames(scene.durationMs, fps);

    if (frame < start - fadeFrames || frame > end + fadeFrames) continue;

    if (frame >= start && frame <= end) {
      volume = Math.min(volume, ducked);
      continue;
    }

    if (frame < start) {
      const t = (frame - (start - fadeFrames)) / fadeFrames;
      const v = base + (ducked - base) * Math.min(1, Math.max(0, t));
      volume = Math.min(volume, v);
    } else {
      const t = (frame - end) / fadeFrames;
      const v = ducked + (base - ducked) * Math.min(1, Math.max(0, t));
      volume = Math.min(volume, v);
    }
  }

  return volume;
}

/** Remotion helper component if volume must be frame-driven from inside Audio tree. */
export function useMusicVolume(project: ArcoProject): number {
  const frame = useCurrentFrame();
  return musicVolumeAtFrame(project, frame);
}
