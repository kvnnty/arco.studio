import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-10">
        <Image
          src="/arcologo-white.svg"
          alt="Arco"
          width={410}
          height={85}
          className="h-8 w-28"
        />
      </Link>
      <LoginForm />
    </div>
  );
}
