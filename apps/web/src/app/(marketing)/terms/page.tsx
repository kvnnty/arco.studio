import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { getLegalDocument } from "@/lib/marketing/legal";
import { createPageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of Arco.",
  path: "/terms",
});

export default function TermsPage() {
  const document = getLegalDocument("terms");
  if (!document) notFound();
  return <LegalPageLayout document={document} />;
}
