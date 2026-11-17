import { createPost, getPosts, type BlogPost } from "@/lib/blogs";
import { logApiCall } from "@/lib/apiLog";
import { validatePost } from "@/lib/validation";

export type BlogApiResponse =
  | { status: "success"; post: BlogPost }
  | { status: "validation_error"; errors: { title?: string; content?: string } }
  | { status: "invalid_json" }
  | { status: "server_error" };

export async function GET(): Promise<Response> {
  try {
    const posts = await getPosts();
    posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    logApiCall("blogs", "GET", "/api/blogs", 200, `${posts.length} post(s)`);
    return Response.json(posts);
  } catch (error) {
    console.error("Could not read blog posts", error);
    logApiCall("blogs", "GET", "/api/blogs", 500);
    return Response.json({ status: "server_error" } satisfies BlogApiResponse, { status: 500 });
  }
}

function readField(body: unknown, field: "title" | "content"): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request): Promise<Response> {
  const pathname = "/api/blogs";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("blogs", "POST", pathname, 400, "invalid JSON");
    return Response.json({ status: "invalid_json" } satisfies BlogApiResponse, { status: 400 });
  }

  const { title, content } = {
    title: readField(body, "title"),
    content: readField(body, "content"),
  };

  const errors = validatePost(title, content);
  if (Object.keys(errors).length > 0) {
    logApiCall("blogs", "POST", pathname, 400, JSON.stringify(errors));
    return Response.json(
      { status: "validation_error", errors } satisfies BlogApiResponse,
      { status: 400 },
    );
  }

  try {
    const post = await createPost(title, content);
    logApiCall("blogs", "POST", pathname, 201, `created "${post.title}" (${post.slug})`);
    return Response.json({ status: "success", post } satisfies BlogApiResponse, { status: 201 });
  } catch (error) {
    console.error("Could not save blog post", error);
    logApiCall("blogs", "POST", pathname, 500);
    return Response.json({ status: "server_error" } satisfies BlogApiResponse, { status: 500 });
  }
}
