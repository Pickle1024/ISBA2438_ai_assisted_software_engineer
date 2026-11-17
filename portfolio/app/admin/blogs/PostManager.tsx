"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";

import StatusBanner from "@/components/StatusBanner";

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

export default function PostManager() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [failure, setFailure] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<{ title?: string; content?: string }>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const createFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setPosts(data);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setPosts(null);
          setFailed(true);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    setErrors({});
    setFailure(false);
    let savedSlug: string | null = null;
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.get("title"), content: formData.get("content") }),
      });
      const data = await response.json();
      if (data.status === "success") savedSlug = data.post.slug;
      else if (data.status === "validation_error") setErrors(data.errors);
      else setFailure(true);
    } catch {
      setFailure(true);
    } finally {
      setSending(false);
    }
    if (savedSlug) {
      setCreatedSlug(savedSlug);
      createFormRef.current?.reset();
      setReloadKey((key) => key + 1);
    }
  }

  async function handleSaveEdit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSending(true);
    setEditErrors({});
    setFailure(false);
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.get("title"), content: formData.get("content") }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setPosts((current) => current?.map((p) => (p.id === id ? data.post : p)) ?? current);
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
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.status === "success") {
        setPosts((current) => current?.filter((p) => p.id !== id) ?? current);
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
          <StatusBanner kind="error" title="Could not load posts">
            The /api/blogs request failed.
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

      {createdSlug && (
        <StatusBanner kind="success" title="Post published">
          It is live on the blog now.{" "}
          <Link className="text-link" href={`/blogs/${createdSlug}`}>
            Read it →
          </Link>
        </StatusBanner>
      )}

      <form ref={createFormRef} className="comment-form" onSubmit={handleCreate}>
        <div className="field">
          <label htmlFor="post-title">Title</label>
          <input id="post-title" name="title" type="text" />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>
        <div className="field">
          <label htmlFor="post-content">Content</label>
          <textarea id="post-content" name="content" rows={8} />
          {errors.content && <p className="field-error">{errors.content}</p>}
        </div>
        <button type="submit" className="button" disabled={sending}>
          {sending ? "Publishing…" : "Publish post"}
        </button>
      </form>

      {posts !== null && posts.length === 0 && <p className="lede">No posts yet.</p>}

      {posts !== null && posts.length > 0 && (
        <div className="admin-list">
          {posts.map((post) =>
            editingId === post.id ? (
              <form
                key={post.id}
                className="comment-form"
                onSubmit={(event) => handleSaveEdit(post.id, event)}
              >
                <div className="field">
                  <label htmlFor={`edit-title-${post.id}`}>Title</label>
                  <input id={`edit-title-${post.id}`} name="title" type="text" defaultValue={post.title} />
                  {editErrors.title && <p className="field-error">{editErrors.title}</p>}
                </div>
                <div className="field">
                  <label htmlFor={`edit-content-${post.id}`}>Content</label>
                  <textarea
                    id={`edit-content-${post.id}`}
                    name="content"
                    rows={6}
                    defaultValue={post.content}
                  />
                  {editErrors.content && <p className="field-error">{editErrors.content}</p>}
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
              <div key={post.id} className="admin-item">
                <p className="comment-meta">
                  <span className="comment-name">{post.title}</span>
                  <span>
                    {post.createdAt.slice(0, 10)}
                    {post.updatedAt ? " · edited" : ""} · /blogs/{post.slug}
                  </span>
                </p>
                <p className="comment-body">{post.content}</p>
                <p className="comment-actions">
                  {confirmingId === post.id ? (
                    <>
                      <button
                        type="button"
                        className="button"
                        disabled={sending}
                        onClick={() => handleDelete(post.id)}
                      >
                        Confirm delete
                      </button>
                      <button type="button" className="prompt-copy" onClick={() => setConfirmingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="prompt-copy" onClick={() => setEditingId(post.id)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="prompt-copy"
                        onClick={() => setConfirmingId(post.id)}
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
