import {
  clickEffectSchema,
  markerCalloutSchema,
  stylePresetSchema,
} from '@arco/project-schema';
import { z } from 'zod';

export const llmDraftMarkerSchema = z.object({
  startMs: z.number().min(0),
  durationMs: z.number().min(100).optional(),
  label: z.string().max(80).optional(),
  callout: markerCalloutSchema.optional(),
  clickEffect: clickEffectSchema.optional(),
});

export const draftResponseSchema = z.object({
  stylePreset: stylePresetSchema.optional(),
  markers: z.array(llmDraftMarkerSchema).optional(),
});

export type DraftResponse = z.infer<typeof draftResponseSchema>;
