import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

const storageRoot = mkdtempSync(path.join(tmpdir(), "portfolio-projects-tests-"));
process.chdir(storageRoot);

const { GET: projectsGet, POST: projectsPost } = await import("../app/api/projects/route.ts");
const { PUT: projectPut, DELETE: projectDelete } = await import("../app/api/projects/[id]/route.ts");

function post(body: unknown): Request {
  return new Request("http://localhost/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function put(id: string, body: unknown): Request {
  return new Request(`http://localhost/api/projects/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stored(): { id: string; slug: string; title: string; whatIDid: string[] }[] {
  return JSON.parse(readFileSync(path.join(storageRoot, "storage", "projects.json"), "utf8"));
}

test("GET returns the four seeded projects before any write", async () => {
  const response = await projectsGet();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.length, 4);
  assert.ok(body.some((p: { slug: string }) => p.slug === "picklens"));
});

test("POST creates a project with a slug and persists it", async () => {
  const response = await projectsPost(
    post({ title: "Demo Project", lens: "Builder", whatIDid: "Step one.\nStep two." }),
  );
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.project.slug, "demo-project");
  assert.deepEqual(body.project.whatIDid, ["Step one.", "Step two."]);
  assert.equal(stored().length, 5);
});

test("POST rejects a blank title", async () => {
  const response = await projectsPost(post({ title: "  ", lens: "Builder" }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.errors.title, "Please enter a title.");
});

test("PUT updates a project and re-slugs when the title changes", async () => {
  const found = stored().find((p: { slug: string }) => p.slug === "demo-project");
  assert.ok(found);
  const id = found.id;
  const response = await projectPut(put(id, { title: "Renamed Project", lens: "Builder" }), {
    params: Promise.resolve({ id }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.project.slug, "renamed-project");
  assert.equal(stored().find((p: { id: string }) => p.id === id)?.title, "Renamed Project");
});

test("PUT returns 404 for an unknown id", async () => {
  const response = await projectPut(put("no-such-id", { title: "X", lens: "Builder" }), {
    params: Promise.resolve({ id: "no-such-id" }),
  });
  assert.equal(response.status, 404);
});

test("DELETE removes a project and returns 404 the second time", async () => {
  const found = stored().find((p: { slug: string }) => p.slug === "renamed-project");
  assert.ok(found);
  const id = found.id;
  const response = await projectDelete(
    new Request(`http://localhost/api/projects/${id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(response.status, 200);
  assert.equal(stored().length, 4);

  const again = await projectDelete(
    new Request(`http://localhost/api/projects/${id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(again.status, 404);
});

after(() => {
  rmSync(storageRoot, { recursive: true, force: true });
});
