import { getSubmissions, saveSubmission } from "@/lib/submissions";
import { logApiCall } from "@/lib/apiLog";
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

export async function GET(): Promise<Response> {
  try {
    const submissions = await getSubmissions();
    logApiCall("contact", "GET", "/api/contact", 200, `${submissions.length} submission(s)`);
    return Response.json(submissions);
  } catch (error) {
    console.error("Could not read contact submissions", error);
    logApiCall("contact", "GET", "/api/contact", 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("contact", "POST", "/api/contact", 400, "invalid JSON");
    return Response.json({ status: "invalid_json" } satisfies ContactApiResponse, { status: 400 });
  }

  const values: ContactInput = {
    name: readField(body, "name"),
    email: readField(body, "email"),
    message: readField(body, "message"),
  };

  const result = validateContact(values);
  if (!result.ok) {
    logApiCall("contact", "POST", "/api/contact", 400, JSON.stringify(result.errors));
    return Response.json(
      { status: "validation_error", errors: result.errors, values } satisfies ContactApiResponse,
      { status: 400 },
    );
  }

  try {
    const submission = await saveSubmission(result.data);
    logApiCall(
      "contact",
      "POST",
      "/api/contact",
      201,
      `"${submission.name}" <${submission.email}>`,
    );
  } catch (error) {
    console.error("Could not save contact submission", error);
    logApiCall("contact", "POST", "/api/contact", 500);
    return Response.json({ status: "server_error" } satisfies ContactApiResponse, { status: 500 });
  }

  return Response.json({ status: "success" } satisfies ContactApiResponse, { status: 201 });
}
