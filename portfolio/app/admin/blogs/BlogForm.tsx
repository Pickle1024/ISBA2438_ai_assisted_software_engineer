"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";

import StatusBanner from "@/components/StatusBanner";

import type { BlogApiResponse } from "../../api/blogs/route";

type FormStatus = "idle" | "success" | "validation_error" | "request_error";
type Field = "title" | "content";
type CreatedPost = Extract<BlogApiResponse, { status: "success" }>["post"];

export default function BlogForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [created, setCreated] = useState<CreatedPost | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      title: formData.get("title"),
      content: formData.get("content"),
    };

    setIsSending(true);
    let nextStatus: FormStatus = "request_error";
    let nextErrors: { title?: string; content?: string } = {};
    let nextCreated: CreatedPost | null = null;
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as BlogApiResponse;
      if (data.status === "success") {
        nextStatus = "success";
        nextCreated = data.post;
      } else if (data.status === "validation_error") {
        nextStatus = "validation_error";
        nextErrors = data.errors;
      }
    } catch {
      nextStatus = "request_error";
    } finally {
      setIsSending(false);
    }

    if (nextStatus === "success") formRef.current?.reset();
    setCreated(nextCreated);
    setErrors(nextErrors);
    setStatus(nextStatus);
  }

  function fieldProps(field: Field) {
    const error = errors[field];
    return {
      id: field,
      name: field,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  function fieldError(field: Field) {
    const error = errors[field];
    return error ? (
      <p className="field-error" id={`${field}-error`}>
        {error}
      </p>
    ) : null;
  }

  return (
    <form ref={formRef} className="contact-form" noValidate onSubmit={handleSubmit}>
      {status === "success" && created && (
        <StatusBanner kind="success" title="Post published">
          It is live on the blog now.{" "}
          <Link className="text-link" href={`/blogs/${created.slug}`}>
            Read “{created.title}” →
          </Link>
        </StatusBanner>
      )}
      {status === "validation_error" && (
        <StatusBanner kind="warning" title="Please check the highlighted fields">
          Your post hasn’t been published yet.
        </StatusBanner>
      )}
      {status === "request_error" && (
        <StatusBanner kind="error" title="Something went wrong">
          Your post wasn’t saved. Check the server and try again.
        </StatusBanner>
      )}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input type="text" {...fieldProps("title")} />
        {fieldError("title")}
      </div>

      <div className="field">
        <label htmlFor="content">Content</label>
        <textarea rows={12} {...fieldProps("content")} />
        {fieldError("content")}
      </div>

      <button type="submit" className="button" disabled={isSending}>
        {isSending ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
