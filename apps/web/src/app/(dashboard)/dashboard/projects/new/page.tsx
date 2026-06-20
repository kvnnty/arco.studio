import { CreateProjectForm } from "@/components/dashboard/create-project-form";

export const metadata = {
  title: "New project — Arco",
  description: "Create a launch video from your screen recording.",
};

export default function NewProjectPage() {
  return <CreateProjectForm />;
}
