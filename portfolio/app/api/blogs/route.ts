import { createPost, getPosts, type BlogPost } from "@/lib/blogs";

export type BlogApiResponse =
  | { status: "success"; post: BlogPost }
  | { status: "validation_error"; errors: { title?: string; content?: string } }
  | { status: "invalid_json" }
  | { status: "server_error" };

export async function GET(): Promise<Response> {
  try {
    const posts = await getPosts();
    posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return Response.json(posts);
  } catch (error) {
    console.error("Could not read blog posts", error);
    return Response.json({ status: "server_error" } satisfies BlogApiResponse, { status: 500 });
  }
}

function readField(body: unknown, field: "title" | "content"): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ status: "invalid_json" } satisfies BlogApiResponse, { status: 400 });
  }

  const title = readField(body, "title");
  const content = readField(body, "content");

  const errors: { title?: string; content?: string } = {};
  if (title.trim() === "") errors.title = "Please enter a title.";
  if (content.trim() === "") errors.content = "Please enter content.";
  if (Object.keys(errors).length > 0) {
    return Response.json({ status: "validation_error", errors } satisfies BlogApiResponse, { status: 400 });
  }

  try {
    const post = await createPost(title, content);
    return Response.json({ status: "success", post } satisfies BlogApiResponse, { status: 201 });
  } catch (error) {
    console.error("Could not save blog post", error);
    return Response.json({ status: "server_error" } satisfies BlogApiResponse, { status: 500 });
  }
}
