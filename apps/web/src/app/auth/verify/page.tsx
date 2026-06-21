import { verifyMagicLinkAction } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyMagicLinkPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthShell>
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Missing verification token.</AlertDescription>
        </Alert>
      </AuthShell>
    );
  }

  const result = await verifyMagicLinkAction(token);
  if (result && "error" in result && result.error) {
    return (
      <AuthShell>
        <div className="w-full max-w-md space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{result.error}</AlertDescription>
          </Alert>
          <Button className="w-full" render={<Link href="/login" />}>
            Request a new link
          </Button>
        </div>
      </AuthShell>
    );
  }

  return null;
}
