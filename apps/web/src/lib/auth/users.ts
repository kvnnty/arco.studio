import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  apiPassword?: string;
  apiUserId?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(USERS_FILE, "utf8");
  } catch {
    await writeFile(USERS_FILE, "[]", "utf8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureStore();
  const raw = await readFile(USERS_FILE, "utf8");
  return JSON.parse(raw) as StoredUser[];
}

async function writeUsers(users: StoredUser[]) {
  await ensureStore();
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export async function createUser(input: {
  email: string;
  name: string;
}): Promise<StoredUser> {
  const users = await readUsers();
  const email = input.email.trim().toLowerCase();

  if (users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim(),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function getUserByEmail(
  email: string,
): Promise<StoredUser | null> {
  const users = await readUsers();
  return (
    users.find((item) => item.email === email.trim().toLowerCase()) ?? null
  );
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}

export async function updateUserApiCredentials(
  email: string,
  input: { apiPassword: string; apiUserId: string },
): Promise<void> {
  const users = await readUsers();
  const normalized = email.trim().toLowerCase();
  const index = users.findIndex((user) => user.email === normalized);
  if (index === -1) return;

  users[index] = {
    ...users[index],
    apiPassword: input.apiPassword,
    apiUserId: input.apiUserId,
  };
  await writeUsers(users);
}
