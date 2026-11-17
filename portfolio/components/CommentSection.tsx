"use client";

import { useCallback, useRef, useState, type FormEvent, type SyntheticEvent } from "react";

import StatusBanner from "@/components/StatusBanner";

type Comment = {
  id: string;
  cardId: string;
  name: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
};

type CommentErrors = {
  cardId?: string;
  name?: string;
  message?: string;
};

export default function CommentSection({ cardId }: { cardId: string }) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<CommentErrors>({});
  const [failure, setFailure] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<CommentErrors>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
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

  async function handleSaveEdit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    setEditErrors({});
    setFailure(false);
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.get("name"), message: formData.get("message") }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setComments((current) => current?.map((c) => (c.id === id ? data.comment : c)) ?? current);
        setEditingId(null);
      } else if (data.status === "validation_error") {
        setEditErrors(data.errors);
      } else {
        setFailure(true);
      }
    } catch {
      setFailure(true);
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    setSending(true);
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
    } finally {
      setSending(false);
      setConfirmingId(null);
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

      {!failed && comments !== null && comments.length === 0 && (
        <p className="comment-empty">No comments yet. Start the conversation.</p>
      )}

      {!failed && comments !== null && comments.length > 0 && (
        <div className="comment-list">
          {comments.map((comment) =>
            editingId === comment.id ? (
              <form
                key={comment.id}
                className="comment-form"
                onSubmit={(event) => handleSaveEdit(comment.id, event)}
              >
                <div className="field">
                  <label htmlFor={`edit-name-${comment.id}`}>Name</label>
                  <input id={`edit-name-${comment.id}`} name="name" type="text" defaultValue={comment.name} />
                  {editErrors.name && <p className="field-error">{editErrors.name}</p>}
                </div>
                <div className="field">
                  <label htmlFor={`edit-message-${comment.id}`}>Comment</label>
                  <textarea
                    id={`edit-message-${comment.id}`}
                    name="message"
                    rows={3}
                    defaultValue={comment.message}
                  />
                  {editErrors.message && <p className="field-error">{editErrors.message}</p>}
                </div>
                <p className="comment-actions">
                  <button type="submit" className="button" disabled={sending}>
                    Save
                  </button>
                  <button type="button" className="prompt-copy" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </p>
              </form>
            ) : (
              <div key={comment.id} className="comment-item">
                <p className="comment-meta">
                  <span className="comment-name">{comment.name}</span>
                  <span>
                    {comment.createdAt.slice(0, 10)}
                    {comment.updatedAt ? " · edited" : ""}
                  </span>
                </p>
                <p className="comment-body">{comment.message}</p>
                <p className="comment-actions">
                  {confirmingId === comment.id ? (
                    <>
                      <button
                        type="button"
                        className="button"
                        disabled={sending}
                        onClick={() => handleDelete(comment.id)}
                      >
                        Confirm delete
                      </button>
                      <button type="button" className="prompt-copy" onClick={() => setConfirmingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="prompt-copy"
                        onClick={() => setEditingId(comment.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="prompt-copy"
                        onClick={() => setConfirmingId(comment.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </p>
              </div>
            ),
          )}
        </div>
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
