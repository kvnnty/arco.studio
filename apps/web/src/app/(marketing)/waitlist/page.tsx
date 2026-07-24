import { createPageMetadata } from "@/lib/marketing/metadata";
import { WaitlistPage as WaitlistPageContent } from "@/components/waitlist/waitlist-page";

export const metadata = createPageMetadata({
  title: "Join the waitlist",
  description: "Get early access to Arco and be first to ship studio-quality product videos.",
  path: "/waitlist",
});

export default function WaitlistRoute() {
  return <WaitlistPageContent />;
}
