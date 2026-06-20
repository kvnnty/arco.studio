import Image from "next/image";
import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between gap-4 p-6 lg:flex">
        <Link href="/">
          <Image
            src="/arcologo-black.svg"
            alt="Arco"
            width={410}
            height={85}
            className="h-8 w-28"
          />
        </Link>
        <div className="bg-primary flex-1 p-6 flex items-end">
          <div>
            <blockquote className="text-5xl font-bold tracking-tight leading-tight text-balance">
              Turn screen recordings into motion-designed promotional videos.
            </blockquote>
            <p className="mt-4">
              Upload once. Arco adds zooms, ripples, and titles — export a
              launch-ready demo in minutes.
            </p>
          </div>
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
