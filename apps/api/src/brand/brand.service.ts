import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as cheerio from 'cheerio';
import { AnalyzeUrlDto } from './dto/analyze-url.dto.js';
import { assertSafePublicUrl } from './url-guard.js';

export type BrandKitResult = {
  url: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
  logoUrl?: string;
  pageContent?: string;
  pageContentChars?: number;
  colors: { primary: string; background: string };
  tone?: 'technical' | 'consumer' | 'enterprise';
  source: 'scrape' | 'fallback';
};

const DEFAULT_COLORS = {
  primary: '#55b3ff',
  background: '#07080a',
};

@Injectable()
export class BrandService {
  private readonly logger = new Logger(BrandService.name);

  async analyzeUrl(dto: AnalyzeUrlDto): Promise<BrandKitResult> {
    const parsed = assertSafePublicUrl(dto.url);

    try {
      const html = await this.fetchHtml(parsed.toString());
      return this.parseBrandKit(parsed.toString(), html);
    } catch (error) {
      this.logger.warn(
        `Brand scrape failed for ${parsed.hostname}: ${
          error instanceof Error ? error.message : error
        }`,
      );
      return {
        url: parsed.toString(),
        colors: DEFAULT_COLORS,
        tone: 'technical',
        source: 'fallback',
      };
    }
  }

  private async fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; ArcoBot/1.0; +https://arco.app)',
          Accept: 'text/html,application/xhtml+xml',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new BadRequestException(
          `Could not fetch URL (HTTP ${response.status})`,
        );
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('text/html')) {
        throw new BadRequestException('URL did not return HTML content');
      }

      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseBrandKit(url: string, html: string): BrandKitResult {
    const $ = cheerio.load(html);
    const baseUrl = new URL(url);

    const meta = (name: string) =>
      $(`meta[name="${name}"]`).attr('content')?.trim() ||
      $(`meta[property="${name}"]`).attr('content')?.trim();

    const title =
      meta('og:title') ||
      $('title').first().text().trim() ||
      undefined;

    const description =
      meta('og:description') ||
      meta('description') ||
      undefined;

    const ogImage = meta('og:image');
    const themeColor = meta('theme-color');

    const bodyText = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 4000);
    const pageContent = bodyText || description || title || undefined;

    const faviconHref =
      $('link[rel="apple-touch-icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href');

    const screenshotUrl = ogImage ? this.resolveUrl(baseUrl, ogImage) : undefined;
    const logoUrl = faviconHref
      ? this.resolveUrl(baseUrl, faviconHref)
      : screenshotUrl;

    const colors = this.deriveColors(themeColor);
    const tone = this.inferTone(title, description);

    return {
      url,
      title,
      description,
      screenshotUrl,
      logoUrl,
      pageContent,
      pageContentChars: pageContent?.length,
      colors,
      tone,
      source: 'scrape',
    };
  }

  private resolveUrl(base: URL, href: string): string {
    try {
      return new URL(href, base).toString();
    } catch {
      return href;
    }
  }

  private deriveColors(themeColor?: string): {
    primary: string;
    background: string;
  } {
    if (themeColor && this.isHexColor(themeColor)) {
      const primary = this.normalizeHex(themeColor);
      return {
        primary,
        background: this.darkenForBackground(primary),
      };
    }
    return DEFAULT_COLORS;
  }

  private isHexColor(value: string): boolean {
    return /^#?[0-9a-fA-F]{3,8}$/.test(value.trim());
  }

  private normalizeHex(value: string): string {
    const trimmed = value.trim();
    if (trimmed.startsWith('#')) return trimmed.slice(0, 7);
    return `#${trimmed.slice(0, 6)}`;
  }

  private darkenForBackground(hex: string): string {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return DEFAULT_COLORS.background;
    const r = Math.floor(parseInt(normalized.slice(0, 2), 16) * 0.08);
    const g = Math.floor(parseInt(normalized.slice(2, 4), 16) * 0.08);
    const b = Math.floor(parseInt(normalized.slice(4, 6), 16) * 0.08);
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
  }

  private inferTone(
    title?: string,
    description?: string,
  ): 'technical' | 'consumer' | 'enterprise' {
    const text = `${title ?? ''} ${description ?? ''}`.toLowerCase();
    if (
      /developer|api|sdk|devtools|engineering|infrastructure|open source/.test(
        text,
      )
    ) {
      return 'technical';
    }
    if (/enterprise|compliance|security|fortune|teams at scale/.test(text)) {
      return 'enterprise';
    }
    return 'consumer';
  }
}
