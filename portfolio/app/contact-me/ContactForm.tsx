"use client";

import { useRef, useState, type FormEvent } from "react";

import StatusBanner from "@/components/StatusBanner";
import type { ContactErrors, ContactField } from "@/lib/validation";

import type { ContactApiResponse } from "../api/contact/route";

type FormStatus = "idle" | "success" | "validation_error" | "request_error";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    setIsSending(true);
    let nextStatus: FormStatus = "request_error";
    let nextErrors: ContactErrors = {};
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ContactApiResponse;
      if (data.status === "success") {
        nextStatus = "success";
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
    setErrors(nextErrors);
    setStatus(nextStatus);
  }

  function fieldProps(field: ContactField) {
    const error = errors[field];
    return {
      id: field,
      name: field,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  function fieldError(field: ContactField) {
    const error = errors[field];
    return error ? (
      <p className="field-error" id={`${field}-error`}>
        {error}
      </p>
    ) : null;
  }

  return (
    <form ref={formRef} className="contact-form" noValidate onSubmit={handleSubmit}>
      {status === "success" && (
        <StatusBanner kind="success" title="Message sent">
          Thanks for reaching out. I’ll get back to you soon.
        </StatusBanner>
      )}
      {status === "validation_error" && (
        <StatusBanner kind="warning" title="Please check the highlighted fields">
          Your message hasn’t been sent yet.
        </StatusBanner>
      )}
      {status === "request_error" && (
        <StatusBanner kind="error" title="Something went wrong">
          Your message wasn’t sent. Check your connection and try again.
        </StatusBanner>
      )}

      <div className="field">
        <label htmlFor="name">Name</label>
        <input type="text" autoComplete="name" {...fieldProps("name")} />
        {fieldError("name")}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input type="text" inputMode="email" autoComplete="email" {...fieldProps("email")} />
        {fieldError("email")}
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea rows={6} {...fieldProps("message")} />
        {fieldError("message")}
      </div>

      <button type="submit" className="button" disabled={isSending}>
        {isSending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
