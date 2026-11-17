"use client";

import { useEffect, useState, type FormEvent } from "react";

import StatusBanner from "@/components/StatusBanner";

type Submission = {
  id: string;
  submittedAt: string;
  name: string;
  email: string;
  message: string;
  updatedAt?: string;
};

type FieldErrors = { name?: string; email?: string; message?: string };

export default function ContactManager() {
  const [submissions, setSubmissions] = useState<Submission[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/contact");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setSubmissions(data);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setSubmissions(null);
          setFailed(true);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleSaveEdit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    setEditErrors({});
    setFailure(false);
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setSubmissions((current) =>
          current?.map((s) => (s.id === id ? data.submission : s)) ?? current,
        );
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
      const response = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.status === "success") {
        setSubmissions((current) => current?.filter((s) => s.id !== id) ?? current);
      } else {
        setFailure(true);
        setReloadKey((key) => key + 1);
      }
    } catch {
      setFailure(true);
    } finally {
      setSending(false);
      setConfirmingId(null);
    }
  }

  return (
    <>
      {failed && (
        <>
          <StatusBanner kind="error" title="Could not load messages">
            The /api/contact request failed.
          </StatusBanner>
          <button type="button" className="prompt-copy" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </>
      )}

      {failure && (
        <StatusBanner kind="error" title="Something went wrong">
          Your change wasn’t saved. Try again.
        </StatusBanner>
      )}

      {submissions !== null && submissions.length === 0 && (
        <p className="lede">No contact messages yet.</p>
      )}

      {submissions !== null && submissions.length > 0 && (
        <div className="admin-list">
          {submissions.map((submission) =>
            editingId === submission.id ? (
              <form
                key={submission.id}
                className="comment-form"
                onSubmit={(event) => handleSaveEdit(submission.id, event)}
              >
                <div className="field">
                  <label htmlFor={`edit-name-${submission.id}`}>Name</label>
                  <input
                    id={`edit-name-${submission.id}`}
                    name="name"
                    type="text"
                    defaultValue={submission.name}
                  />
                  {editErrors.name && <p className="field-error">{editErrors.name}</p>}
                </div>
                <div className="field">
                  <label htmlFor={`edit-email-${submission.id}`}>Email</label>
                  <input
                    id={`edit-email-${submission.id}`}
                    name="email"
                    type="text"
                    defaultValue={submission.email}
                  />
                  {editErrors.email && <p className="field-error">{editErrors.email}</p>}
                </div>
                <div className="field">
                  <label htmlFor={`edit-message-${submission.id}`}>Message</label>
                  <textarea
                    id={`edit-message-${submission.id}`}
                    name="message"
                    rows={4}
                    defaultValue={submission.message}
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
              <div key={submission.id} className="admin-item">
                <p className="comment-meta">
                  <span className="comment-name">{submission.name}</span>
                  <span>
                    {submission.submittedAt.slice(0, 10)}
                    {submission.updatedAt ? " · edited" : ""} · {submission.email}
                  </span>
                </p>
                <p className="comment-body">{submission.message}</p>
                <p className="comment-actions">
                  {confirmingId === submission.id ? (
                    <>
                      <button
                        type="button"
                        className="button"
                        disabled={sending}
                        onClick={() => handleDelete(submission.id)}
                      >
                        Confirm delete
                      </button>
                      <button type="button" className="prompt-copy" onClick={() => setConfirmingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="prompt-copy" onClick={() => setEditingId(submission.id)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="prompt-copy"
                        onClick={() => setConfirmingId(submission.id)}
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
    </>
  );
}
