import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import type { ZodType } from 'zod';

export type ToolChatResult = {
  message: string;
  toolName?: string;
  toolArgs?: string;
};

@Injectable()
export class OpenAiService {
  private readonly logger = new Logger(OpenAiService.name);
  private client: OpenAI | null = null;

  isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  private getModel(): string {
    return process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
  }

  async completeStructured<T>(
    schema: ZodType<T>,
    schemaName: string,
    messages: ChatCompletionMessageParam[],
    options?: { temperature?: number },
  ): Promise<T> {
    try {
      const completion = await this.getClient().chat.completions.parse({
        model: this.getModel(),
        messages,
        temperature: options?.temperature ?? 0.4,
        response_format: zodResponseFormat(schema, schemaName),
      });

      const message = completion.choices[0]?.message;
      if (message?.refusal) {
        throw new Error(`OpenAI refused: ${message.refusal}`);
      }
      if (!message?.parsed) {
        throw new Error('OpenAI returned empty parsed content');
      }

      return message.parsed;
    } catch (error) {
      this.logger.warn(
        `OpenAI structured completion failed: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw error;
    }
  }

  async completeWithTools(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionTool[],
    options?: { temperature?: number },
  ): Promise<ToolChatResult> {
    try {
      const completion = await this.getClient().chat.completions.create({
        model: this.getModel(),
        messages,
        tools,
        temperature: options?.temperature ?? 0.4,
      });

      const choice = completion.choices[0]?.message;
      const toolCall = choice?.tool_calls?.[0];

      return {
        message: choice?.content ?? '',
        toolName: toolCall?.type === 'function' ? toolCall.function.name : undefined,
        toolArgs:
          toolCall?.type === 'function' ? toolCall.function.arguments : undefined,
      };
    } catch (error) {
      this.logger.warn(
        `OpenAI tool completion failed: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw error;
    }
  }

  async streamChatWithTools(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionTool[],
    onToken: (token: string) => void,
    options?: { temperature?: number },
  ): Promise<ToolChatResult> {
    try {
      const stream = await this.getClient().chat.completions.create({
        model: this.getModel(),
        messages,
        tools,
        stream: true,
        temperature: options?.temperature ?? 0.4,
      });

      let message = '';
      const toolCalls: Record<
        number,
        { id: string; name: string; arguments: string }
      > = {};

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          message += delta.content;
          onToken(delta.content);
        }

        if (delta?.tool_calls) {
          for (const toolCall of delta.tool_calls) {
            const index = toolCall.index;
            if (!toolCalls[index]) {
              toolCalls[index] = {
                id: toolCall.id ?? '',
                name: '',
                arguments: '',
              };
            }
            if (toolCall.function?.name) {
              toolCalls[index].name = toolCall.function.name;
            }
            if (toolCall.function?.arguments) {
              toolCalls[index].arguments += toolCall.function.arguments;
            }
          }
        }
      }

      const firstTool = toolCalls[0];
      return {
        message,
        toolName: firstTool?.name || undefined,
        toolArgs: firstTool?.arguments || undefined,
      };
    } catch (error) {
      this.logger.warn(
        `OpenAI stream failed: ${
          error instanceof Error ? error.message : error
        }`,
      );
      throw error;
    }
  }
}
