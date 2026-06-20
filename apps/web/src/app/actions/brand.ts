"use server";

import { auth } from "@/auth";
import { apiAnalyzeBrandUrl } from "@/lib/api/client";

export type BrandKit = {
  url: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
  logoUrl?: string;
  colors: { primary: string; background: string };
  tone?: "technical" | "consumer" | "enterprise";
  source: "scrape" | "fallback";
};

export async function analyzeBrandUrlAction(url: string): Promise<BrandKit> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("Not authenticated");
  }

  return apiAnalyzeBrandUrl(session.accessToken, url);
}
