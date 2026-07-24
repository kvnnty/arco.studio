import type { Metadata } from "next";

import { getDashboardProject } from "@/app/actions/projects";
import { ProjectDetailClient } from "@/components/dashboard/project-detail-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = await getDashboardProject(id);

  return {
    title: project?.title ?? "Project",
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetailClient id={id} />;
}
