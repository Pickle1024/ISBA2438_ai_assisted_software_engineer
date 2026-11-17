import { useEffect, useState } from "react";

import { readFavoriteIds, writeFavoriteIds } from "@/lib/favorites";

export function useFavoriteIds(validIds: string[]) {
  // State starts empty on the server and on first render; LocalStorage is
  // read once after mount. Ids that no longer match a card are dropped.
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    // LocalStorage is only available in the browser. Reading it in a
    // microtask keeps the first render (and hydration) untouched.
    queueMicrotask(() => {
      if (cancelled) return;
      const stored = readFavoriteIds(window.localStorage);
      setFavorites(stored.filter((id) => validIds.includes(id)));
    });

    return () => {
      cancelled = true;
    };
  }, [validIds]);

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      // Update state, then write the new array back to LocalStorage.
      const next = current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id];
      writeFavoriteIds(window.localStorage, next);
      return next;
    });
  }

  function isFavorite(id: string): boolean {
    return favorites.includes(id);
  }

  return { favorites, isFavorite, toggleFavorite };
}
