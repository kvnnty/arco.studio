import { markerCalloutSchema } from '@arco/project-schema';
import { z } from 'zod';

export const refineMarkerSchema = z.object({
  callout: markerCalloutSchema.optional(),
  label: z.string().max(80).optional(),
});

export const refineResponseSchema = z.object({
  markers: z.array(refineMarkerSchema).optional(),
});

export type RefineResponse = z.infer<typeof refineResponseSchema>;
