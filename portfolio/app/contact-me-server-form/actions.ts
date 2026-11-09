"use server";

import { saveSubmission } from "@/lib/submissions";
import { validateContact, type ContactErrors, type ContactInput } from "@/lib/validation";

export type ContactFormState = {
  status: "idle" | "success" | "validation_error" | "server_error";
  values: ContactInput;
  errors: ContactErrors;
};

function readField(formData: FormData, field: keyof ContactInput): string {
  const value = formData.get(field);
  return typeof value === "string" ? value : "";
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values: ContactInput = {
    name: readField(formData, "name"),
    email: readField(formData, "email"),
    message: readField(formData, "message"),
  };

  const result = validateContact(values);
  if (!result.ok) return { status: "validation_error", values, errors: result.errors };

  try {
    await saveSubmission(result.data);
  } catch (error) {
    console.error("Could not save contact submission", error);
    return { status: "server_error", values, errors: {} };
  }

  return { status: "success", values: { name: "", email: "", message: "" }, errors: {} };
}
