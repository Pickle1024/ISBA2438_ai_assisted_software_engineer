export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type CommentInput = {
  cardId: string;
  name: string;
  message: string;
};

export type CommentErrors = {
  cardId?: string;
  name?: string;
  message?: string;
};

export const COMMENT_NAME_MAX = 60;
export const COMMENT_MESSAGE_MAX = 600;

export type PostInput = {
  title: string;
  content: string;
};

export type PostErrors = {
  title?: string;
  content?: string;
};

// Blog post rules shared by POST (create) and PUT (edit).
export function validatePost(title: string, content: string): PostErrors {
  const errors: PostErrors = {};
  if (title.trim() === "") errors.title = "Please enter a title.";
  if (content.trim() === "") errors.content = "Please enter content.";
  return errors;
}

export type ProjectInput = {
  title: string;
  lens: string;
  lensHook?: string;
  summary?: string;
  role?: string;
  period?: string;
  accent?: string;
  context?: string;
  whatIDid?: string;
};

export type ProjectErrors = {
  title?: string;
  lens?: string;
};

// Project rules shared by POST (create) and PUT (edit). Every other field is
// optional; the storage layer fills in defaults.
export function validateProject(input: ProjectInput): ProjectErrors {
  const errors: ProjectErrors = {};
  if (input.title.trim() === "") errors.title = "Please enter a title.";
  if (input.lens.trim() === "") errors.lens = "Please enter a lens.";
  return errors;
}

// Comment rules shared by POST (create) and PUT (edit).
export function validateComment(name: string, message: string): CommentErrors {
  const errors: CommentErrors = {};
  if (name.trim() === "") {
    errors.name = "Please enter your name.";
  } else if (name.trim().length > COMMENT_NAME_MAX) {
    errors.name = `Please use a shorter name — ${COMMENT_NAME_MAX} characters max.`;
  }
  if (message.trim() === "") {
    errors.message = "Please enter a comment.";
  } else if (message.trim().length > COMMENT_MESSAGE_MAX) {
    errors.message = `Please shorten your comment — ${COMMENT_MESSAGE_MAX} characters max.`;
  }
  return errors;
}

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
