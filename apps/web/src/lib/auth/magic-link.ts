import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type MagicLink = {
  token: string;
  email: string;
  expiresAt: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const LINKS_FILE = path.join(DATA_DIR, "magic-links.json");
const EXPIRY_MS = 15 * 60 * 1000;

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(LINKS_FILE, "utf8");
  } catch {
    await writeFile(LINKS_FILE, "[]", "utf8");
  }
}

async function readLinks(): Promise<MagicLink[]> {
  await ensureStore();
  const raw = await readFile(LINKS_FILE, "utf8");
  return JSON.parse(raw) as MagicLink[];
}

async function writeLinks(links: MagicLink[]) {
  await ensureStore();
  await writeFile(LINKS_FILE, JSON.stringify(links, null, 2), "utf8");
}

export async function createMagicLink(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const links = await readLinks();
  const now = Date.now();

  const active = links.filter(
    (link) => new Date(link.expiresAt).getTime() > now,
  );
  active.push({
    token,
    email: email.trim().toLowerCase(),
    expiresAt: new Date(now + EXPIRY_MS).toISOString(),
  });

  await writeLinks(active);
  return token;
}

export async function consumeMagicLink(
  token: string,
): Promise<string | null> {
  const links = await readLinks();
  const now = Date.now();
  const match = links.find(
    (link) =>
      link.token === token && new Date(link.expiresAt).getTime() > now,
  );

  if (!match) return null;

  await writeLinks(links.filter((link) => link.token !== token));
  return match.email;
}
