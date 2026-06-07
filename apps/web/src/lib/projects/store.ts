import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ProjectSummary = {
  id: string;
  userId: string;
  title: string;
  platform: string;
  exportFormat: string;
  markerCount: number;
  updatedAt: string;
  createdAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(PROJECTS_FILE, "utf8");
  } catch {
    await writeFile(PROJECTS_FILE, "[]", "utf8");
  }
}

async function readProjects(): Promise<ProjectSummary[]> {
  await ensureStore();
  const raw = await readFile(PROJECTS_FILE, "utf8");
  return JSON.parse(raw) as ProjectSummary[];
}

async function writeProjects(projects: ProjectSummary[]) {
  await ensureStore();
  await writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
}

export async function listProjectsForUser(
  userId: string,
): Promise<ProjectSummary[]> {
  const projects = await readProjects();
  return projects
    .filter((project) => project.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}

export async function upsertProject(
  userId: string,
  input: {
    id: string;
    title: string;
    platform: string;
    exportFormat: string;
    markerCount: number;
  },
): Promise<ProjectSummary> {
  const projects = await readProjects();
  const now = new Date().toISOString();
  const existing = projects.find(
    (project) => project.id === input.id && project.userId === userId,
  );

  if (existing) {
    const updated: ProjectSummary = {
      ...existing,
      title: input.title,
      platform: input.platform,
      exportFormat: input.exportFormat,
      markerCount: input.markerCount,
      updatedAt: now,
    };
    await writeProjects(
      projects.map((project) =>
        project.id === updated.id && project.userId === userId
          ? updated
          : project,
      ),
    );
    return updated;
  }

  const created: ProjectSummary = {
    id: input.id,
    userId,
    title: input.title,
    platform: input.platform,
    exportFormat: input.exportFormat,
    markerCount: input.markerCount,
    createdAt: now,
    updatedAt: now,
  };

  projects.push(created);
  await writeProjects(projects);
  return created;
}

export async function deleteProject(userId: string, projectId: string) {
  const projects = await readProjects();
  await writeProjects(
    projects.filter(
      (project) => !(project.userId === userId && project.id === projectId),
    ),
  );
}
