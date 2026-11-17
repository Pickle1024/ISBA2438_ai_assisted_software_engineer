import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CommentInput } from "@/lib/validation";

export type Comment = {
  id: string;
  cardId: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
const COMMENTS_FILE = path.join(STORAGE_DIR, "comments.json");

// Writes run one at a time so two updates can't overwrite each other.
let writeQueue: Promise<unknown> = Promise.resolve();

// One-line summary of a comment for server logs.
export function describeComment(comment: { name: string; message: string }): string {
  const preview =
    comment.message.length > 48 ? `${comment.message.slice(0, 48)}…` : comment.message;
  return `"${comment.name}: ${preview}"`;
}

async function writeComments(comments: Comment[]): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
  const tempFile = `${COMMENTS_FILE}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(comments, null, 2)}\n`, "utf8");
  await rename(tempFile, COMMENTS_FILE);
}

async function readComments(): Promise<Comment[]> {
  try {
    const raw = await readFile(COMMENTS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Comments file is not a JSON array.");
    return parsed as Comment[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return [];
}

export async function getComments(): Promise<Comment[]> {
  return readComments();
}

export async function createComment(input: CommentInput): Promise<Comment> {
  const task = async (): Promise<Comment> => {
    const comments = await readComments();
    const comment: Comment = {
      id: randomUUID(),
      cardId: input.cardId,
      name: input.name.trim(),
      message: input.message.trim(),
      createdAt: new Date().toISOString(),
    };
    comments.push(comment);
    await writeComments(comments);
    return comment;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Returns undefined when the id does not exist, so routes can send 404
// while real storage failures still throw.
export async function updateComment(
  id: string,
  input: CommentInput,
): Promise<Comment | undefined> {
  const task = async (): Promise<Comment | undefined> => {
    const comments = await readComments();
    const existing = comments.find((comment) => comment.id === id);
    if (!existing) return undefined;
    existing.name = input.name.trim();
    existing.message = input.message.trim();
    existing.updatedAt = new Date().toISOString();
    await writeComments(comments);
    return existing;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Returns false when the id does not exist.
export async function deleteComment(id: string): Promise<boolean> {
  const task = async (): Promise<boolean> => {
    const comments = await readComments();
    const next = comments.filter((comment) => comment.id !== id);
    if (next.length === comments.length) return false;
    await writeComments(next);
    return true;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}
