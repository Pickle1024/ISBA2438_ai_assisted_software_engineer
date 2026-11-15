import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";

const storageRoot = mkdtempSync(path.join(tmpdir(), "portfolio-api-tests-"));
process.chdir(storageRoot);

const { POST: contactPost } = await import("../app/api/contact/route.ts");
const { POST: blogsPost } = await import("../app/api/blogs/route.ts");

function post(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("contact API rejects blank name and message with field errors", async () => {
  const response = await contactPost(
    post("http://localhost/api/contact", { name: "   ", email: "test@example.com", message: "" }),
  );
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.status, "validation_error");
  assert.equal(body.errors.name, "Please enter your name.");
  assert.equal(body.errors.message, "Please enter a message.");
  assert.equal(body.errors.email, undefined);
});

test("contact API rejects a bad email", async () => {
  const response = await contactPost(
    post("http://localhost/api/contact", { name: "Zoe", email: "zoe at example.com", message: "hi" }),
  );
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.status, "validation_error");
  assert.equal(body.errors.email, "Please enter a valid email address, like you@example.com.");
  assert.equal(body.errors.name, undefined);
  assert.equal(body.errors.message, undefined);
});

test("contact API returns 201 and appends a trimmed entry to submissions.json", async () => {
  const response = await contactPost(
    post("http://localhost/api/contact", { name: "  Zoe  ", email: "zoe@example.com", message: " hello " }),
  );
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.status, "success");

  const stored = JSON.parse(readFileSync(path.join(storageRoot, "storage", "submissions.json"), "utf8"));
  assert.equal(stored.length, 1);
  assert.equal(stored[0].name, "Zoe");
  assert.equal(stored[0].email, "zoe@example.com");
  assert.equal(stored[0].message, "hello");
  assert.ok(stored[0].id);
  assert.ok(stored[0].submittedAt);
});

test("blog API rejects blank title and content with field errors", async () => {
  const response = await blogsPost(post("http://localhost/api/blogs", { title: " ", content: "" }));
  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.status, "validation_error");
  assert.equal(body.errors.title, "Please enter a title.");
  assert.equal(body.errors.content, "Please enter content.");
});

test("blog API numbers a duplicate title slug instead of failing", async () => {
  const first = await blogsPost(post("http://localhost/api/blogs", { title: "Demo Post", content: "one" }));
  assert.equal(first.status, 201);
  const firstBody = await first.json();
  assert.equal(firstBody.status, "success");
  assert.equal(firstBody.post.slug, "demo-post");

  const second = await blogsPost(post("http://localhost/api/blogs", { title: "Demo Post", content: "two" }));
  assert.equal(second.status, 201);
  const secondBody = await second.json();
  assert.equal(secondBody.post.slug, "demo-post-2");

  const stored = JSON.parse(readFileSync(path.join(storageRoot, "storage", "blogs.json"), "utf8"));
  assert.equal(stored.length, 2);
});

after(() => {
  rmSync(storageRoot, { recursive: true, force: true });
});
