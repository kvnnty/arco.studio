import { stylePresetSchema } from '@arco/project-schema';
import { z } from 'zod';

export const chatActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('reply') }),
  z.object({
    type: z.literal('edit_sound_design'),
    profile: z
      .enum([
        'minimal',
        'balanced',
        'energetic',
        'cinematic',
        'playful',
        'futuristic',
        'off',
      ])
      .optional(),
    intensity: z.enum(['softer', 'balanced', 'stronger']).optional(),
    removeCategories: z
      .array(
        z.enum([
          'pop',
          'whoosh',
          'click',
          'impact',
          'riser',
          'glitch',
          'transition',
          'texture',
        ]),
      )
      .optional(),
    instruction: z.string().min(1),
  }),
  z.object({
    type: z.literal('refine_all_copy'),
    instruction: z.string().min(1),
  }),
  z.object({
    type: z.literal('regenerate_marker'),
    markerIndex: z.number().int().min(0),
  }),
  z.object({
    type: z.literal('update_style_preset'),
    stylePreset: stylePresetSchema,
  }),
  z.object({
    type: z.literal('add_marker_at_ms'),
    startMs: z.number().min(0),
  }),
  z.object({
    type: z.literal('delete_marker'),
    markerIndex: z.number().int().min(0),
  }),
]);

export type ChatActionPayload = z.infer<typeof chatActionSchema>;

export function parseChatActionFromTool(
  toolName: string | undefined,
  toolArgs: string | undefined,
): Record<string, unknown> {
  if (!toolName) {
    return { type: 'reply' };
  }

  let parsed: unknown = {};
  if (toolArgs) {
    try {
      parsed = JSON.parse(toolArgs) as unknown;
    } catch {
      return { type: 'reply' };
    }
  }

  const candidate = { type: toolName, ...(parsed as object) };
  const result = chatActionSchema.safeParse(candidate);
  if (!result.success) {
    return { type: 'reply' };
  }

  return result.data as Record<string, unknown>;
}
