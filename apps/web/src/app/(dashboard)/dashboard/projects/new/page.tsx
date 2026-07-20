import { redirect } from "next/navigation";

export const metadata = {
  title: "New project - Arco",
  description: "Brief your AI motion designer from a URL and product screens.",
};

export default function NewProjectPage() {
  redirect("/dashboard");
}
