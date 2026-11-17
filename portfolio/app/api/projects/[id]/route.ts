import { deleteProject, updateProject } from "@/lib/projects";
import { logApiCall } from "@/lib/apiLog";
import { validateProject, type ProjectInput } from "@/lib/validation";

type ProjectIdRouteProps = {
  params: Promise<{ id: string }>;
};

function readField(body: unknown, field: keyof ProjectInput): string {
  if (typeof body !== "object" || body === null) return "";
  const value = (body as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

export async function PUT(request: Request, { params }: ProjectIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/projects/${id}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logApiCall("projects", "PUT", pathname, 400, "invalid JSON");
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
    logApiCall("projects", "PUT", pathname, 400, JSON.stringify(errors));
    return Response.json({ status: "validation_error", errors }, { status: 400 });
  }

  try {
    const project = await updateProject(id, input);
    if (!project) {
      logApiCall("projects", "PUT", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("projects", "PUT", pathname, 200, `updated "${project.title}" (${project.slug})`);
    return Response.json({ status: "success", project }, { status: 200 });
  } catch (error) {
    console.error("Could not update project", error);
    logApiCall("projects", "PUT", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: ProjectIdRouteProps): Promise<Response> {
  const { id } = await params;
  const pathname = `/api/projects/${id}`;

  try {
    const removed = await deleteProject(id);
    if (!removed) {
      logApiCall("projects", "DELETE", pathname, 404);
      return Response.json({ status: "not_found" }, { status: 404 });
    }
    logApiCall("projects", "DELETE", pathname, 200, `deleted ${id}`);
    return Response.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Could not delete project", error);
    logApiCall("projects", "DELETE", pathname, 500);
    return Response.json({ status: "server_error" }, { status: 500 });
  }
}
