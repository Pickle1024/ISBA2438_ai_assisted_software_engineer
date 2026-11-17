"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import StatusBanner from "@/components/StatusBanner";

type Project = {
  id: string;
  slug: string;
  title: string;
  lens: string;
  lensHook: string;
  summary: string;
  role: string;
  period: string;
  accent: string;
  context: string;
  whatIDid: string[];
};

type FieldErrors = { title?: string; lens?: string };

const EMPTY: Project = {
  id: "",
  slug: "",
  title: "",
  lens: "",
  lensHook: "",
  summary: "",
  role: "",
  period: "",
  accent: "#e8e8e8",
  context: "",
  whatIDid: [],
};

function projectFields(project: Project): Record<string, string> {
  return {
    title: project.title,
    lens: project.lens,
    lensHook: project.lensHook,
    summary: project.summary,
    role: project.role,
    period: project.period,
    accent: project.accent,
    context: project.context,
    whatIDid: project.whatIDid.join("\n"),
  };
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setProjects(data);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setProjects(null);
          setFailed(true);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Returns the parsed response on success, null on failure.
  async function send(
    url: string,
    method: "POST" | "PUT",
    body: unknown,
    onFieldErrors: (errors: FieldErrors) => void,
  ): Promise<{ project: Project } | null> {
    setSending(true);
    setFailure(false);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (data.status === "validation_error") {
        onFieldErrors(data.errors);
        return null;
      }
      if (data.status !== "success") {
        setFailure(true);
        return null;
      }
      return data;
    } catch {
      setFailure(true);
      return null;
    } finally {
      setSending(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const body: Record<string, string> = {};
    for (const field of Object.keys(projectFields(EMPTY))) {
      body[field] = String(formData.get(field) ?? "");
    }
    setErrors({});
    const data = await send("/api/projects", "POST", body, setErrors);
    if (data) {
      setCreatedSlug(data.project.slug);
      form.reset();
      setReloadKey((key) => key + 1);
    }
  }

  async function handleSaveEdit(id: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const body: Record<string, string> = {};
    for (const field of Object.keys(projectFields(EMPTY))) {
      body[field] = String(formData.get(field) ?? "");
    }
    setEditErrors({});
    const data = await send(`/api/projects/${id}`, "PUT", body, setEditErrors);
    if (data) {
      setProjects((current) =>
        current?.map((p) => (p.id === id ? data.project : p)) ?? current,
      );
      setEditingId(null);
    }
  }

  async function handleDelete(id: string) {
    setSending(true);
    setFailure(false);
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.status === "success") {
        setProjects((current) => current?.filter((p) => p.id !== id) ?? current);
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
          <StatusBanner kind="error" title="Could not load projects">
            The /api/projects request failed.
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
        <StatusBanner kind="success" title="Project added">
          It is live on the projects page now.{" "}
          <Link className="text-link" href={`/projects/${createdSlug}`}>
            See it →
          </Link>
        </StatusBanner>
      )}

      <form className="comment-form" onSubmit={handleCreate}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="project-title">Title</label>
            <input id="project-title" name="title" type="text" />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>
          <div className="field">
            <label htmlFor="project-lens">Lens</label>
            <input id="project-lens" name="lens" type="text" placeholder="Storyteller / Analyst / Builder / Explorer" />
            {errors.lens && <p className="field-error">{errors.lens}</p>}
          </div>
        </div>
        <div className="field">
          <label htmlFor="project-hook">Lens hook (one line)</label>
          <input id="project-hook" name="lensHook" type="text" />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="project-role">Role</label>
            <input id="project-role" name="role" type="text" />
          </div>
          <div className="field">
            <label htmlFor="project-period">Period</label>
            <input id="project-period" name="period" type="text" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="project-summary">Summary</label>
          <input id="project-summary" name="summary" type="text" />
        </div>
        <div className="field">
          <label htmlFor="project-context">Context</label>
          <textarea id="project-context" name="context" rows={3} />
        </div>
        <div className="field">
          <label htmlFor="project-did">What I did (one item per line)</label>
          <textarea id="project-did" name="whatIDid" rows={4} />
        </div>
        <button type="submit" className="button" disabled={sending}>
          {sending ? "Saving…" : "Add project"}
        </button>
      </form>

      {projects !== null && projects.length === 0 && <p className="lede">No projects yet.</p>}

      {projects !== null && projects.length > 0 && (
        <div className="admin-list">
          {projects.map((project) =>
            editingId === project.id ? (
              <form
                key={project.id}
                className="comment-form"
                onSubmit={(event) => handleSaveEdit(project.id, event)}
              >
                <div className="field-row">
                  <div className="field">
                    <label htmlFor={`edit-title-${project.id}`}>Title</label>
                    <input id={`edit-title-${project.id}`} name="title" type="text" defaultValue={project.title} />
                    {editErrors.title && <p className="field-error">{editErrors.title}</p>}
                  </div>
                  <div className="field">
                    <label htmlFor={`edit-lens-${project.id}`}>Lens</label>
                    <input id={`edit-lens-${project.id}`} name="lens" type="text" defaultValue={project.lens} />
                    {editErrors.lens && <p className="field-error">{editErrors.lens}</p>}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={`edit-hook-${project.id}`}>Lens hook</label>
                  <input id={`edit-hook-${project.id}`} name="lensHook" type="text" defaultValue={project.lensHook} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor={`edit-role-${project.id}`}>Role</label>
                    <input id={`edit-role-${project.id}`} name="role" type="text" defaultValue={project.role} />
                  </div>
                  <div className="field">
                    <label htmlFor={`edit-period-${project.id}`}>Period</label>
                    <input id={`edit-period-${project.id}`} name="period" type="text" defaultValue={project.period} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor={`edit-summary-${project.id}`}>Summary</label>
                  <input id={`edit-summary-${project.id}`} name="summary" type="text" defaultValue={project.summary} />
                </div>
                <div className="field">
                  <label htmlFor={`edit-context-${project.id}`}>Context</label>
                  <textarea id={`edit-context-${project.id}`} name="context" rows={3} defaultValue={project.context} />
                </div>
                <div className="field">
                  <label htmlFor={`edit-did-${project.id}`}>What I did (one item per line)</label>
                  <textarea id={`edit-did-${project.id}`} name="whatIDid" rows={4} defaultValue={project.whatIDid.join("\n")} />
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
              <div key={project.id} className="admin-item">
                <p className="comment-meta">
                  <span className="comment-name">{project.title}</span>
                  <span>
                    {project.lens} · {project.period} · /projects/{project.slug}
                  </span>
                </p>
                <p className="comment-body">{project.summary}</p>
                <p className="comment-actions">
                  {confirmingId === project.id ? (
                    <>
                      <button
                        type="button"
                        className="button"
                        disabled={sending}
                        onClick={() => handleDelete(project.id)}
                      >
                        Confirm delete
                      </button>
                      <button type="button" className="prompt-copy" onClick={() => setConfirmingId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="prompt-copy" onClick={() => setEditingId(project.id)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="prompt-copy"
                        onClick={() => setConfirmingId(project.id)}
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
