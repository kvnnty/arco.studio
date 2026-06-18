import { Suspense } from "react";

import { EditorPage } from "@/components/editor/editor-page";

export const metadata = {
  title: "Editor — Arco",
  description: "Upload a screen recording and add motion design.",
};

export default function EditorRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <EditorPage />
    </Suspense>
  );
}
