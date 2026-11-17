import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { seedProjects, type Project } from "@/data/projects";
import { slugifyTitle, uniqueSlug } from "@/lib/slug";
import type { ProjectInput } from "@/lib/validation";

const STORAGE_DIR = path.join(process.cwd(), "storage");
const PROJECTS_FILE = path.join(STORAGE_DIR, "projects.json");

// Writes run one at a time so two requests can't overwrite each other.
let writeQueue: Promise<unknown> = Promise.resolve();

async function readProjects(): Promise<Project[]> {
  let raw: string;
  try {
    raw = await readFile(PROJECTS_FILE, "utf8");
  } catch (error) {
    // No file yet (fresh clone): fall back to the seed content.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seedProjects;
    throw error;
  }

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Projects file is not a JSON array.");
  return parsed as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const projects = await readProjects();
  return projects.find((project) => project.slug === slug);
}

// "Line one\nLine two" → ["Line one", "Line two"] (blanks dropped).
function splitLines(value: string | undefined): string[] {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const task = async (): Promise<Project> => {
    const projects = await readProjects();
    const title = input.title.trim();
    const project: Project = {
      id: randomUUID(),
      slug: uniqueSlug(slugifyTitle(title), new Set(projects.map((existing) => existing.slug))),
      lens: input.lens.trim(),
      lensHook: input.lensHook?.trim() ?? "",
      title,
      summary: input.summary?.trim() ?? "",
      role: input.role?.trim() ?? "",
      period: input.period?.trim() ?? "",
      stats: [],
      context: input.context?.trim() ?? "",
      whatIDid: splitLines(input.whatIDid),
      links: [],
      accent: input.accent?.trim() || "#e8e8e8",
      cover: { kind: "wall", alt: `${title} — animated workflow cover` },
    };
    projects.push(project);
    await writeProjects(projects);
    return project;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Returns undefined when the id does not exist, so routes can send 404
// while real storage failures still throw.
export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<Project | undefined> {
  const task = async (): Promise<Project | undefined> => {
    const projects = await readProjects();
    const existing = projects.find((project) => project.id === id);
    if (!existing) return undefined;
    existing.title = input.title.trim();
    existing.lens = input.lens.trim();
    // A new title gets a fresh slug; the project's own slug is excluded.
    existing.slug = uniqueSlug(
      slugifyTitle(existing.title),
      new Set(projects.filter((project) => project.id !== id).map((project) => project.slug)),
    );
    existing.lensHook = input.lensHook?.trim() ?? "";
    existing.summary = input.summary?.trim() ?? "";
    existing.role = input.role?.trim() ?? "";
    existing.period = input.period?.trim() ?? "";
    if (input.accent?.trim()) existing.accent = input.accent.trim();
    existing.context = input.context?.trim() ?? "";
    existing.whatIDid = splitLines(input.whatIDid);
    await writeProjects(projects);
    return existing;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Returns false when the id does not exist.
export async function deleteProject(id: string): Promise<boolean> {
  const task = async (): Promise<boolean> => {
    const projects = await readProjects();
    const next = projects.filter((project) => project.id !== id);
    if (next.length === projects.length) return false;
    await writeProjects(next);
    return true;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Exported so the API GET route can list everything.
export async function getAllProjects(): Promise<Project[]> {
  return readProjects();
}

async function writeProjects(projects: Project[]): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
  const tempFile = `${PROJECTS_FILE}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
  await rename(tempFile, PROJECTS_FILE);
}
