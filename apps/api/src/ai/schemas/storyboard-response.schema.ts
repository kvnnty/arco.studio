import {
  MOTION_SOUND_IDS,
  screenshotMotionSchema,
  soundDesignProfileSchema,
  stylePresetSchema,
  transitionTypeSchema,
} from '@arco/project-schema';
import { z } from 'zod';

export const llmStoryboardSceneSchema = z.object({
  headline: z.string().max(120).nullable(),
  subheadline: z.string().max(200).nullable(),
  voScript: z.string().max(500).nullable(),
  durationMs: z.number().int().min(1000).max(15000).nullable(),
  beatRole: z
    .enum(['hook', 'problem', 'proof', 'feature', 'benefit', 'cta'])
    .nullable(),
  motion: screenshotMotionSchema.nullable(),
  transition: transitionTypeSchema.nullable(),
  motionIntent: z.string().max(160).nullable(),
});

export const storyboardResponseSchema = z.object({
  stylePreset: stylePresetSchema.nullable(),
  creativeDirection: z
    .object({
      audience: z.string().max(120).nullable(),
      channel: z.string().max(80).nullable(),
      tone: z.string().max(120).nullable(),
      coreMessage: z.string().max(180).nullable(),
      qualityNotes: z.array(z.string().max(160)).max(5).nullable(),
    })
    .nullable(),
  scenes: z.array(llmStoryboardSceneSchema).nullable(),
  soundDesign: z
    .object({
      decision: z.enum(['include', 'silence']),
      rationale: z.string().min(1).max(500),
      profile: soundDesignProfileSchema.nullable(),
      masterVolume: z.number().min(0).max(0.8).nullable(),
      cues: z
        .array(
          z.object({
            sceneIndex: z.number().int().min(0),
            soundId: z.enum(MOTION_SOUND_IDS),
            offsetMs: z.number().int().min(-1200).max(5000).nullable(),
            volume: z.number().min(0).max(0.85).nullable(),
            intensity: z.number().min(0).max(1).nullable(),
            rationale: z.string().max(240).nullable(),
          }),
        )
        .max(12)
        .nullable(),
    })
    .nullable(),
});

export type StoryboardResponse = z.infer<typeof storyboardResponseSchema>;
