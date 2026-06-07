"use server";

import { auth } from "@/auth";
import { upsertProject } from "@/lib/projects/store";

export async function syncProjectSummary(input: {
  id: string;
  title: string;
  platform: string;
  exportFormat: string;
  markerCount: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return;

  await upsertProject(session.user.id, input);
}
