import assert from "node:assert/strict";
import { test } from "node:test";

import { isValidEmail, validateContact } from "../lib/validation.ts";

const rejected = [
  "", "a", "a@b", "a@@b.com", "a@b@c.com", "@b.com", "a b@c.com", " a@b.com", "a@b.com ",
  "a@b .com", "a@b..com", "a@.com", "a@b.", "a@.", "a@b.com\n", "a\t@b.com",
];
const accepted = ["test@example.com", "a@b.co", "first.last+tag@mail.example.org"];

for (const email of rejected) {
  test(`rejects email ${JSON.stringify(email)}`, () => assert.equal(isValidEmail(email), false));
}
for (const email of accepted) {
  test(`accepts email ${JSON.stringify(email)}`, () => assert.equal(isValidEmail(email), true));
}

test("rejects name and message that are blank after trimming", () => {
  const result = validateContact({ name: "   ", email: "test@example.com", message: "\n\t " });
  assert.equal(result.ok, false);
  if (!result.ok) assert.deepEqual(Object.keys(result.errors).sort(), ["message", "name"]);
});

test("trims name and message on success", () => {
  const result = validateContact({ name: "  Zoe ", email: "test@example.com", message: " hi " });
  assert.deepEqual(result, { ok: true, data: { name: "Zoe", email: "test@example.com", message: "hi" } });
});
