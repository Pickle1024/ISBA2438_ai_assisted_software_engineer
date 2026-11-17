import { deletePost, updatePost } from "@/lib/blogs";
import { logApiCall } from "@/lib/apiLog";
import { validatePost } from "@/lib/validation";

type BlogIdRouteProps = {
  params: Promise<{ id: string }>;
};

function readField(body: unknown, field: "title" | "content"): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function PUT(request: Request, { params }: BlogIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/blogs/${id}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("blogs", "PUT", pathname, 400, "invalid JSON");
    return Response.json({ status: "invalid_json" }, { status: 400 });
  }

  const { title, content } = {
    title: readField(body, "title"),
    content: readField(body, "content"),
  };

  const errors = validatePost(title, content);
  if (Object.keys(errors).length > 0) {
    logApiCall("blogs", "PUT", pathname, 400, JSON.stringify(errors));
    return Response.json({ status: "validation_error", errors }, { status: 400 });
  }

  try {
    const post = await updatePost(id, { title, content });
    if (!post) {
      logApiCall("blogs", "PUT", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("blogs", "PUT", pathname, 200, `updated "${post.title}" (${post.slug})`);
    return Response.json({ status: "success", post }, { status: 200 });
  } catch (error) {
    console.error("Could not update blog post", error);
    logApiCall("blogs", "PUT", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: BlogIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/blogs/${id}`;

  try {
    const removed = await deletePost(id);
    if (!removed) {
      logApiCall("blogs", "DELETE", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("blogs", "DELETE", pathname, 200, `deleted ${id}`);
    return Response.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Could not delete blog post", error);
    logApiCall("blogs", "DELETE", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}
