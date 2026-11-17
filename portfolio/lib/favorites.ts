export const FAVORITES_KEY = "prompt-lab-favorites";

export function readFavoriteIds(storage: Pick<Storage, "getItem">): string[] {
  // Read the raw value out of LocalStorage. Access itself can throw
  // (blocked or full storage), so guard it and treat failure as empty.
  let raw: string | null = null;
  try {
    raw = storage.getItem(FAVORITES_KEY);
  } catch {
    return [];
  }
  if (raw === null) return [];

  // JSON.parse throws on invalid JSON — treat corrupt data as empty.
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  // Keep string entries only; anything else is ignored.
  return parsed.filter((entry): entry is string => typeof entry === "string");
}

export function writeFavoriteIds(storage: Pick<Storage, "setItem">, ids: string[]): void {
  try {
    // Serialize the array and write it back in one go.
    storage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch {
    // A blocked or full storage must not break the page.
  }
}
