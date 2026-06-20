"use client";

import { Geist_Mono, Figtree } from "next/font/google";

import { ErrorPage } from "@/components/errors/error-page";

import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={figtree.variable}>
      <body
        className={`${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ErrorPage
          code="500"
          title="Application error"
          description="A critical error occurred. Please refresh the page or try again in a moment."
          primaryAction={{
            label: "Try again",
            onClick: reset,
          }}
          secondaryAction={{
            label: "Back to home",
            href: "/",
          }}
        />
      </body>
    </html>
  );
}
