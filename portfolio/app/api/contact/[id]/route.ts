import { deleteSubmission, updateSubmission } from "@/lib/submissions";
import { logApiCall } from "@/lib/apiLog";
import { validateContact, type ContactInput } from "@/lib/validation";

type ContactIdRouteProps = {
  params: Promise<{ id: string }>;
};

function readField(body: unknown, field: keyof ContactInput): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function PUT(request: Request, { params }: ContactIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/contact/${id}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("contact", "PUT", pathname, 400, "invalid JSON");
    return Response.json({ status: "invalid_json" }, { status: 400 });
  }

  const values: ContactInput = {
    name: readField(body, "name"),
    email: readField(body, "email"),
    message: readField(body, "message"),
  };

  const result = validateContact(values);
  if (!result.ok) {
    logApiCall("contact", "PUT", pathname, 400, JSON.stringify(result.errors));
    return Response.json({ status: "validation_error", errors: result.errors }, { status: 400 });
  }

  try {
    const submission = await updateSubmission(id, result.data);
    if (!submission) {
      logApiCall("contact", "PUT", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("contact", "PUT", pathname, 200, `updated "${submission.name}"`);
    return Response.json({ status: "success", submission }, { status: 200 });
  } catch (error) {
    console.error("Could not update contact submission", error);
    logApiCall("contact", "PUT", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: ContactIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/contact/${id}`;

  try {
    const removed = await deleteSubmission(id);
    if (!removed) {
      logApiCall("contact", "DELETE", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("contact", "DELETE", pathname, 200, `deleted ${id}`);
    return Response.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Could not delete contact submission", error);
    logApiCall("contact", "DELETE", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}
