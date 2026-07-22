import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Figtree, Geist_Mono, Instrument_Serif, Inter } from "next/font/google";

import { ConsentProvider } from "@/components/consent/consent-provider";
import { GoogleConsentDefaultScript } from "@/components/consent/google-consent-default";
import { NavigationProgress } from "@/components/providers/navigation-progress";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { rootMetadata } from "@/lib/marketing/metadata";

import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = rootMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={cn("font-sans", figtree.variable, instrumentSerif.variable)}
      >
        <head>
          <GoogleConsentDefaultScript />
        </head>
        <body
          className={`${inter.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        >
          <NavigationProgress />
          <QueryProvider>
            <ConsentProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </ConsentProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
