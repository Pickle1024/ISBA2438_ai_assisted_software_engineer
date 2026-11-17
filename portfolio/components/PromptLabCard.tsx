"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import CommentSection from "./CommentSection";
import type { LabCard, PromptCard } from "@/data/promptLab";

function xTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

type PromptLabCardProps = {
  card: LabCard;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function PromptLabCard({ card, isFavorite, onToggleFavorite }: PromptLabCardProps) {
  const tweetId = card.videoUrl ? xTweetId(card.videoUrl) : null;
  const accent = card.accent ?? "#c9a46a";
  const initial = card.title.trim().charAt(0).toUpperCase() || "★";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [copyState, setCopyState] = useState<{ label: string; ok: boolean } | null>(null);
  const copyTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  function copyPrompt(prompt: PromptCard) {
    const done = (ok: boolean) => {
      setCopyState({ label: prompt.label, ok });
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopyState(null), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(prompt.text)
        .then(() => done(true))
        .catch(() => done(false));
      return;
    }

    const area = document.createElement("textarea");
    area.value = prompt.text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(area);
    done(ok);
  }

  const poster = (
    <div
      className="lab-poster"
      style={
        card.image
          ? undefined
          : {
              backgroundImage: `radial-gradient(130% 130% at 20% 10%, ${accent} 0%, rgba(13, 12, 10, 0.96) 76%)`,
            }
      }
      aria-hidden="true"
    >
      {card.image ? (
        <Image
          src={card.image}
          alt=""
          fill
          sizes="(max-width: 680px) 100vw, (max-width: 1040px) 50vw, 33vw"
          className="lab-poster-image"
        />
      ) : (
        <span className="lab-poster-initial">{initial}</span>
      )}
      <span className="lab-poster-chip">{tweetId ? "▶ Watch" : "Skill"}</span>
    </div>
  );

  return (
    <article className="lab-card">
      <div className="lab-media">
        {poster}
        {tweetId && (
          <button
            type="button"
            className="lab-watch"
            aria-label={`Watch: ${card.title}`}
            onClick={() => {
              setEmbedOpen(true);
              dialogRef.current?.showModal();
            }}
          />
        )}
        <button
          type="button"
          className={isFavorite ? "lab-fav is-favorite" : "lab-fav"}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${card.title} from favorites`
              : `Add ${card.title} to favorites`
          }
          onClick={onToggleFavorite}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="lab-body">
        <p className="eyebrow">
          {card.kind === "prompt" ? "Prompt" : "Skill"}
          {card.date ? ` · ${card.date}` : ""}
        </p>
        <h2>{card.title}</h2>
        <p className="lab-summary">{card.summary}</p>
        {card.tools && <p className="lab-tools">{card.tools}</p>}

        {card.prompts && card.prompts.length > 0 && (
          <details className="lab-details">
            <summary>View the prompts ({card.prompts.length})</summary>
            {card.prompts.map((prompt) => {
              const copied = copyState?.label === prompt.label;
              return (
                <div key={prompt.label} className="prompt-block">
                  <div className="prompt-head">
                    <p className="prompt-label">{prompt.label}</p>
                    <button
                      type="button"
                      className={copied ? "prompt-copy copied" : "prompt-copy"}
                      onClick={() => copyPrompt(prompt)}
                    >
                      {copied ? (copyState?.ok ? "Copied ✓" : "Copy failed") : "Copy"}
                    </button>
                  </div>
                  <pre className="prompt-text">
                    <code>{prompt.text}</code>
                  </pre>
                  {prompt.note && <p className="prompt-note">{prompt.note}</p>}
                </div>
              );
            })}
          </details>
        )}

        <CommentSection cardId={card.id} />

        <p className="lab-footer">
          {card.videoUrl && (
            <a className="text-link" href={card.videoUrl}>
              Watch on X ↗
            </a>
          )}
          {card.sourceUrl && (
            <a className="text-link" href={card.sourceUrl}>
              {card.sourceLabel ?? "Source"} ↗
            </a>
          )}
          {card.githubUrl && (
            <a className="text-link" href={card.githubUrl}>
              GitHub ↗
            </a>
          )}
          {card.downloadUrl && (
            <a className="button" href={card.downloadUrl} download>
              Download ZIP
            </a>
          )}
        </p>
      </div>

      {tweetId && (
        <dialog
          ref={dialogRef}
          className="lab-dialog"
          aria-label={`Watch: ${card.title}`}
          onClose={() => setEmbedOpen(false)}
          onClick={(event) => {
            if (event.target === dialogRef.current) dialogRef.current?.close();
          }}
        >
          <div className="lab-dialog-inner">
            <button
              type="button"
              className="lab-dialog-close"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
            {embedOpen && (
              <iframe
                className="x-embed"
                src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark&dnt=true&lang=en&autoplay=false`}
                title={card.title}
                allowFullScreen
              />
            )}
          </div>
        </dialog>
      )}
    </article>
  );
}
