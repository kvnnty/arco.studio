import type { Metadata } from "next";
import { Geist_Mono, Inter, Figtree } from "next/font/google";

import { ConsentProvider } from "@/components/consent/consent-provider";
import { GoogleConsentDefaultScript } from "@/components/consent/google-consent-default";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "@/lib/auth/session";
import { rootMetadata } from "@/lib/marketing/metadata";

import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <head>
        <GoogleConsentDefaultScript />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <AuthProvider initialSession={session}>
          <QueryProvider>
            <ConsentProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </ConsentProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
