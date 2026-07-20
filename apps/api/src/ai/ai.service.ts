import { Injectable, Logger } from '@nestjs/common';
import type {
  ArcoProject,
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
import { buildChatMessages, EDITOR_CHAT_TOOLS } from './chat-tools';
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
import { OpenAiService } from './openai.service';
import { parseChatActionFromTool } from './schemas/chat-action.schema';
import { draftResponseSchema } from './schemas/draft-response.schema';
import { markerRegenSchema } from './schemas/marker-regen.schema';
import { refineResponseSchema } from './schemas/refine-response.schema';
import { storyboardResponseSchema } from './schemas/storyboard-response.schema';

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

  constructor(private readonly openAi: OpenAiService) {}

  async generateDraft(dto: GenerateDraftDto): Promise<{
    markers: Marker[];
    stylePreset: StylePreset;
    source: 'llm' | 'heuristic';
  }> {
    if (this.openAi.isConfigured()) {
      try {
        const llmResult = await this.generateWithLlm(dto);
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
      'Return markers with startMs, durationMs, label, callout, and clickEffect fields.',
    ]
      .filter(Boolean)
      .join('\n');

    const systemContent = dto.templateContext
      ? `You write on-screen text for SaaS launch videos following the "${dto.templateContext.name}" template. ${dto.templateContext.copyTone} Match the template scene structure and copy rhythm. No hype clichés.`
      : 'You write on-screen text for SaaS launch videos. Tone: confident, minimal, devtool audience. No hype clichés.';

    const parsed = await this.openAi.completeStructured(
      draftResponseSchema,
      'draft',
      [
        { role: 'system', content: systemContent },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.4 },
    );

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
    if (this.openAi.isConfigured()) {
      try {
        const result = await this.regenerateMarkerWithLlm(dto);
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
    ]
      .filter(Boolean)
      .join('\n');

    const parsed = await this.openAi.completeStructured(
      markerRegenSchema,
      'marker_regen',
      [
        {
          role: 'system',
          content:
            'You write on-screen text for SaaS launch videos. Tone: confident, minimal. No hype clichés.',
        },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5 },
    );

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
    scenes?: Array<{
      headline?: string;
      subheadline?: string;
      voScript?: string;
    }>;
    source: 'llm' | 'heuristic';
  }> {
    if (dto.scenes && dto.scenes.length > 0) {
      if (this.openAi.isConfigured()) {
        try {
          const result = await this.refineScenesWithLlm(dto);
          return { markers: [], scenes: result.scenes, source: 'llm' };
        } catch (error) {
          this.logger.warn(
            `LLM scene refine failed, using heuristic: ${
              error instanceof Error ? error.message : error
            }`,
          );
        }
      }
      return {
        markers: [],
        scenes: this.heuristicRefineScenes(dto),
        source: 'heuristic',
      };
    }

    if (this.openAi.isConfigured()) {
      try {
        const result = await this.refineProjectWithLlm(dto);
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

  private heuristicRefineScenes(
    dto: RefineProjectDto,
  ): Array<{
    headline?: string;
    subheadline?: string;
    voScript?: string;
  }> {
    const instruction = dto.instruction.toLowerCase();
    return (dto.scenes ?? []).map((scene) => {
      let headline = scene.headline ?? 'Scene headline';
      let subheadline = scene.subheadline;
      let voScript = scene.voScript ?? headline;

      if (instruction.includes('shorter')) {
        headline = headline.split(/\s+/).slice(0, 5).join(' ');
        subheadline = subheadline?.split(/\s+/).slice(0, 6).join(' ');
        voScript = voScript.split(/\s+/).slice(0, 12).join(' ');
      } else if (instruction.includes('technical')) {
        headline = headline.replace(
          /instantly|beautiful|amazing/gi,
          'programmatically',
        );
        voScript = voScript.replace(
          /instantly|beautiful|amazing/gi,
          'programmatically',
        );
      } else if (instruction.includes('bold')) {
        headline = headline.toUpperCase();
      } else if (
        instruction.includes('cta') ||
        instruction.includes('stronger')
      ) {
        headline = headline.replace(/\.*$/, '');
        if (!/try|start|get|join|book/i.test(headline)) {
          headline = `${headline}. Start free`;
        }
        voScript = `${voScript} Ready to get started?`;
      }

      return { headline, subheadline, voScript };
    });
  }

  private async refineScenesWithLlm(
    dto: RefineProjectDto,
  ): Promise<{
    scenes: Array<{
      headline?: string;
      subheadline?: string;
      voScript?: string;
    }>;
  }> {
    const scenes = (dto.scenes ?? [])
      .map(
        (scene, index) =>
          `${index + 1}. headline="${scene.headline ?? ''}" sub="${scene.subheadline ?? ''}" vo="${scene.voScript ?? ''}"`,
      )
      .join('\n');

    const userPrompt = [
      `Product title: ${dto.title}`,
      dto.intent ? `Video intent: ${dto.intent}` : null,
      dto.productUrl ? `Product URL: ${dto.productUrl}` : null,
      `Instruction: ${dto.instruction}`,
      'Current screenshot scenes:',
      scenes,
      'Return the same number of scenes with updated headline, subheadline, and voScript.',
    ]
      .filter(Boolean)
      .join('\n');

    const parsed = await this.openAi.completeStructured(
      refineResponseSchema,
      'refine',
      [
        {
          role: 'system',
          content:
            'You refine screenshot storyboard copy for SaaS launch videos. Keep headlines concise. voScript should be speakable narration (1-2 sentences).',
        },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5 },
    );

    return {
      scenes: (parsed.scenes ?? []).map((scene, index) => {
        const fallback = dto.scenes?.[index];
        return {
          headline: scene.headline ?? fallback?.headline,
          subheadline: scene.subheadline ?? fallback?.subheadline,
          voScript: scene.voScript ?? fallback?.voScript ?? scene.headline,
        };
      }),
    };
  }

  private heuristicRefineProject(
    dto: RefineProjectDto,
  ): Array<{ callout: { text: string; subtext?: string }; label?: string }> {
    const instruction = dto.instruction.toLowerCase();

    return (dto.markers ?? []).map((marker) => {
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
  ): Promise<{
    markers: Array<{
      callout: { text: string; subtext?: string };
      label?: string;
    }>;
  }> {
    const scenes = (dto.markers ?? [])
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
      'Return the same number of markers in the same order with updated callout and label fields.',
    ]
      .filter(Boolean)
      .join('\n');

    const parsed = await this.openAi.completeStructured(
      refineResponseSchema,
      'refine',
      [
        {
          role: 'system',
          content:
            'You refine on-screen copy for SaaS launch videos. Keep headlines concise.',
        },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.5 },
    );

    const markers = (parsed.markers ?? []).map((marker, index) => {
      const fallback = dto.markers?.[index];
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
    if (this.openAi.isConfigured()) {
      try {
        const result = await this.chatWithLlm(dto);
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
      (dto.project.selectedMarkerIndex !== undefined ||
        dto.project.selectedSceneIndex !== undefined)
    ) {
      return {
        action: {
          type: 'regenerate_marker',
          markerIndex:
            dto.project.selectedSceneIndex ?? dto.project.selectedMarkerIndex,
        },
        message: 'Regenerating the selected scene.',
      };
    }

    if (
      lower.includes('add scene') &&
      dto.project.playheadMs !== undefined &&
      dto.project.projectMode !== 'screenshots'
    ) {
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
        'Try “Make headlines shorter”, “More bold”, or “Regenerate selected scene”.',
    };
  }

  private async chatWithLlm(
    dto: ChatDto,
  ): Promise<{ action: Record<string, unknown>; message: string }> {
    const messages = buildChatMessages(dto);
    const result = await this.openAi.completeWithTools(
      messages,
      EDITOR_CHAT_TOOLS,
      { temperature: 0.4 },
    );

    return {
      action: parseChatActionFromTool(result.toolName, result.toolArgs),
      message: result.message.trim() || 'Done.',
    };
  }

  async streamChat(
    dto: ChatDto,
    onChunk: (chunk: {
      token?: string;
      action?: Record<string, unknown>;
    }) => void,
  ): Promise<void> {
    if (!this.openAi.isConfigured()) {
      const result = await this.heuristicChat(dto);
      if (result.message) {
        onChunk({ token: result.message });
      }
      onChunk({ action: result.action });
      return;
    }

    try {
      const messages = buildChatMessages(dto);
      const result = await this.openAi.streamChatWithTools(
        messages,
        EDITOR_CHAT_TOOLS,
        (token) => onChunk({ token }),
        { temperature: 0.4 },
      );

      onChunk({
        action: parseChatActionFromTool(result.toolName, result.toolArgs),
      });
    } catch (error) {
      this.logger.warn(
        `LLM stream failed, using heuristic: ${
          error instanceof Error ? error.message : error
        }`,
      );
      const fallback = this.heuristicChat(dto);
      if (fallback.message) {
        onChunk({ token: fallback.message });
      }
      onChunk({ action: fallback.action });
    }
  }

  async generateStoryboard(dto: GenerateStoryboardDto): Promise<{
    scenes: ScreenshotScene[];
    stylePreset: StylePreset;
    creativeDirection?: ArcoProject['creativeDirection'];
    source: 'llm' | 'heuristic';
  }> {
    const targetDurationMs = dto.targetDurationMs ?? 45000;

    if (this.openAi.isConfigured()) {
      try {
        const llmScenes = await this.generateStoryboardWithLlm(
          dto,
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
    creativeDirection?: ArcoProject['creativeDirection'];
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
        beatRole:
          index === 0
            ? ('hook' as const)
            : index === dto.imageUrls.length - 1
              ? ('cta' as const)
              : index % 2 === 0
                ? ('benefit' as const)
                : ('feature' as const),
        motionIntent:
          index === 0
            ? 'Establish the product promise before revealing detail.'
            : 'Keep the product UI legible while advancing one message.',
      };
    });

    return {
      scenes,
      stylePreset: 'startup',
      creativeDirection: {
        audience: 'Product evaluators',
        channel: 'Website and social launch',
        tone: 'Clear, assured, product-led',
        coreMessage: intent ?? dto.title,
        qualityNotes: [
          'Keep the real interface legible.',
          'Use one visual idea per beat.',
          'End on a concrete CTA.',
        ],
      },
      source: 'heuristic',
    };
  }

  private async generateStoryboardWithLlm(
    dto: GenerateStoryboardDto,
    targetDurationMs: number,
  ): Promise<{
    scenes: ScreenshotScene[];
    stylePreset: StylePreset;
    creativeDirection?: ArcoProject['creativeDirection'];
  }> {
    const intent = dto.intent ?? dto.brief?.intent;
    const productUrl = dto.productUrl ?? dto.brief?.productUrl;
    const template = dto.templateId ? getTemplate(dto.templateId) : undefined;

    const userPrompt = [
      `Product title: ${dto.title}`,
      intent ? `Video intent: ${intent}` : null,
      productUrl ? `Product URL: ${productUrl}` : null,
      template ? `Template: ${template.name} - ${template.copyTone}` : null,
      `Screenshot count: ${dto.imageUrls.length}`,
      `Target total durationMs: ${targetDurationMs}`,
      'Act like a motion designer receiving a client kickoff pack.',
      'Infer audience, channel, tone, core message, and quality notes before writing scenes.',
      'Each screenshot is product truth. Do not invent UI states, features, numbers, customers, or claims that are not implied by the brief/title/URL.',
      'Every scene must have one clear beatRole and one visual job. Avoid two competing ideas in the same scene.',
      'Headlines: 3-7 words, specific, no generic hype. Avoid: seamless, revolutionary, game-changing, unlock, supercharge, beautiful, amazing.',
      'Subheadlines: optional, concrete, <= 12 words.',
      'voScript: speakable narration, 1 sentence unless a CTA needs 2. It can differ from on-screen copy.',
      'motionIntent: explain what the viewer should notice first and why.',
      'Choose motion and transition intentionally; avoid fade for every scene.',
      `Generate exactly ${dto.imageUrls.length} scenes, one per screenshot in order.`,
    ]
      .filter(Boolean)
      .join('\n');

    const parsed = await this.openAi.completeStructured(
      storyboardResponseSchema,
      'storyboard',
      [
        {
          role: 'system',
          content:
            'You are a senior motion designer for SaaS and product-owner websites. Build premium product videos from real screenshots. Your job is story, hierarchy, timing, motion restraint, and clean delivery. No AI slop, no vague hype, no hallucinated product claims.',
        },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.3 },
    );

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
        motion: llmScene?.motion ?? motions[index % motions.length],
        transition: {
          type:
            llmScene?.transition ??
            (index === 0
              ? 'fade'
              : index % 3 === 0
                ? 'push'
                : index % 2 === 0
                  ? 'scale'
                  : 'slide'),
        },
        beatRole: llmScene?.beatRole,
        motionIntent: llmScene?.motionIntent,
      };
    });

    return {
      scenes,
      stylePreset: normalizeStylePreset(parsed.stylePreset),
      creativeDirection: parsed.creativeDirection,
    };
  }
}
