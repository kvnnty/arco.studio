import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPageLayout } from "@/components/marketing/legal/legal-page-layout";
import { getLegalDocument } from "@/lib/marketing/legal";

export const metadata: Metadata = {
  title: "Terms of Service — Arco",
  description: "The terms governing your use of Arco.",
};

export default function TermsPage() {
  const document = getLegalDocument("terms");
  if (!document) notFound();
  return <LegalPageLayout document={document} />;
}
