import Image from "next/image";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between border-r bg-muted/40 p-12 lg:flex">
        <Link href="/">
          <Image
            src="/arcologo-black.svg"
            alt="Arco"
            width={410}
            height={85}
            className="h-8 w-28"
          />
        </Link>
        <div>
          <blockquote className="text-2xl font-medium tracking-tight text-balance">
            Turn screen recordings into motion-designed promotional videos.
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">
            Upload once. Arco adds zooms, ripples, and titles — export a
            launch-ready demo in minutes.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Arco. All rights reserved.
        </p>
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
