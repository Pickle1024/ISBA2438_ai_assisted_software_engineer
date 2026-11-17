// Slug helpers shared by blogs and projects.

// Demo post, demo post!, DEMO POST... all become demo-post.
export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug === "" ? "post" : slug;
}

// demo-post, demo-post-2, demo-post-3 — slugs already taken are skipped.
export function uniqueSlug(base: string, taken: Set<string>): string {
  let candidate = base;
  let counter = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}
