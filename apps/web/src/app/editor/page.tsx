import { EditorRouteClient } from "@/components/editor/editor-route-client";

export const metadata = {
  title: "Editor — Arco",
  description: "Upload a screen recording and add motion design.",
};

export default function EditorRoute() {
  return <EditorRouteClient />;
}
