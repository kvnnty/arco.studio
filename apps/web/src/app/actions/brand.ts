"use server";

import { requireAccessToken } from "@/lib/auth/session";
import { apiAnalyzeBrandUrl } from "@/lib/api/client";

export type BrandKit = {
  url: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
  logoUrl?: string;
  pageContent?: string;
  pageContentChars?: number;
  colors: { primary: string; background: string };
  tone?: "technical" | "consumer" | "enterprise";
  source: "scrape" | "fallback";
};

export async function analyzeBrandUrlAction(url: string): Promise<BrandKit> {
  const token = await requireAccessToken();
  return apiAnalyzeBrandUrl(token, url);
}
