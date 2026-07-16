import {
  chatActionSchema,
  parseChatActionFromTool,
} from './chat-action.schema';

describe('chatActionSchema', () => {
  it('accepts valid refine_all_copy action', () => {
    const result = chatActionSchema.safeParse({
      type: 'refine_all_copy',
      instruction: 'Make headlines shorter',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid update_style_preset action', () => {
    const result = chatActionSchema.safeParse({
      type: 'update_style_preset',
      stylePreset: 'linear',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid stylePreset', () => {
    const result = chatActionSchema.safeParse({
      type: 'update_style_preset',
      stylePreset: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative markerIndex', () => {
    const result = chatActionSchema.safeParse({
      type: 'delete_marker',
      markerIndex: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects refine_all_copy without instruction', () => {
    const result = chatActionSchema.safeParse({
      type: 'refine_all_copy',
    });
    expect(result.success).toBe(false);
  });
});

describe('parseChatActionFromTool', () => {
  it('returns reply when no tool is called', () => {
    expect(parseChatActionFromTool(undefined, undefined)).toEqual({
      type: 'reply',
    });
  });

  it('parses refine_all_copy tool args', () => {
    expect(
      parseChatActionFromTool(
        'refine_all_copy',
        JSON.stringify({ instruction: 'Be more technical' }),
      ),
    ).toEqual({
      type: 'refine_all_copy',
      instruction: 'Be more technical',
    });
  });

  it('parses regenerate_marker tool args', () => {
    expect(
      parseChatActionFromTool(
        'regenerate_marker',
        JSON.stringify({ markerIndex: 2 }),
      ),
    ).toEqual({
      type: 'regenerate_marker',
      markerIndex: 2,
    });
  });

  it('falls back to reply on invalid JSON', () => {
    expect(parseChatActionFromTool('refine_all_copy', 'not-json')).toEqual({
      type: 'reply',
    });
  });

  it('falls back to reply on invalid args', () => {
    expect(
      parseChatActionFromTool(
        'update_style_preset',
        JSON.stringify({ stylePreset: 'unknown' }),
      ),
    ).toEqual({
      type: 'reply',
    });
  });
});
