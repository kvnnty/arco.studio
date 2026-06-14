import { auth } from "@/auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppTopbar } from "@/components/dashboard/app-topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppTopbar
          user={{
            name: session?.user?.name,
            email: session?.user?.email,
          }}
        />
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
