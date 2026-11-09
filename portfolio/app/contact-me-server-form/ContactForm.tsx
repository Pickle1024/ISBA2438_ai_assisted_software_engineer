"use client";

import { useActionState } from "react";

import StatusBanner from "@/components/StatusBanner";
import type { ContactField } from "@/lib/validation";

import { submitContactForm, type ContactFormState } from "./actions";

const initialState: ContactFormState = {
  status: "idle",
  values: { name: "", email: "", message: "" },
  errors: {},
};

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  function fieldProps(field: ContactField) {
    const error = state.errors[field];
    return {
      id: field,
      name: field,
      defaultValue: state.values[field],
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${field}-error` : undefined,
    };
  }

  function fieldError(field: ContactField) {
    const error = state.errors[field];
    return error ? (
      <p className="field-error" id={`${field}-error`}>
        {error}
      </p>
    ) : null;
  }

  return (
    <form action={formAction} className="contact-form" noValidate>
      {state.status === "success" && (
        <StatusBanner kind="success" title="Message sent">
          Thanks for reaching out. I’ll get back to you soon.
        </StatusBanner>
      )}
      {state.status === "validation_error" && (
        <StatusBanner kind="warning" title="Please check the highlighted fields">
          Your message hasn’t been sent yet.
        </StatusBanner>
      )}
      {state.status === "server_error" && (
        <StatusBanner kind="error" title="Something went wrong on our end">
          Your message wasn’t saved. Please try again.
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

      <button type="submit" className="button" disabled={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
