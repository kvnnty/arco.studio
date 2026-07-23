import { redirect } from "next/navigation";

import { ProductUserUnavailable } from "@/components/auth/product-user-unavailable";
import { EditorRouteClient } from "@/components/editor/editor-route-client";
import { getAuthenticatedUser } from "@/lib/auth/session";

export const metadata = {
  title: "Editor",
  description: "Create a product demo from screenshots — Motion pipeline to export.",
};

export default async function EditorRoute() {
  const user = await getAuthenticatedUser();
  if (!user) return <ProductUserUnavailable />;
  if (!user.onboardingCompleted) redirect("/onboarding");
  return <EditorRouteClient />;
}
