import { createProject, getAllProjects } from "@/lib/projects";
import { logApiCall } from "@/lib/apiLog";
import { validateProject, type ProjectInput } from "@/lib/validation";

function readField(body: unknown, field: keyof ProjectInput): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function GET(): Promise<Response> {
  try {
    const projects = await getAllProjects();
    logApiCall("projects", "GET", "/api/projects", 200, `${projects.length} project(s)`);
    return Response.json(projects);
  } catch (error) {
    console.error("Could not read projects", error);
    logApiCall("projects", "GET", "/api/projects", 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  const pathname = "/api/projects";

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("projects", "POST", pathname, 400, "invalid JSON");
    return Response.json({ status: "invalid_json" }, { status: 400 });
  }

  const input: ProjectInput = {
    title: readField(body, "title"),
    lens: readField(body, "lens"),
    lensHook: readField(body, "lensHook"),
    summary: readField(body, "summary"),
    role: readField(body, "role"),
    period: readField(body, "period"),
    accent: readField(body, "accent"),
    context: readField(body, "context"),
    whatIDid: readField(body, "whatIDid"),
  };

  const errors = validateProject(input);
  if (Object.keys(errors).length > 0) {
    logApiCall("projects", "POST", pathname, 400, JSON.stringify(errors));
    return Response.json({ status: "validation_error", errors }, { status: 400 });
  }

  try {
    const project = await createProject(input);
    logApiCall("projects", "POST", pathname, 201, `created "${project.title}" (${project.slug})`);
    return Response.json({ status: "success", project }, { status: 201 });
  } catch (error) {
    console.error("Could not save project", error);
    logApiCall("projects", "POST", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}
