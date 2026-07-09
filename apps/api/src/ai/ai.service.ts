import { Injectable, Logger } from '@nestjs/common';
import type {
  ClickEffect,
  Marker,
  ScreenshotScene,
  StylePreset,
} from '@arco/project-schema';
import {
  createScreenshotPendingProject,
  spokenScriptFromScene,
} from '@arco/project-schema';
import {
  applyTemplateBlueprint,
  applyTemplateToScreenshotProject,
  getTemplate,
  mergeTemplateMotionOntoMarkers,
} from '@arco/project-schema/templates';
import { GenerateDraftDto } from './dto/generate-draft.dto';
import { GenerateStoryboardDto } from './dto/generate-storyboard.dto';
import { RegenerateMarkerDto } from './dto/regenerate-marker.dto';
import { RefineProjectDto } from './dto/refine-project.dto';
import { ChatDto } from './dto/chat.dto';
import {
  generateHeuristicDraftMarkers,
  normalizeStylePreset,
  scenesToMarkers,
} from './draft-heuristic';

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

    return this.heuristicDraft(dto);
  }

  private heuristicDraft(dto: GenerateDraftDto): {
    markers: Marker[];
    stylePreset: StylePreset;
    source: 'heuristic';
  } {
    if (dto.templateId) {
      const template = getTemplate(dto.templateId);
      if (template) {
        return {
          markers: applyTemplateBlueprint(template, dto.durationMs, dto.title),
          stylePreset: template.stylePreset,
          source: 'heuristic',
        };
      }
    }

    return {
      markers: generateHeuristicDraftMarkers(dto.durationMs),
      stylePreset: normalizeStylePreset(dto.templateContext?.stylePreset),
      source: 'heuristic',
    };
  }

  private async generateWithLlm(
    dto: GenerateDraftDto,
    apiKey: string,
  ): Promise<{ markers: Marker[]; stylePreset: StylePreset }> {
    const sceneCount = dto.templateContext?.sceneCount
      ? dto.templateContext.sceneCount
      : Math.min(5, Math.max(2, Math.floor(dto.durationMs / 8000)));

    const templateLines = dto.templateContext
      ? [
          `Video template: ${dto.templateContext.name}`,
          `Template copy tone: ${dto.templateContext.copyTone}`,
          `Template style preset: ${dto.templateContext.stylePreset}`,
          `Scene copy hints: ${dto.templateContext.sceneHints.join(' | ')}`,
          `Generate exactly ${sceneCount} markers matching this template structure.`,
        ]
      : [`Generate ${sceneCount} markers evenly spaced across the timeline.`];

    const userPrompt = [
      `Product title: ${dto.title}`,
      dto.intent ? `Video intent: ${dto.intent}` : null,
      dto.productUrl ? `Product URL: ${dto.productUrl}` : null,
      dto.brandContext?.title ? `Site title: ${dto.brandContext.title}` : null,
      dto.brandContext?.description
        ? `Site description: ${dto.brandContext.description}`
        : null,
      dto.brandContext?.tone ? `Brand tone: ${dto.brandContext.tone}` : null,
      dto.platform ? `Platform: ${dto.platform}` : null,
      `Recording durationMs: ${dto.durationMs}`,
      ...templateLines,
      'Return JSON: { "stylePreset": "startup"|"linear"|"stripe"|"apple", "markers": [{ "startMs", "durationMs", "label", "callout": { "text", "subtext?" }, "clickEffect": "ripple"|"zoom"|"spotlight"|"pulse"|"glow"|"none" }] }',
    ]
      .filter(Boolean)
      .join('\n');

    const systemContent = dto.templateContext
      ? `You write on-screen text for SaaS launch videos following the "${dto.templateContext.name}" template. ${dto.templateContext.copyTone} Match the template scene structure and copy rhythm. No hype clichés. Output JSON only.`
      : 'You write on-screen text for SaaS launch videos. Tone: confident, minimal, devtool audience. No hype clichés. Output JSON only.';

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
            content: systemContent,
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
    let markers = scenesToMarkers(
      (parsed.markers ?? []).map((marker) => ({
        ...marker,
        clickEffect: normalizeClickEffect(marker.clickEffect),
      })),
      dto.durationMs,
    );

    if (dto.templateId) {
      const template = getTemplate(dto.templateId);
      if (template) {
        markers = mergeTemplateMotionOntoMarkers(markers, template);
      }
    }

    const stylePreset = dto.templateContext?.stylePreset
      ? normalizeStylePreset(dto.templateContext.stylePreset)
      : normalizeStylePreset(parsed.stylePreset);

    return {
      markers,
      stylePreset,
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
      {
        text: 'See every metric instantly',
        subtext: 'Understand what drives growth',
      },
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

  async refineProject(dto: RefineProjectDto): Promise<{
    markers: Array<{
      callout: { text: string; subtext?: string };
      label?: string;
    }>;
    source: 'llm' | 'heuristic';
  }> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const result = await this.refineProjectWithLlm(dto, apiKey);
        return { ...result, source: 'llm' };
      } catch (error) {
        this.logger.warn(
          `LLM refine failed, using heuristic: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    return {
      markers: this.heuristicRefineProject(dto),
      source: 'heuristic',
    };
  }

  private heuristicRefineProject(
    dto: RefineProjectDto,
  ): Array<{ callout: { text: string; subtext?: string }; label?: string }> {
    const instruction = dto.instruction.toLowerCase();

    return dto.markers.map((marker) => {
      const text = marker.callout?.text ?? marker.label ?? 'Scene headline';
      const subtext = marker.callout?.subtext;

      if (instruction.includes('shorter')) {
        const words = text.split(/\s+/).slice(0, 5).join(' ');
        return {
          callout: {
            text: words,
            subtext: subtext?.split(/\s+/).slice(0, 6).join(' '),
          },
          label: words,
        };
      }

      if (instruction.includes('technical')) {
        const next = text.replace(
          /instantly|beautiful|amazing/gi,
          'programmatically',
        );
        return { callout: { text: next, subtext }, label: next };
      }

      if (instruction.includes('bold')) {
        const next = text.toUpperCase();
        return { callout: { text: next, subtext }, label: next };
      }

      return {
        callout: { text, subtext },
        label: marker.label ?? text,
      };
    });
  }

  private async refineProjectWithLlm(
    dto: RefineProjectDto,
    apiKey: string,
  ): Promise<{
    markers: Array<{
      callout: { text: string; subtext?: string };
      label?: string;
    }>;
  }> {
    const scenes = dto.markers
      .map(
        (marker, index) =>
          `${index + 1}. "${marker.callout?.text ?? marker.label ?? 'Scene'}" at ${marker.startMs}ms`,
      )
      .join('\n');

    const userPrompt = [
      `Product title: ${dto.title}`,
      dto.intent ? `Video intent: ${dto.intent}` : null,
      dto.productUrl ? `Product URL: ${dto.productUrl}` : null,
      `Instruction: ${dto.instruction}`,
      'Current scenes:',
      scenes,
      'Return JSON: { "markers": [{ "callout": { "text", "subtext?" }, "label" }] } — same count and order.',
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
              'You refine on-screen copy for SaaS launch videos. Keep headlines concise. Output JSON only.',
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
      markers?: Array<{
        callout?: { text: string; subtext?: string };
        label?: string;
      }>;
    };

    const markers = (parsed.markers ?? []).map((marker, index) => {
      const fallback = dto.markers[index];
      const text =
        marker.callout?.text ??
        marker.label ??
        fallback?.callout?.text ??
        fallback?.label ??
        'Scene';
      return {
        callout: {
          text,
          subtext: marker.callout?.subtext ?? fallback?.callout?.subtext,
        },
        label: marker.label ?? text,
      };
    });

    return { markers };
  }

  async chat(dto: ChatDto): Promise<{
    action: Record<string, unknown>;
    message: string;
    source: 'llm' | 'heuristic';
  }> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const result = await this.chatWithLlm(dto, apiKey);
        return { ...result, source: 'llm' };
      } catch (error) {
        this.logger.warn(
          `LLM chat failed, using heuristic: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    return {
      ...this.heuristicChat(dto),
      source: 'heuristic',
    };
  }

  private heuristicChat(dto: ChatDto): {
    action: Record<string, unknown>;
    message: string;
  } {
    const lower = dto.message.toLowerCase();

    if (
      lower.includes('shorter') ||
      lower.includes('technical') ||
      lower.includes('bold')
    ) {
      return {
        action: {
          type: 'refine_all_copy',
          instruction: dto.message,
        },
        message: 'Updating copy across all scenes.',
      };
    }

    if (
      lower.includes('regenerate') &&
      dto.project.selectedMarkerIndex !== undefined
    ) {
      return {
        action: {
          type: 'regenerate_marker',
          markerIndex: dto.project.selectedMarkerIndex,
        },
        message: 'Regenerating the selected scene.',
      };
    }

    if (lower.includes('add scene') && dto.project.playheadMs !== undefined) {
      return {
        action: {
          type: 'add_marker_at_ms',
          startMs: Math.round(dto.project.playheadMs),
        },
        message: 'Adding a scene at the playhead.',
      };
    }

    return {
      action: { type: 'reply' },
      message:
        'Try “Make headlines shorter”, “Regenerate selected scene”, or “Add scene here”.',
    };
  }

  private async chatWithLlm(
    dto: ChatDto,
    apiKey: string,
  ): Promise<{ action: Record<string, unknown>; message: string }> {
    const history = (dto.history ?? [])
      .slice(-8)
      .map((item) => ({ role: item.role, content: item.content }));

    const systemPrompt = [
      'You are Arco, an assistant for editing SaaS launch videos from screen recordings.',
      'Respond with JSON only:',
      '{ "action": { "type": "reply"|"refine_all_copy"|"regenerate_marker"|"update_style_preset"|"add_marker_at_ms"|"delete_marker", ...payload }, "message": "short user-facing reply" }',
      'Allowed actions:',
      '- refine_all_copy: { instruction }',
      '- regenerate_marker: { markerIndex }',
      '- update_style_preset: { stylePreset: startup|linear|stripe|apple }',
      '- add_marker_at_ms: { startMs }',
      '- delete_marker: { markerIndex }',
      '- reply: no extra fields',
      `Project: ${JSON.stringify(dto.project)}`,
    ].join('\n');

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
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: dto.message },
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
      action?: Record<string, unknown>;
      message?: string;
    };

    return {
      action: parsed.action ?? { type: 'reply' },
      message: parsed.message ?? 'Done.',
    };
  }

  async streamChat(
    dto: ChatDto,
    onChunk: (chunk: {
      token?: string;
      action?: Record<string, unknown>;
    }) => void,
  ): Promise<void> {
    const result = await this.chat(dto);
    const words = result.message.split(/(\s+)/);

    for (const word of words) {
      onChunk({ token: word });
      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    onChunk({ action: result.action });
  }

  async generateStoryboard(dto: GenerateStoryboardDto): Promise<{
    scenes: ScreenshotScene[];
    stylePreset: StylePreset;
    source: 'llm' | 'heuristic';
  }> {
    const targetDurationMs = dto.targetDurationMs ?? 45000;
    const intent = dto.intent ?? dto.brief?.intent;
    const productUrl = dto.productUrl ?? dto.brief?.productUrl;
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      try {
        const llmScenes = await this.generateStoryboardWithLlm(
          dto,
          apiKey,
          targetDurationMs,
        );
        return { ...llmScenes, source: 'llm' };
      } catch (error) {
        this.logger.warn(
          `LLM storyboard failed, using heuristic fallback: ${
            error instanceof Error ? error.message : error
          }`,
        );
      }
    }

    return this.heuristicStoryboard(dto, targetDurationMs);
  }

  private heuristicStoryboard(
    dto: GenerateStoryboardDto,
    targetDurationMs: number,
  ): {
    scenes: ScreenshotScene[];
    stylePreset: StylePreset;
    source: 'heuristic';
  } {
    if (dto.templateId) {
      const template = getTemplate(dto.templateId);
      if (template) {
        const pending = createScreenshotPendingProject(dto.title);
        const withTemplate = applyTemplateToScreenshotProject(
          pending,
          template,
          dto.imageUrls,
          dto.title,
          targetDurationMs,
        );
        return {
          scenes: withTemplate.scenes ?? [],
          stylePreset: template.stylePreset,
          source: 'heuristic',
        };
      }
    }

    const perSceneMs = Math.max(
      3000,
      Math.round(targetDurationMs / dto.imageUrls.length),
    );
    const intent = dto.intent ?? dto.brief?.intent;

    const scenes: ScreenshotScene[] = dto.imageUrls.map((imageSrc, index) => {
      const headline =
        index === 0
          ? dto.title
          : index === dto.imageUrls.length - 1
            ? 'Start free today'
            : `Feature ${index + 1}`;
      const subheadline = intent?.slice(0, 120);
      return {
        id: `scene-${index}`,
        imageSrc,
        durationMs: perSceneMs,
        headline,
        subheadline,
        voScript: spokenScriptFromScene({
          id: `scene-${index}`,
          imageSrc,
          durationMs: perSceneMs,
          headline,
          subheadline,
          motion: 'ken-burns-in',
        }),
        motion: index % 2 === 0 ? 'ken-burns-in' : 'ken-burns-out',
        transition: { type: 'fade' as const },
      };
    });

    return {
      scenes,
      stylePreset: 'startup',
      source: 'heuristic',
    };
  }

  private async generateStoryboardWithLlm(
    dto: GenerateStoryboardDto,
    apiKey: string,
    targetDurationMs: number,
  ): Promise<{ scenes: ScreenshotScene[]; stylePreset: StylePreset }> {
    const intent = dto.intent ?? dto.brief?.intent;
    const productUrl = dto.productUrl ?? dto.brief?.productUrl;
    const template = dto.templateId ? getTemplate(dto.templateId) : undefined;

    const userPrompt = [
      `Product title: ${dto.title}`,
      intent ? `Video intent: ${intent}` : null,
      productUrl ? `Product URL: ${productUrl}` : null,
      template ? `Template: ${template.name} — ${template.copyTone}` : null,
      `Screenshot count: ${dto.imageUrls.length}`,
      `Target total durationMs: ${targetDurationMs}`,
      'Return JSON: { "stylePreset": "startup"|"linear"|"stripe"|"apple", "scenes": [{ "headline", "subheadline?", "voScript?", "durationMs" }] }',
      `voScript: spoken narration (1-2 sentences). Can differ from on-screen headline.`,
      `Generate exactly ${dto.imageUrls.length} scenes, one per screenshot in order.`,
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
              'You write headlines for SaaS launch videos from app screenshots. Confident, minimal copy. Output JSON only.',
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
      stylePreset?: string;
      scenes?: Array<{
        headline?: string;
        subheadline?: string;
        voScript?: string;
        durationMs?: number;
      }>;
    };

    const motions: ScreenshotScene['motion'][] = [
      'ken-burns-in',
      'ken-burns-out',
      'pan-left',
      'static',
    ];

    const scenes: ScreenshotScene[] = dto.imageUrls.map((imageSrc, index) => {
      const llmScene = parsed.scenes?.[index];
      const defaultMs = Math.max(
        3000,
        Math.round(targetDurationMs / dto.imageUrls.length),
      );

      return {
        id: `scene-${index}`,
        imageSrc,
        durationMs: llmScene?.durationMs ?? defaultMs,
        headline: llmScene?.headline ?? `Scene ${index + 1}`,
        subheadline: llmScene?.subheadline,
        voScript:
          llmScene?.voScript ??
          [llmScene?.headline, llmScene?.subheadline]
            .filter(Boolean)
            .join('. '),
        motion: motions[index % motions.length],
        transition: { type: 'fade' },
      };
    });

    return {
      scenes,
      stylePreset: normalizeStylePreset(parsed.stylePreset),
    };
  }
}
