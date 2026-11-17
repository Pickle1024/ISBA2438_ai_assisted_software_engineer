import { updateComment, deleteComment } from "@/lib/comments";
import { logApiCall } from "@/lib/apiLog";
import { validateComment, type CommentInput } from "@/lib/validation";

type CommentIdRouteProps = {
  params: Promise<{ id: string }>;
};

function readField(body: unknown, field: "name" | "message"): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function PUT(request: Request, { params }: CommentIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/comments/${id}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("comments", "PUT", pathname, 400, "invalid JSON");
    return Response.json({ status: "invalid_json" }, { status: 400 });
  }

  const input: CommentInput = {
    cardId: "",
    name: readField(body, "name"),
    message: readField(body, "message"),
  };

  const errors = validateComment(input.name, input.message);
  if (Object.keys(errors).length > 0) {
    logApiCall("comments", "PUT", pathname, 400, JSON.stringify(errors));
    return Response.json({ status: "validation_error", errors }, { status: 400 });
  }

  try {
    const comment = await updateComment(id, input);
    if (!comment) {
      logApiCall("comments", "PUT", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("comments", "PUT", pathname, 200, `updated by ${comment.name}`);
    return Response.json({ status: "success", comment }, { status: 200 });
  } catch (error) {
    console.error("Could not update comment", error);
    logApiCall("comments", "PUT", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: CommentIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/comments/${id}`;

  try {
    const removed = await deleteComment(id);
    if (!removed) {
      logApiCall("comments", "DELETE", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("comments", "DELETE", pathname, 200, `deleted ${id}`);
    return Response.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Could not delete comment", error);
    logApiCall("comments", "DELETE", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}
