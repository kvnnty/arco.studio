import { Injectable, Logger } from '@nestjs/common';
import type { ClickEffect, Marker, StylePreset } from '@arco/project-schema';
import { GenerateDraftDto } from './dto/generate-draft.dto.js';
import { RegenerateMarkerDto } from './dto/regenerate-marker.dto.js';
import {
  generateHeuristicDraftMarkers,
  normalizeStylePreset,
  scenesToMarkers,
} from './draft-heuristic.js';

type LlmDraftResponse = {
  markers?: Array<{
    startMs: number;
    durationMs?: number;
    label?: string;
    callout?: { text: string; subtext?: string };
    clickEffect?: string;
  }>;
  stylePreset?: string;
};

function normalizeClickEffect(value: unknown): ClickEffect {
  const allowed: ClickEffect[] = [
    'none',
    'ripple',
    'pulse',
    'spotlight',
    'zoom',
    'glow',
  ];
  if (typeof value === 'string' && allowed.includes(value as ClickEffect)) {
    return value as ClickEffect;
  }
  return 'ripple';
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  async generateDraft(dto: GenerateDraftDto): Promise<{
    markers: Marker[];
    stylePreset: StylePreset;
    source: 'llm' | 'heuristic';
  }> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const llmResult = await this.generateWithLlm(dto, apiKey);
        return { ...llmResult, source: 'llm' };
      } catch (error) {
        this.logger.warn(
          `LLM draft failed, using heuristic fallback: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    return {
      markers: generateHeuristicDraftMarkers(dto.durationMs),
      stylePreset: 'startup',
      source: 'heuristic',
    };
  }

  private async generateWithLlm(
    dto: GenerateDraftDto,
    apiKey: string,
  ): Promise<{ markers: Marker[]; stylePreset: StylePreset }> {
    const sceneCount = Math.min(
      5,
      Math.max(2, Math.floor(dto.durationMs / 8000)),
    );

    const userPrompt = [
      `Product title: ${dto.title}`,
      dto.intent ? `Video intent: ${dto.intent}` : null,
      dto.productUrl ? `Product URL: ${dto.productUrl}` : null,
      dto.platform ? `Platform: ${dto.platform}` : null,
      `Recording durationMs: ${dto.durationMs}`,
      `Generate ${sceneCount} markers evenly spaced across the timeline.`,
      'Return JSON: { "stylePreset": "startup"|"linear"|"stripe"|"apple", "markers": [{ "startMs", "durationMs", "label", "callout": { "text", "subtext?" }, "clickEffect": "ripple"|"zoom"|"spotlight"|"pulse"|"glow"|"none" }] }',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You write on-screen text for SaaS launch videos. Tone: confident, minimal, devtool audience. No hype clichés. Output JSON only.',
          },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${body}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    const parsed = JSON.parse(content) as LlmDraftResponse;
    const markers = scenesToMarkers(
      (parsed.markers ?? []).map((marker) => ({
        ...marker,
        clickEffect: normalizeClickEffect(marker.clickEffect),
      })),
      dto.durationMs,
    );

    return {
      markers,
      stylePreset: normalizeStylePreset(parsed.stylePreset),
    };
  }

  async regenerateMarker(dto: RegenerateMarkerDto): Promise<{
    callout: { text: string; subtext?: string };
    label?: string;
    source: 'llm' | 'heuristic';
  }> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const result = await this.regenerateMarkerWithLlm(dto, apiKey);
        return { ...result, source: 'llm' };
      } catch (error) {
        this.logger.warn(
          `LLM marker regen failed, using heuristic: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    return {
      ...this.heuristicRegenerateMarker(dto),
      source: 'heuristic',
    };
  }

  private heuristicRegenerateMarker(dto: RegenerateMarkerDto): {
    callout: { text: string; subtext?: string };
    label?: string;
  } {
    const alternatives = [
      { text: 'See every metric instantly', subtext: 'Understand what drives growth' },
      { text: 'Ship features faster', subtext: 'Built for modern teams' },
      { text: 'Make better decisions', subtext: 'Data you can act on' },
      { text: 'Launch with confidence', subtext: 'Polished from day one' },
      { text: 'Workflows that scale', subtext: 'From startup to enterprise' },
    ];
    const pick = alternatives[dto.markerIndex % alternatives.length]!;

    return {
      callout: pick,
      label: pick.text,
    };
  }

  private async regenerateMarkerWithLlm(
    dto: RegenerateMarkerDto,
    apiKey: string,
  ): Promise<{ callout: { text: string; subtext?: string }; label?: string }> {
    const currentText =
      dto.marker.callout?.text ?? dto.marker.label ?? 'Scene headline';

    const userPrompt = [
      `Product title: ${dto.title}`,
      dto.intent ? `Video intent: ${dto.intent}` : null,
      dto.productUrl ? `Product URL: ${dto.productUrl}` : null,
      `Scene ${dto.markerIndex + 1} of ${dto.markerCount} at ${dto.marker.startMs}ms`,
      `Current headline: "${currentText}"`,
      'Rewrite the on-screen headline and optional subtext for this scene.',
      'Return JSON: { "callout": { "text": "max 8 words", "subtext": "max 12 words optional" }, "label": "short scene label" }',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You write on-screen text for SaaS launch videos. Tone: confident, minimal. No hype clichés. Output JSON only.',
          },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI error ${response.status}: ${body}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned empty content');
    }

    const parsed = JSON.parse(content) as {
      callout?: { text: string; subtext?: string };
      label?: string;
    };

    if (!parsed.callout?.text) {
      throw new Error('Invalid marker regen response');
    }

    return {
      callout: {
        text: parsed.callout.text,
        subtext: parsed.callout.subtext,
      },
      label: parsed.label ?? parsed.callout.text,
    };
  }
}
