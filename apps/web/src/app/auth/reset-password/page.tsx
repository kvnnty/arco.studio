import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  return (
    <AuthShell>
      {!token ? (
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Invalid reset link.</AlertDescription>
        </Alert>
      ) : (
        <ResetPasswordForm token={token} />
      )}
    </AuthShell>
  );
}
