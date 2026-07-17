"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, Gift, Users } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { ReferralsPageSkeleton } from "@/components/dashboard/page-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useReferrals } from "@/lib/api/hooks/referrals";

export function ReferralsPageClient() {
  const { data, isLoading } = useReferrals();
  const [copied, setCopied] = useState(false);

  if (isLoading || !data) {
    return <ReferralsPageSkeleton />;
  }

  const inviteLink = data.link;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Invite link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Invite & earn"
        description="Share Arco with friends and earn bonus credits when they subscribe."
      />

      <Card className="rounded-2xl border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="size-4" />
            Earn {data.creditsPerReferral} bonus credits per referral
          </CardTitle>
          <CardDescription>
            When someone signs up with your link and subscribes, you get{" "}
            {data.creditsPerReferral} bonus credits added to your balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your invite link
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={data.link} className="font-mono text-sm" />
              <Button type="button" onClick={copyLink} className="shrink-0">
                {copied ? (
                  <>
                    <Check data-icon="inline-start" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy data-icon="inline-start" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Referral code: <span className="font-mono font-medium">{data.code}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Credits earned</CardDescription>
            <CardTitle className="text-3xl">{data.stats.creditsEarned}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Successful referrals</CardDescription>
            <CardTitle className="text-3xl">{data.stats.rewarded}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription>Pending invites</CardDescription>
            <CardTitle className="text-3xl">{data.stats.pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Your invites
          </CardTitle>
          <CardDescription>
            People who signed up with your referral link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.invites.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No invites yet. Share your link to start earning credits.
              </p>
              <Button className="mt-4" type="button" onClick={copyLink}>
                Copy invite link
              </Button>
            </div>
          ) : (
            data.invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between gap-4 rounded-xl border p-4"
              >
                <div>
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(invite.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {invite.status === "rewarded" ? (
                    <Badge variant="secondary">
                      +{invite.creditsAwarded} credits
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending subscription</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Share your link",
              description: "Send your unique invite link to founders and marketers.",
            },
            {
              step: "2",
              title: "They subscribe",
              description: "Your invite signs up and chooses a paid plan.",
            },
            {
              step: "3",
              title: "You earn credits",
              description: `${data.creditsPerReferral} bonus credits are added to your account.`,
            },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border p-4">
              <p className="text-xs font-semibold text-primary">Step {item.step}</p>
              <p className="mt-2 text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Need more credits now?{" "}
        <Link href="/dashboard/billing" className="text-accent-foreground hover:underline">
          View billing
        </Link>
      </p>
    </div>
  );
}
