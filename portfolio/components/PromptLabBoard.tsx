"use client";

import { useMemo, useState } from "react";

import type { LabCard } from "@/data/promptLab";
import { useFavoriteIds } from "@/hooks/useFavorites";

import PromptLabCard from "./PromptLabCard";

export default function PromptLabBoard({ cards }: { cards: LabCard[] }) {
  const validIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const { favorites, isFavorite, toggleFavorite } = useFavoriteIds(validIds);
  const [view, setView] = useState<"all" | "favorites">("all");

  const visible =
    view === "favorites" ? cards.filter((card) => favorites.includes(card.id)) : cards;

  return (
    <>
      <div className="lab-view-toggle" role="group" aria-label="Filter cards">
        <button type="button" aria-pressed={view === "all"} onClick={() => setView("all")}>
          All ({cards.length})
        </button>
        <button
          type="button"
          aria-pressed={view === "favorites"}
          onClick={() => setView("favorites")}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="lede lab-empty">
          No favorites yet. Tap the star on any card to keep it here.
        </p>
      ) : (
        <div className="lab-grid">
          {visible.map((card) => (
            <PromptLabCard
              key={card.id}
              card={card}
              isFavorite={isFavorite(card.id)}
              onToggleFavorite={() => toggleFavorite(card.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
