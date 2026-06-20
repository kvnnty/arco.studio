import type { StylePreset } from "@arco/project-schema";
import type { BrandKit } from "@/app/actions/brand";

export function toneToStylePreset(
  tone?: BrandKit["tone"],
): StylePreset | undefined {
  if (tone === "technical") return "linear";
  if (tone === "enterprise") return "stripe";
  if (tone === "consumer") return "apple";
  return "startup";
}

export function mergeBrandIntoProject(
  project: import("@arco/project-schema").ArcoProject,
  kit: BrandKit,
): import("@arco/project-schema").ArcoProject {
  return {
    ...project,
    brand: {
      primary: kit.colors.primary,
      background: kit.colors.background,
      logoSrc: kit.logoUrl,
    },
    brief: {
      ...project.brief,
      productUrl: project.brief?.productUrl ?? kit.url,
      intent: project.brief?.intent ?? kit.description,
    },
  };
}
