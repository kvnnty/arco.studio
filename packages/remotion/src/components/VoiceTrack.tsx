import type { ArcoProject, ScreenshotScene } from "@arco/project-schema";
import { msToFrames, projectHasVoiceover } from "@arco/project-schema";
import { AbsoluteFill, Audio, Sequence } from "remotion";

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

export function musicVolumeForProject(project: ArcoProject): number {
  const base = project.audio?.volume ?? 0.85;
  if (!projectHasVoiceover(project)) return base;
  if (project.audio?.duckUnderVoice === false) return base;
  return Math.min(base, 0.35);
}
