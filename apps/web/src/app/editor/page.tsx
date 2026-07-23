import { EditorRouteClient } from "@/components/editor/editor-route-client";
import { resolveProductUser } from "@/lib/auth/session";
import { signInUrl } from "@/lib/auth/return-to";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Editor",
  description: "Create a product demo from screenshots — Motion pipeline to export.",
};

export default async function EditorRoute() {
  const user = await resolveProductUser();
  if (!user) redirect(signInUrl("/editor"));
  if (!user.onboardingCompleted) redirect("/onboarding");
  return <EditorRouteClient />;
}
