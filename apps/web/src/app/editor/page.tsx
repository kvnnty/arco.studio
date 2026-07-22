import { EditorRouteClient } from "@/components/editor/editor-route-client";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Editor",
  description: "Create a product demo from screenshots — Motion pipeline to export.",
};

export default async function EditorRoute() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/onboarding");
  return <EditorRouteClient />;
}
