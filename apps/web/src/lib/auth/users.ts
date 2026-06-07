import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import bcrypt from "bcryptjs";

export type StoredUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
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
  password: string;
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
    passwordHash: await bcrypt.hash(input.password, 10),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<StoredUser | null> {
  const users = await readUsers();
  const user = users.find(
    (item) => item.email === email.trim().toLowerCase(),
  );
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((user) => user.id === id) ?? null;
}
