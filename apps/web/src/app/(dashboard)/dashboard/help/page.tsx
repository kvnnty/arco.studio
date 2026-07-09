import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const gettingStarted = [
  {
    title: "Upload your first recording",
    description: "Learn how to upload a screen recording and start a project.",
    href: "/dashboard/projects/new",
  },
  {
    title: "Choose a format and style",
    description: "Pick the right aspect ratio and motion preset for your use case.",
    href: "/dashboard/projects/new",
  },
  {
    title: "Export and share",
    description: "Download your finished video and share it with your team.",
    href: "/dashboard/projects",
  },
];

const faqs = [
  {
    q: "What file formats are supported?",
    a: "Arco accepts MP4 and MOV screen recordings up to 500MB.",
  },
  {
    q: "How do credits work?",
    a: "Your plan includes monthly credits. AI actions, voice generation, and exports spend credits. Top up anytime if you need more before your next billing period.",
  },
  {
    q: "Can I edit after generation?",
    a: "Yes — open any project in the editor to adjust scenes, timing, and motion.",
  },
  {
    q: "Is there a team or workspace plan?",
    a: "No. Arco is built for solo founders and product owners — one account, one workspace. No team seats.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <PageHeader
        title="Help & docs"
        description="Get started, find answers, and reach support."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <BookOpen className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Documentation</CardTitle>
            <CardDescription>
              Full guides and API reference (coming soon).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              View docs
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader>
            <MessageCircle className="mb-2 size-5 text-primary" />
            <CardTitle className="text-base">Community</CardTitle>
            <CardDescription>
              Join other creators building with Arco.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" disabled>
              Join Discord
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Getting started</CardTitle>
          <CardDescription>Three steps to your first launch video</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {gettingStarted.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">FAQ</CardTitle>
          <CardDescription>Common questions about Arco</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-xl border p-4">
              <p className="text-sm font-medium">{faq.q}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <HelpCircle className="mb-2 size-5 text-primary" />
          <CardTitle className="text-base">Contact support</CardTitle>
          <CardDescription>
            Can&apos;t find what you need? We&apos;re here to help.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border p-4">
            <Mail className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email support</p>
              <p className="text-xs text-muted-foreground">
                support@arco.video · Usually responds within 24 hours
              </p>
            </div>
          </div>
          <Button className="w-full">Send a message</Button>
        </CardContent>
      </Card>
    </div>
  );
}
