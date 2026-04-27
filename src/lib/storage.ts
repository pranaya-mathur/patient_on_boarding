// src/lib/storage.ts
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export type StorageUploadResult = {
  storageKey: string;   // relative path used to retrieve the file later
  publicUrl: string;    // URL to serve the file via /api/uploads/[...key]
};

export async function uploadFile(
  fileBuffer: Buffer,
  originalFilename: string,
  folder: string,         // e.g. "insurance-cards"
): Promise<StorageUploadResult> {
  const ext = path.extname(originalFilename) || ".bin";
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(LOCAL_UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, fileBuffer);
  const storageKey = `${folder}/${filename}`;
  return {
    storageKey,
    publicUrl: `/api/uploads/${storageKey}`,
  };
}

export async function readFile(storageKey: string): Promise<Buffer> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, storageKey);
  return fs.readFile(filePath);
}

export async function deleteFile(storageKey: string): Promise<void> {
  const filePath = path.join(LOCAL_UPLOAD_DIR, storageKey);
  await fs.unlink(filePath).catch(() => undefined); // silent if already gone
}
