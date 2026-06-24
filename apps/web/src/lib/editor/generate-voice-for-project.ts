import type { ArcoProject, ScreenshotScene } from "@arco/project-schema";
import { spokenScriptFromScene } from "@arco/project-schema";

import { apiGenerateVoice } from "@/lib/api/client";

export async function generateVoiceForScreenshotProject(
  accessToken: string,
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
    .filter((scene) => scene.voScript.length > 0);

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
