import {
  screenshotMotionSchema,
  stylePresetSchema,
  transitionTypeSchema,
} from '@arco/project-schema';
import { z } from 'zod';

export const llmStoryboardSceneSchema = z.object({
  headline: z.string().max(120).optional(),
  subheadline: z.string().max(200).optional(),
  voScript: z.string().max(500).optional(),
  durationMs: z.number().int().min(1000).max(15000).optional(),
  beatRole: z
    .enum(['hook', 'problem', 'proof', 'feature', 'benefit', 'cta'])
    .optional(),
  motion: screenshotMotionSchema.optional(),
  transition: transitionTypeSchema.optional(),
  motionIntent: z.string().max(160).optional(),
});

export const storyboardResponseSchema = z.object({
  stylePreset: stylePresetSchema.optional(),
  creativeDirection: z
    .object({
      audience: z.string().max(120).optional(),
      channel: z.string().max(80).optional(),
      tone: z.string().max(120).optional(),
      coreMessage: z.string().max(180).optional(),
      qualityNotes: z.array(z.string().max(160)).max(5).optional(),
    })
    .optional(),
  scenes: z.array(llmStoryboardSceneSchema).optional(),
});

export type StoryboardResponse = z.infer<typeof storyboardResponseSchema>;
