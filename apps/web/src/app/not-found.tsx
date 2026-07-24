import type { Metadata } from "next";

import { NotFoundContent } from "@/components/errors/error-boundary";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return <NotFoundContent context="root" />;
}
