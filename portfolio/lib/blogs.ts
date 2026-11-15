import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
const BLOGS_FILE = path.join(STORAGE_DIR, "blogs.json");
const SEED_FILE = path.join(process.cwd(), "seed", "blogs.json");

// Writes run one at a time so two updates can't overwrite each other.
let writeQueue: Promise<unknown> = Promise.resolve();

async function writePosts(posts: BlogPost[]): Promise<void> {
  await mkdir(STORAGE_DIR, { recursive: true });
  const tempFile = `${BLOGS_FILE}.${randomUUID()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  await rename(tempFile, BLOGS_FILE);
}

async function readPosts(): Promise<BlogPost[]> {
  try {
    const raw = await readFile(BLOGS_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Blogs file is not a JSON array.");
    return parsed as BlogPost[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  let seeded: BlogPost[] = [];
  try {
    const raw = await readFile(SEED_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) seeded = parsed as BlogPost[];
  } catch {
    seeded = [];
  }
  return seeded;
}

export async function getPosts(): Promise<BlogPost[]> {
  return readPosts();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await readPosts();
  return posts.find((post) => post.slug === slug);
}

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "post" : slug;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let candidate = base;
  let counter = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export async function createPost(title: string, content: string): Promise<BlogPost> {
  const task = async (): Promise<BlogPost> => {
    const posts = await readPosts();
    const post: BlogPost = {
      id: randomUUID(),
      slug: uniqueSlug(slugifyTitle(title), new Set(posts.map((existing) => existing.slug))),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    posts.push(post);
    await writePosts(posts);
    return post;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}
