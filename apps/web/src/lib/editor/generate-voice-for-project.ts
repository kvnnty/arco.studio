import type { ArcoProject, ScreenshotScene } from "@arco/project-schema";
import { spokenScriptFromScene } from "@arco/project-schema";
import type { AccessTokenSource } from "@/lib/auth/constants";

import { apiGenerateVoice } from "@/lib/api/client";

export async function generateVoiceForScreenshotProject(
  accessToken: AccessTokenSource,
  project: ArcoProject,
  voiceId: string,
): Promise<ScreenshotScene[]> {
  const scenes = project.scenes ?? [];
  if (scenes.length === 0) return scenes;

  const payload = scenes
    .map((scene) => ({
      id: scene.id,
      voScript: spokenScriptFromScene(scene),
    }))
    .filter((scene) => {
      const full = scenes.find((s) => s.id === scene.id);
      if (!scene.voScript.length) return false;
      // Only synthesize scenes missing audio (re-TTS after copy edits).
      return !full?.voAudioSrc;
    });

  if (payload.length === 0) return scenes;

  const result = await apiGenerateVoice(accessToken, {
    voiceId,
    scenes: payload,
  });

  const byId = new Map(result.scenes.map((scene) => [scene.id, scene]));

  return scenes.map((scene) => {
    const generated = byId.get(scene.id);
    if (!generated) return scene;
    return {
      ...scene,
      voScript: generated.voScript,
      voAudioSrc: generated.voAudioSrc,
    };
  });
}
