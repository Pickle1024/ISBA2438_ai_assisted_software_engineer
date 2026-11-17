import { logApiCall } from "@/lib/apiLog";
import { validateComment, type CommentInput } from "@/lib/validation";

import { createComment, describeComment, getComments } from "@/lib/comments";
import { labCards } from "@/data/promptLab";

function readField(body: unknown, field: "cardId" | "name" | "message"): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function GET(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const cardId = new URL(request.url).searchParams.get("cardId");

  try {
    const all = await getComments();
    const comments = cardId ? all.filter((comment) => comment.cardId === cardId) : all;
    comments.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    logApiCall("comments", 
      "GET",
      pathname,
      200,
      `${comments.length} comment(s)${cardId ? ` for card ${cardId}` : ""}`,
    );
    return Response.json(comments);
  } catch (error) {
    console.error("Could not read comments", error);
    logApiCall("comments", "GET", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("comments", "POST", pathname, 400, "invalid JSON");
    return Response.json({ status: "invalid_json" }, { status: 400 });
  }

  const input: CommentInput = {
    cardId: readField(body, "cardId"),
    name: readField(body, "name"),
    message: readField(body, "message"),
  };

  const errors = validateComment(input.name, input.message);
  if (!labCards.some((card) => card.id === input.cardId)) {
    errors.cardId = "Unknown card.";
  }

  if (Object.keys(errors).length > 0) {
    logApiCall("comments", "POST", pathname, 400, JSON.stringify(errors));
    return Response.json({ status: "validation_error", errors }, { status: 400 });
  }

  try {
    const comment = await createComment(input);
    logApiCall("comments", "POST", pathname, 201, describeComment(comment));
    return Response.json({ status: "success", comment }, { status: 201 });
  } catch (error) {
    console.error("Could not save comment", error);
    logApiCall("comments", "POST", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}
