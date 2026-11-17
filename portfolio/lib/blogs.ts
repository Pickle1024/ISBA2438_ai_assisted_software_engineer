import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import { slugifyTitle, uniqueSlug } from "@/lib/slug";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
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

// Returns undefined when the id does not exist, so routes can send 404
// while real storage failures still throw.
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

export async function updatePost(
  id: string,
  input: { title: string; content: string },
): Promise<BlogPost | undefined> {
  const task = async (): Promise<BlogPost | undefined> => {
    const posts = await readPosts();
    const existing = posts.find((post) => post.id === id);
    if (!existing) return undefined;
    existing.title = input.title.trim();
    existing.content = input.content.trim();
    // A new title gets a fresh slug; the post's own slug is excluded.
    existing.slug = uniqueSlug(
      slugifyTitle(existing.title),
      new Set(posts.filter((post) => post.id !== id).map((post) => post.slug)),
    );
    existing.updatedAt = new Date().toISOString();
    await writePosts(posts);
    return existing;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

// Returns false when the id does not exist.
export async function deletePost(id: string): Promise<boolean> {
  const task = async (): Promise<boolean> => {
    const posts = await readPosts();
    const next = posts.filter((post) => post.id !== id);
    if (next.length === posts.length) return false;
    await writePosts(next);
    return true;
  };

  const write = writeQueue.then(task);
  writeQueue = write.catch(() => undefined);
  return write;
}

