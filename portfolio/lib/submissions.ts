import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContactInput } from "@/lib/validation";

export type Submission = ContactInput & {
  id: string;
  submittedAt: string;
  updatedAt?: string;
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
const SUBMISSIONS_FILE = path.join(STORAGE_DIR, "submissions.json");

// Writes run one at a time so two submissions can't overwrite each other.
let writeQueue: Promise<unknown> = Promise.resolve();

async function readSubmissions(): Promise<Submission[]> {
  let raw: string;
  try {
    raw = await readFile(SUBMISSIONS_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Submissions file is not a JSON array.");
  return parsed as Submission[];
}

async function append(submission: Submission): Promise<void> {
  const submissions = await readSubmissions();
  submissions.push(submission);

  await mkdir(STORAGE_DIR, { recursive: true });
  const tempFile = `${SUBMISSIONS_FILE}.${submission.id}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(submissions, null, 2)}\n`, "utf8");
  await rename(tempFile, SUBMISSIONS_FILE);
}

export async function saveSubmission(input: ContactInput): Promise<Submission> {
  const submission: Submission = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    ...input,
  };

  const write = writeQueue.then(() => append(submission));
  writeQueue = write.catch(() => undefined);
  await write;
  return submission;
}

// Newest first, so the admin page shows recent messages on top.
export async function getSubmissions(): Promise<Submission[]> {
  const submissions = await readSubmissions();
  return submissions.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

// Returns undefined when the id does not exist, so routes can send 404
// while real storage failures still throw.
export async function updateSubmission(
  id: string,
  input: ContactInput,
): Promise<Submission | undefined> {
  const task = async (): Promise<Submission | undefined> => {
    const submissions = await readSubmissions();
    const existing = submissions.find((submission) => submission.id === id);
    if (!existing) return undefined;
    existing.name = input.name.trim();
    existing.email = input.email.trim();
    existing.message = input.message.trim();
    existing.updatedAt = new Date().toISOString();
    await writeAll(submissions);
    return existing;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Returns false when the id does not exist.
export async function deleteSubmission(id: string): Promise<boolean> {
  const task = async (): Promise<boolean> => {
    const submissions = await readSubmissions();
    const next = submissions.filter((submission) => submission.id !== id);
    if (next.length === submissions.length) return false;
    await writeAll(next);
    return true;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

async function writeAll(submissions: Submission[]): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
  const tempFile = `${SUBMISSIONS_FILE}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(submissions, null, 2)}\n`, "utf8");
  await rename(tempFile, SUBMISSIONS_FILE);
}
