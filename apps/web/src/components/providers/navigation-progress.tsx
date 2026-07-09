"use client";

import NextTopLoader from "nextjs-toploader";

export function NavigationProgress() {
  return (
    <NextTopLoader
      color="var(--primary)"
      height={2}
      showSpinner={false}
      shadow="0 0 8px var(--primary)"
    />
  );
}
