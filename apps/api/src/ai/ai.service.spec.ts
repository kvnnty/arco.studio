import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { OpenAiService } from './openai.service';
import { draftResponseSchema } from './schemas/draft-response.schema';

describe('AiService', () => {
  let service: AiService;
  let openAi: {
    isConfigured: jest.Mock;
    completeStructured: jest.Mock;
    completeWithTools: jest.Mock;
    streamChatWithTools: jest.Mock;
  };

  beforeEach(async () => {
    openAi = {
      isConfigured: jest.fn().mockReturnValue(true),
      completeStructured: jest.fn(),
      completeWithTools: jest.fn(),
      streamChatWithTools: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: OpenAiService,
          useValue: openAi,
        },
      ],
    }).compile();

    service = module.get(AiService);
  });

  it('maps structured draft response through scenesToMarkers', async () => {
    openAi.completeStructured.mockResolvedValue({
      stylePreset: 'startup',
      markers: [
        {
          startMs: 0,
          durationMs: 4000,
          label: 'Intro',
          callout: { text: 'Ship faster' },
          clickEffect: 'ripple',
        },
      ],
    });

    const result = await service.generateDraft({
      title: 'Arco',
      durationMs: 30_000,
    });

    expect(openAi.completeStructured).toHaveBeenCalledWith(
      draftResponseSchema,
      'draft',
      expect.any(Array),
      { temperature: 0.4 },
    );
    expect(result.source).toBe('llm');
    expect(result.markers).toHaveLength(1);
    expect(result.markers[0]?.callout?.text).toBe('Ship faster');
    expect(result.stylePreset).toBe('startup');
  });

  it('falls back to heuristic draft when LLM fails', async () => {
    openAi.completeStructured.mockRejectedValue(new Error('OpenAI down'));

    const result = await service.generateDraft({
      title: 'Arco',
      durationMs: 30_000,
    });

    expect(result.source).toBe('heuristic');
    expect(result.markers.length).toBeGreaterThan(0);
  });

  it('uses tool calls for non-stream chat', async () => {
    openAi.completeWithTools.mockResolvedValue({
      message: 'Updating copy across all scenes.',
      toolName: 'refine_all_copy',
      toolArgs: JSON.stringify({ instruction: 'Make shorter' }),
    });

    const result = await service.chat({
      projectId: 'proj-1',
      message: 'Make headlines shorter',
      project: {
        title: 'Arco',
        durationMs: 30_000,
        markers: [],
      },
    });

    expect(result.source).toBe('llm');
    expect(result.action).toEqual({
      type: 'refine_all_copy',
      instruction: 'Make shorter',
    });
    expect(result.message).toBe('Updating copy across all scenes.');
  });

  it('streams tokens and emits parsed action', async () => {
    openAi.streamChatWithTools.mockImplementation(
      async (
        _messages: unknown,
        _tools: unknown,
        onToken: (token: string) => void,
      ) => {
        onToken('Working');
        onToken(' on it.');
        return {
          message: 'Working on it.',
          toolName: 'add_marker_at_ms',
          toolArgs: JSON.stringify({ startMs: 5000 }),
        };
      },
    );

    const chunks: Array<{ token?: string; action?: Record<string, unknown> }> =
      [];

    await service.streamChat(
      {
        projectId: 'proj-1',
        message: 'Add scene here',
        project: {
          title: 'Arco',
          durationMs: 30_000,
          markers: [],
          playheadMs: 5000,
        },
      },
      (chunk) => chunks.push(chunk),
    );

    expect(chunks).toEqual([
      { token: 'Working' },
      { token: ' on it.' },
      { action: { type: 'add_marker_at_ms', startMs: 5000 } },
    ]);
  });
});
