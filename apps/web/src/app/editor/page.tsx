import { EditorRouteClient } from "@/components/editor/editor-route-client";

export const metadata = {
  title: "Editor",
  description: "Create a product demo from screenshots — Motion pipeline to export.",
};

export default function EditorRoute() {
  return <EditorRouteClient />;
}
