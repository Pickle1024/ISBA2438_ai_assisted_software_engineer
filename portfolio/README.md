# Pick a lens

My portfolio, rebuilt from scratch in Next.js for ISBA 2438 assignment 2. I present myself through a set of lenses, each tied to one project.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # validation rules
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Lens selector |
| `/about-me` | Background |
| `/projects` | All projects |
| `/projects/[slug]` | One template for every project, with a friendly page for unknown slugs |
| `/blogs` | Blog list, loaded in the browser from `GET /api/blogs` |
| `/blogs/[slug]` | One post, read on the server from `lib/blogs.ts`, with a friendly page for unknown slugs |
| `/prompt-lab` | The prompts and skills behind my videos, with copy buttons, LocalStorage favorites and per-card comments |
| `/admin/blogs` | Publish, edit and delete posts through `/api/blogs` (not in the navigation) |
| `/admin/projects` | Add, edit and delete projects through `/api/projects` (not in the navigation) |
| `/admin/contact` | Read, edit and delete contact submissions through `/api/contact` (not in the navigation) |
| `/contact-me` | Contact form that posts JSON to the `/api/contact` route handler |
| `/contact-me-server-form` | Contact form handled by a Server Action |

## How the contact forms work

Two contact pages send messages through the same rules and the same file:

- `/contact-me-server-form` submits to a Server Action with `useActionState`.
- `/contact-me` posts JSON with `fetch` to `app/api/contact/route.ts`, which returns `201` on success, `400` with field errors when validation fails and `500` when saving breaks.

Both reuse `validateContact` from `lib/validation.ts` and `saveSubmission` from `lib/submissions.ts`:

1. `noValidate` on both forms keeps the browser from blocking invalid input, so the server does the checking.
2. Validation trims name and message, checks the email rules, and returns field errors together with what the visitor typed.
3. `saveSubmission` appends the entry to `storage/submissions.json`. The file is created on the first valid submission and is ignored by git because it holds personal data.
4. Each form shows a different banner for success, validation error and server failure.

## Blog

`GET /api/blogs` returns every post as a JSON array, newest first. `POST /api/blogs` takes a JSON body with `title` and `content`, rejects blanks after trimming, turns the title into a slug (a number is added if the slug is taken) and returns the new post with `201`. `PUT /api/blogs/[id]` edits a post (a new title gets a fresh slug) and `DELETE /api/blogs/[id]` removes it; both return `404` for an unknown id. Posts live in `storage/blogs.json`, read and written by `lib/blogs.ts` with the same serialized atomic writes as `lib/submissions.ts`. Because that folder is gitignored, `seed/blogs.json` holds two example posts that back the blog on a fresh clone.

`/blogs` fetches that API from the browser, `/blogs/[slug]` reads the same file on the server, and `/admin/blogs` lists every post with an inline edit form, a two-step delete and the publish form.

## Projects

Projects used to be a constant in `data/projects.ts`. They are now rows in `storage/projects.json`, read and written by `lib/projects.ts` with the same serialized atomic writes as blogs. On a fresh clone the four seed projects come back from `data/projects.ts`, and the first create or edit materialises `storage/projects.json`.

`/api/projects` supports the full set: `GET` lists all, `POST` creates (title and lens required, the title becomes a unique slug, missing fields get plain defaults), `PUT /api/projects/[id]` edits (a new title re-slugs) and `DELETE /api/projects/[id]` removes. Unknown ids return `404`; blank titles return `400` with a field error. Every call writes one `[projects]` line to the server log.

`/`, `/projects` and `/projects/[slug]` read the file on the server per request (`force-dynamic`), so an edit in `/admin/projects` shows up immediately.

## Prompt Lab

`/prompt-lab` is the local showcase for the prompts and Claude skills behind my videos. Each card has one-click copy buttons, an X embed that only mounts after a click, and a comment section backed by `/api/comments` (create, edit and delete with `400`/`404` handling). Favorites are stored in LocalStorage — `lib/favorites.ts` holds the pure storage functions, `hooks/useFavorites.ts` the React hook — so the page keeps state without a login.

## Contact admin

`/admin/contact` lists every submission from `storage/submissions.json` newest first, with inline edit (`PUT /api/contact/[id]`, reusing `validateContact`, so a bad email is rejected) and a two-step delete (`DELETE /api/contact/[id]`). `GET /api/contact` backs the list.

See [PROMPT_LOG.md](PROMPT_LOG.md) for the development process.

## Third-party and non-MIT assets

`public/models/lens.glb` was generated for my earlier portfolio in the web.it site builder. It and the images and videos in `public/media/` are not covered by the repository's MIT license. The 3D scene uses [Three.js](https://threejs.org) (MIT).
