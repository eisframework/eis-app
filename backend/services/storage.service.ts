import path from "path";

function getStoragePath() {
  return process.env.LOCAL_STORAGE_PATH || "./storage";
}

function getPublicUrlBase() {
  return process.env.LOCAL_STORAGE_PUBLIC_URL || "/storage";
}

async function ensureDir(dir: string) {
  try {
    await Bun.file(dir).exists();
  } catch {
    await Bun.write(`${dir}/.keep`, "");
  }
}

export async function uploadBuffer(key: string, body: Buffer): Promise<void> {
  const filePath = path.join(getStoragePath(), key);
  const dir = path.dirname(filePath);
  await ensureDir(dir);
  await Bun.write(filePath, body);
}

export async function getObject(key: string) {
  const filePath = path.join(getStoragePath(), key);
  const buffer = await Bun.file(filePath).arrayBuffer();
  return { Body: Buffer.from(buffer) };
}

export async function exists(key: string): Promise<boolean> {
  const filePath = path.join(getStoragePath(), key);
  try {
    return await Bun.file(filePath).exists();
  } catch {
    return false;
  }
}

export async function deleteObject(key: string): Promise<void> {
  const filePath = path.join(getStoragePath(), key);
  const file = Bun.file(filePath);
  await file.delete();
}

export function getPublicUrl(key: string): string {
  return `${getPublicUrlBase().replace(/\/$/, "")}/${key}`;
}
