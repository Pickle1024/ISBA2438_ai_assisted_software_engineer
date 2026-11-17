import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

const storageRoot = mkdtempSync(path.join(tmpdir(), "portfolio-contact-tests-"));
process.chdir(storageRoot);

const { GET: contactGet, POST: contactPost } = await import("../app/api/contact/route.ts");
const { PUT: contactPut, DELETE: contactDelete } = await import("../app/api/contact/[id]/route.ts");

function post(body: unknown): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function put(id: string, body: unknown): Request {
  return new Request(`http://localhost/api/contact/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stored(): { id: string; name: string; email: string; message: string }[] {
  return JSON.parse(readFileSync(path.join(storageRoot, "storage", "submissions.json"), "utf8"));
}

const VALID = { name: "Zoe", email: "zoe@example.com", message: "Hello!" };

test("POST returns 201 and persists the submission", async () => {
  const response = await contactPost(post(VALID));
  assert.equal(response.status, 201);
  assert.equal(stored().length, 1);
  assert.equal(stored()[0].email, "zoe@example.com");
});

test("GET returns submissions newest first", async () => {
  await contactPost(post({ ...VALID, name: "Second" }));
  const response = await contactGet();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.length, 2);
  assert.equal(body[0].name, "Second");
});

test("PUT updates a submission and sets updatedAt", async () => {
  const id = stored()[0].id;
  const response = await contactPut(
    put(id, { name: "Zoe W.", email: "zoe@example.com", message: "Updated." }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.submission.name, "Zoe W.");
  assert.ok(body.submission.updatedAt);
  assert.equal(stored().find((s: { id: string }) => s.id === id)?.message, "Updated.");
});

test("PUT rejects an invalid email", async () => {
  const id = stored()[0].id;
  const response = await contactPut(
    put(id, { name: "Zoe", email: "not-an-email", message: "Hi" }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.errors.email, /valid email/);
});

test("PUT returns 404 for an unknown id", async () => {
  const response = await contactPut(put("no-such-id", VALID), {
    params: Promise.resolve({ id: "no-such-id" }),
  });
  assert.equal(response.status, 404);
});

test("DELETE removes a submission and returns 404 the second time", async () => {
  const id = stored()[0].id;
  const count = stored().length;
  const response = await contactDelete(
    new Request(`http://localhost/api/contact/${id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(response.status, 200);
  assert.equal(stored().length, count - 1);

  const again = await contactDelete(
    new Request(`http://localhost/api/contact/${id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id }) },
  );
  assert.equal(again.status, 404);
});

after(() => {
  rmSync(storageRoot, { recursive: true, force: true });
});
