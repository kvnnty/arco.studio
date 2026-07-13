import { markerCalloutSchema } from '@arco/project-schema';
import { z } from 'zod';

export const refineMarkerSchema = z.object({
  callout: markerCalloutSchema.optional(),
  label: z.string().max(80).optional(),
});

export const refineSceneSchema = z.object({
  headline: z.string().max(120).optional(),
  subheadline: z.string().max(200).optional(),
  voScript: z.string().max(500).optional(),
});

export const refineResponseSchema = z.object({
  markers: z.array(refineMarkerSchema).optional(),
  scenes: z.array(refineSceneSchema).optional(),
});

export type RefineResponse = z.infer<typeof refineResponseSchema>;
