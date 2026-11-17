import assert from "node:assert/strict";
import { test } from "node:test";

import { FAVORITES_KEY, readFavoriteIds, writeFavoriteIds } from "../lib/favorites.ts";

function fakeStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

test("reads an empty result when nothing is stored", () => {
  assert.deepEqual(readFavoriteIds(fakeStorage()), []);
});

test("reads back what was written", () => {
  const storage = fakeStorage();
  writeFavoriteIds(storage, ["picklens", "tutu"]);
  assert.deepEqual(readFavoriteIds(storage), ["picklens", "tutu"]);
  assert.deepEqual(JSON.parse(storage.getItem(FAVORITES_KEY) as string), ["picklens", "tutu"]);
});

test("treats invalid JSON as empty", () => {
  assert.deepEqual(readFavoriteIds(fakeStorage({ [FAVORITES_KEY]: "not json{" })), []);
});

test("treats a non-array value as empty", () => {
  assert.deepEqual(readFavoriteIds(fakeStorage({ [FAVORITES_KEY]: '{"a":1}' })), []);
});

test("ignores non-string entries inside the array", () => {
  assert.deepEqual(readFavoriteIds(fakeStorage({ [FAVORITES_KEY]: '[1, "ok", null, {}]' })), ["ok"]);
});

test("does not throw when storage is blocked", () => {
  const blocked = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  assert.deepEqual(readFavoriteIds(blocked), []);
  assert.doesNotThrow(() => writeFavoriteIds(blocked, ["picklens"]));
});
