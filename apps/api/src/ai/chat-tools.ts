import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const EDITOR_CHAT_TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'refine_all_copy',
      description: 'Refine on-screen copy across all scenes in the project.',
      parameters: {
        type: 'object',
        properties: {
          instruction: {
            type: 'string',
            description: 'What to change about the copy, e.g. make shorter or more technical.',
          },
        },
        required: ['instruction'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'regenerate_marker',
      description: 'Regenerate copy for a single scene by index.',
      parameters: {
        type: 'object',
        properties: {
          markerIndex: {
            type: 'integer',
            description: 'Zero-based index of the scene to regenerate.',
          },
        },
        required: ['markerIndex'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_style_preset',
      description: 'Change the visual style preset for the project.',
      parameters: {
        type: 'object',
        properties: {
          stylePreset: {
            type: 'string',
            enum: ['startup', 'linear', 'stripe', 'apple'],
          },
        },
        required: ['stylePreset'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'add_marker_at_ms',
      description: 'Add a new scene marker at a specific time on the timeline.',
      parameters: {
        type: 'object',
        properties: {
          startMs: {
            type: 'number',
            description: 'Timeline position in milliseconds.',
          },
        },
        required: ['startMs'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'delete_marker',
      description: 'Delete a scene marker by index.',
      parameters: {
        type: 'object',
        properties: {
          markerIndex: {
            type: 'integer',
            description: 'Zero-based index of the scene to delete.',
          },
        },
        required: ['markerIndex'],
        additionalProperties: false,
      },
    },
  },
];

export function buildChatMessages(
  dto: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    project: unknown;
  },
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const history = (dto.history ?? [])
    .slice(-8)
    .map((item) => ({ role: item.role, content: item.content }));

  const systemPrompt = [
    'You are Arco, an assistant for editing SaaS launch videos from screen recordings.',
    'Respond with a short, helpful user-facing message in plain text.',
    'When the user wants to edit the project, call the appropriate tool.',
    'If no edit is needed, reply conversationally without calling a tool.',
    'Available edits: refine_all_copy, regenerate_marker, update_style_preset, add_marker_at_ms, delete_marker.',
    `Project: ${JSON.stringify(dto.project)}`,
  ].join('\n');

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: dto.message },
  ];
}
