import { saveSubmission } from "@/lib/submissions";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";

export type ContactApiResponse =
  | { status: "success" }
  | { status: "validation_error"; errors: ContactErrors; values: ContactInput }
  | { status: "invalid_json" }
  | { status: "server_error" };

function readField(body: unknown, field: keyof ContactInput): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ status: "invalid_json" } satisfies ContactApiResponse, { status: 400 });
  }

  const values: ContactInput = {
    name: readField(body, "name"),
    email: readField(body, "email"),
    message: readField(body, "message"),
  };

  const result = validateContact(values);
  if (!result.ok) {
    return Response.json(
      { status: "validation_error", errors: result.errors, values } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  try {
    await saveSubmission(result.data);
  } catch (error) {
    console.error("Could not save contact submission", error);
    return Response.json({ status: "server_error" } satisfies ContactApiResponse, { status: 500 });
  }

  return Response.json({ status: "success" } satisfies ContactApiResponse, { status: 201 });
}
