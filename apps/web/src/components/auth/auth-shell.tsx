import Image from "next/image";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between gap-4 p-6 m-4 rounded-lg lg:flex bg-secondary text-secondary-foreground">
        <Link href="/" className="w-fit">
          <Image
            src="/arcologo-white.svg"
            alt="Arco"
            width={410}
            height={85}
            className="h-8 w-28"
          />
        </Link>
        <div className="flex-1 p-6 flex items-end">
          <div>
            <blockquote className="text-5xl font-bold tracking-tight leading-tight text-balance">
              Launch videos without hiring a motion designer.
            </blockquote>
            <p className="mt-4">
              Built for product owners. Record your app, describe the launch,
              and export social ads, demos, and feature videos in minutes.
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <Link href="/" className="mb-10 lg:hidden">
          <Image
            src="/arcologo-black.svg"
            alt="Arco"
            width={410}
            height={85}
            className="h-8 w-28"
          />
        </Link>
        {children}
      </div>
    </div>
  );
}
