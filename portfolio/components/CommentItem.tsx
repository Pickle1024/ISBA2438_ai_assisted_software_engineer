"use client";

import { useState, type FormEvent } from "react";

import type { Comment } from "@/components/CommentList";

type CommentErrors = {
  name?: string;
  message?: string;
};

type CommentItemProps = {
  comment: Comment;
  // Data flows down through props; changes flow up through these callbacks.
  // onEdit returns the field errors when the update is rejected, null when saved.
  onEdit: (id: string, values: { name: string; message: string }) => Promise<CommentErrors | null>;
  onDelete: (id: string) => Promise<void>;
};

// One comment in the list. Which row is being edited or confirmed is local
// view state — the parent only sees the two callbacks above.
export default function CommentItem({ comment, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [editErrors, setEditErrors] = useState<CommentErrors>({});

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    setEditErrors({});
    const errors = await onEdit(comment.id, {
      name: String(formData.get("name") ?? ""),
      message: String(formData.get("message") ?? ""),
    });
    setSending(false);
    if (errors === null) setEditing(false);
    else setEditErrors(errors);
  }

  async function handleDelete() {
    setSending(true);
    await onDelete(comment.id);
    setSending(false);
  }

  if (editing) {
    return (
      <form className="comment-form" onSubmit={handleSave}>
        <div className="field">
          <label htmlFor={`edit-name-${comment.id}`}>Name</label>
          <input
            id={`edit-name-${comment.id}`}
            name="name"
            type="text"
            defaultValue={comment.name}
          />
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
          <button type="button" className="prompt-copy" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </p>
      </form>
    );
  }

  return (
    <div className="comment-item">
      <p className="comment-meta">
        <span className="comment-name">{comment.name}</span>
        <span>
          {comment.createdAt.slice(0, 10)}
          {comment.updatedAt ? " · edited" : ""}
        </span>
      </p>
      <p className="comment-body">{comment.message}</p>
      <p className="comment-actions">
        {confirming ? (
          <>
            <button type="button" className="button" disabled={sending} onClick={handleDelete}>
              Confirm delete
            </button>
            <button type="button" className="prompt-copy" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" className="prompt-copy" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button type="button" className="prompt-copy" onClick={() => setConfirming(true)}>
              Delete
            </button>
          </>
        )}
      </p>
    </div>
  );
}
