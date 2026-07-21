import {
  MOTION_SOUND_IDS,
  screenshotMotionSchema,
  soundDesignProfileSchema,
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
  soundDesign: z
    .object({
      decision: z.enum(['include', 'silence']),
      rationale: z.string().min(1).max(500),
      profile: soundDesignProfileSchema.optional(),
      masterVolume: z.number().min(0).max(0.8).optional(),
      cues: z
        .array(
          z.object({
            sceneIndex: z.number().int().min(0),
            soundId: z.enum(MOTION_SOUND_IDS),
            offsetMs: z.number().int().min(-1200).max(5000).optional(),
            volume: z.number().min(0).max(0.85).optional(),
            intensity: z.number().min(0).max(1).optional(),
            rationale: z.string().max(240).optional(),
          }),
        )
        .max(12)
        .optional(),
    })
    .optional(),
});

export type StoryboardResponse = z.infer<typeof storyboardResponseSchema>;
