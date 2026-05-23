import { promises as fs } from "fs";
import path from "path";

export type UserLinks = {
  customerId: string;
  email: string;
  podcastUrl: string;
  websiteUrl: string;
  updatedAt: string;
};

type StoreData = {
  users: Record<string, UserLinks>;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "links.json");

async function ensureStore(): Promise<StoreData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    return JSON.parse(raw) as StoreData;
  } catch {
    return { users: {} };
  }
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUserLinks(
  customerId: string
): Promise<UserLinks | null> {
  const store = await ensureStore();
  return store.users[customerId] ?? null;
}

export async function saveUserLinks(links: UserLinks): Promise<UserLinks> {
  const store = await ensureStore();
  store.users[links.customerId] = {
    ...links,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  return store.users[links.customerId];
}

export async function upsertCustomer(
  customerId: string,
  email: string
): Promise<UserLinks> {
  const existing = await getUserLinks(customerId);
  if (existing) return existing;

  return saveUserLinks({
    customerId,
    email,
    podcastUrl: "",
    websiteUrl: "",
    updatedAt: new Date().toISOString(),
  });
}
