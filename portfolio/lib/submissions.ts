import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ContactInput } from "@/lib/validation";

export type Submission = ContactInput & {
  id: string;
  submittedAt: string;
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
