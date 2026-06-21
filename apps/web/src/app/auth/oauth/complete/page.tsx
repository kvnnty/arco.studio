import Link from "next/link";

import { completeOAuthAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function OAuthCompletePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell>
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Missing OAuth completion token.</AlertDescription>
        </Alert>
      </AuthShell>
    );
  }

  const result = await completeOAuthAction(token);

  if (result && "error" in result && result.error) {
    return (
      <AuthShell>
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
          <Button className="w-full" render={<Link href="/login" />}>
            Back to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return null;
}
