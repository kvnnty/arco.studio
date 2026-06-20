import { AnnouncementBar } from "@/components/marketing/announcement-bar";
import { MarketingBoundaryLines } from "@/components/marketing/marketing-boundary-lines";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site flex min-h-screen flex-col">
      <MarketingBoundaryLines />
      <AnnouncementBar />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
