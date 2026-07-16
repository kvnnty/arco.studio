import { markerCalloutSchema } from '@arco/project-schema';
import { z } from 'zod';

export const markerRegenSchema = z.object({
  callout: markerCalloutSchema,
  label: z.string().max(80).optional(),
});

export type MarkerRegenResponse = z.infer<typeof markerRegenSchema>;
