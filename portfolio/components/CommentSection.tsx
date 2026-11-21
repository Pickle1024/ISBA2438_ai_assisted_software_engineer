"use client";

import { useCallback, useRef, useState, type FormEvent, type SyntheticEvent } from "react";

import CommentList, { type Comment } from "@/components/CommentList";
import StatusBanner from "@/components/StatusBanner";

type CommentErrors = {
  cardId?: string;
  name?: string;
  message?: string;
};

// CommentSection owns the data: it fetches the comments for one card, sends
// the create form, and answers the onEdit/onDelete callbacks from the list.
// The list itself is rendered by CommentList from props.
export default function CommentSection({ cardId }: { cardId: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<CommentErrors>({});
  const [failure, setFailure] = useState(false);
  const createFormRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    setFailed(false);
    try {
      const response = await fetch(`/api/comments?cardId=${encodeURIComponent(cardId)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setComments(await response.json());
    } catch {
      setFailed(true);
      setComments(null);
    }
  }, [cardId]);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    if (event.currentTarget.open && comments === null) load();
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    setErrors({});
    setFailure(false);
    let saved = false;
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          name: formData.get("name"),
          message: formData.get("message"),
        }),
      });
      const data = await response.json();
      if (data.status === "success") saved = true;
      else if (data.status === "validation_error") setErrors(data.errors);
      else setFailure(true);
    } catch {
      setFailure(true);
    } finally {
      setSending(false);
    }
    if (saved) {
      createFormRef.current?.reset();
      await load();
    }
  }

  // Passed down to CommentList. Returns the server's field errors, or null
  // when the update went through and the row can close its form.
  async function handleEdit(
    id: string,
    values: { name: string; message: string },
  ): Promise<{ name?: string; message?: string } | null> {
    setFailure(false);
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.status === "success") {
        setComments((current) => current?.map((c) => (c.id === id ? data.comment : c)) ?? current);
        return null;
      }
      if (data.status === "validation_error") return data.errors;
      setFailure(true);
      return {};
    } catch {
      setFailure(true);
      return {};
    }
  }

  async function handleDelete(id: string): Promise<void> {
    setFailure(false);
    try {
      const response = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.status === "success") {
        setComments((current) => current?.filter((c) => c.id !== id) ?? current);
      } else {
        setFailure(true);
        await load();
      }
    } catch {
      setFailure(true);
    }
  }

  return (
    <details className="lab-details comment-section" onToggle={handleToggle}>
      <summary>Comments {comments !== null ? `(${comments.length})` : ""}</summary>

      {failed && (
        <>
          <StatusBanner kind="error" title="Could not load comments">
            The /api/comments request failed.
          </StatusBanner>
          <p className="comment-actions">
            <button type="button" className="prompt-copy" onClick={load}>
              Try again
            </button>
          </p>
        </>
      )}

      {!failed && comments === null && <p className="comment-empty">Loading comments…</p>}

      {!failed && comments !== null && (
        <CommentList comments={comments} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {failure && (
        <StatusBanner kind="error" title="Something went wrong">
          Your comment wasn’t saved. Try again.
        </StatusBanner>
      )}

      <form ref={createFormRef} className="comment-form" onSubmit={handleCreate}>
        <div className="field">
          <label htmlFor={`comment-name-${cardId}`}>Name</label>
          <input id={`comment-name-${cardId}`} name="name" type="text" autoComplete="name" />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor={`comment-message-${cardId}`}>Comment</label>
          <textarea id={`comment-message-${cardId}`} name="message" rows={3} />
          {errors.message && <p className="field-error">{errors.message}</p>}
          {errors.cardId && <p className="field-error">{errors.cardId}</p>}
        </div>
        <button type="submit" className="button" disabled={sending}>
          {sending ? "Sending…" : "Post comment"}
        </button>
      </form>
    </details>
  );
}
