import { ProjectDetailClient } from "@/components/dashboard/project-detail-client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProjectDetailClient id={id} />;
}
