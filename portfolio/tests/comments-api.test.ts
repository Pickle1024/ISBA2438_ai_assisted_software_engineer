import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

const storageRoot = mkdtempSync(path.join(tmpdir(), "portfolio-comments-tests-"));
process.chdir(storageRoot);

const { GET: commentsGet, POST: commentsPost } = await import("../app/api/comments/route.ts");
const { PUT: commentPut, DELETE: commentDelete } = await import("../app/api/comments/[id]/route.ts");

function post(body: unknown): Request {
  return new Request("http://localhost/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function put(id: string, body: unknown): Request {
  return new Request(`http://localhost/api/comments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stored(): { id: string; cardId: string; name: string; message: string }[] {
  return JSON.parse(readFileSync(path.join(storageRoot, "storage", "comments.json"), "utf8"));
}

const VALID = { cardId: "claude-duet-remake", name: "Zoe", message: "Great prompt." };

test("POST returns 201 and persists the comment", async () => {
  const response = await commentsPost(post(VALID));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.status, "success");
  assert.equal(body.comment.name, "Zoe");
  assert.equal(stored().length, 1);
  assert.equal(stored()[0].cardId, "claude-duet-remake");
});

test("POST rejects blank name and message with field errors", async () => {
  const response = await commentsPost(post({ ...VALID, name: "  ", message: "" }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.status, "validation_error");
  assert.equal(body.errors.name, "Please enter your name.");
  assert.equal(body.errors.message, "Please enter a comment.");
});

test("POST rejects an over-long message", async () => {
  const response = await commentsPost(post({ ...VALID, message: "x".repeat(601) }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.match(body.errors.message, /shorten your comment/);
});

test("POST rejects an unknown cardId", async () => {
  const response = await commentsPost(post({ ...VALID, cardId: "nope" }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.errors.cardId, "Unknown card.");
});

test("GET returns comments newest first and filters by cardId", async () => {
  await commentsPost(post({ ...VALID, name: "First" }));
  await commentsPost(post({ ...VALID, cardId: "silky-motion", name: "Second" }));

  const all = await commentsGet(new Request("http://localhost/api/comments"));
  assert.equal(all.status, 200);
  const allBody = await all.json();
  assert.equal(allBody.length, 3);
  assert.equal(allBody[0].name, "Second");

  const filtered = await commentsGet(
    new Request("http://localhost/api/comments?cardId=silky-motion"),
  );
  const filteredBody = await filtered.json();
  assert.equal(filteredBody.length, 1);
  assert.equal(filteredBody[0].cardId, "silky-motion");
});

test("PUT updates a comment and sets updatedAt", async () => {
  const id = stored()[0].id;
  const response = await commentPut(put(id, { name: "Zoe", message: "Edited text." }), {
    params: Promise.resolve({ id }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.comment.message, "Edited text.");
  assert.ok(body.comment.updatedAt);
  assert.equal(stored().find((c: { id: string }) => c.id === id)?.message, "Edited text.");
});

test("PUT returns 404 for an unknown id", async () => {
  const response = await commentPut(put("no-such-id", VALID), {
    params: Promise.resolve({ id: "no-such-id" }),
  });
  assert.equal(response.status, 404);
});

test("DELETE removes a comment and returns 404 the second time", async () => {
  const id = stored()[0].id;
  const count = stored().length;
  const response = await commentDelete(new Request(`http://localhost/api/comments/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id }),
  });
  assert.equal(response.status, 200);
  assert.equal(stored().length, count - 1);

  const again = await commentDelete(new Request(`http://localhost/api/comments/${id}`, { method: "DELETE" }), {
    params: Promise.resolve({ id }),
  });
  assert.equal(again.status, 404);
});

after(() => {
  rmSync(storageRoot, { recursive: true, force: true });
});
