import { stylePresetSchema } from '@arco/project-schema';
import { z } from 'zod';

export const llmStoryboardSceneSchema = z.object({
  headline: z.string().max(120).optional(),
  subheadline: z.string().max(200).optional(),
  voScript: z.string().max(500).optional(),
  durationMs: z.number().int().min(1000).max(15000).optional(),
});

export const storyboardResponseSchema = z.object({
  stylePreset: stylePresetSchema.optional(),
  scenes: z.array(llmStoryboardSceneSchema).optional(),
});

export type StoryboardResponse = z.infer<typeof storyboardResponseSchema>;
