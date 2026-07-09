import { Test, TestingModule } from '@nestjs/testing';
import { z } from 'zod';
import { OpenAiService } from './openai.service';

const testSchema = z.object({
  message: z.string(),
});

describe('OpenAiService', () => {
  let service: OpenAiService;
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(async () => {
    process.env.OPENAI_API_KEY = 'test-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAiService],
    }).compile();

    service = module.get(OpenAiService);
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  });

  it('reports configured when API key is set', () => {
    expect(service.isConfigured()).toBe(true);
  });

  it('streams tokens before returning tool call metadata', async () => {
    const tokens: string[] = [];

    async function* mockStream() {
      yield {
        choices: [{ delta: { content: 'Updating ' } }],
      };
      yield {
        choices: [{ delta: { content: 'copy.' } }],
      };
      yield {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_1',
                  function: { name: 'refine_all_copy', arguments: '' },
                },
              ],
            },
          },
        ],
      };
      yield {
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  index: 0,
                  function: {
                    arguments: JSON.stringify({
                      instruction: 'Make shorter',
                    }),
                  },
                },
              ],
            },
          },
        ],
      };
    }

    const client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(mockStream()),
          parse: jest.fn(),
        },
      },
    };

    (service as unknown as { client: unknown }).client = client;

    const result = await service.streamChatWithTools(
      [{ role: 'user', content: 'Make headlines shorter' }],
      [],
      (token) => tokens.push(token),
    );

    expect(tokens).toEqual(['Updating ', 'copy.']);
    expect(result.message).toBe('Updating copy.');
    expect(result.toolName).toBe('refine_all_copy');
    expect(result.toolArgs).toBe(
      JSON.stringify({ instruction: 'Make shorter' }),
    );
  });

  it('parses structured responses via completeStructured', async () => {
    const client = {
      chat: {
        completions: {
          create: jest.fn(),
          parse: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  parsed: { message: 'Hello' },
                },
              },
            ],
          }),
        },
      },
    };

    (service as unknown as { client: unknown }).client = client;

    const parsed = await service.completeStructured(
      testSchema,
      'test',
      [{ role: 'user', content: 'Hi' }],
    );

    expect(parsed).toEqual({ message: 'Hello' });
  });
});
