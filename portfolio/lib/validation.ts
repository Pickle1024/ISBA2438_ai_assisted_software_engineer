export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactValidationResult =
  | { ok: true; data: ContactInput }
  | { ok: false; errors: ContactErrors };

export function isValidEmail(email: string): boolean {
  if (/\s/.test(email)) return false;

  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  if (local.length === 0) return false;

  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((label) => label.length > 0);
}

export function validateContact(input: ContactInput): ContactValidationResult {
  const name = input.name.trim();
  const message = input.message.trim();
  // Email is deliberately not trimmed: the rule rejects whitespace anywhere.
  const email = input.email;

  const errors: ContactErrors = {};
  if (name.length === 0) errors.name = "Please enter your name.";
  if (!isValidEmail(email)) errors.email = "Please enter a valid email address, like you@example.com.";
  if (message.length === 0) errors.message = "Please enter a message.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, message } };
}
