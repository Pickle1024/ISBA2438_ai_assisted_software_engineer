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
| `/contact-me-server-form` | Contact form handled by a Server Action |

## How the contact form works

1. `app/contact-me-server-form/ContactForm.tsx` renders the form and submits it to a Server Action with `useActionState`. `noValidate` keeps the browser from blocking invalid input, so the server does the checking.
2. `app/contact-me-server-form/actions.ts` reads the form data and calls `validateContact` from `lib/validation.ts`. If validation fails, it returns field errors and what the visitor typed.
3. If validation passes, `saveSubmission` in `lib/submissions.ts` appends the entry to `storage/submissions.json`. The file is created on the first valid submission and is ignored by git because it holds personal data.
4. The action returns `success`, `validation_error` or `server_error`, and the form shows a different banner for each.

See [PROMPT_LOG.md](PROMPT_LOG.md) for the development process.

## Third-party and non-MIT assets

`public/models/lens.glb` was generated for my earlier portfolio in the web.it site builder. It and the images and videos in `public/media/` are not covered by the repository's MIT license. The 3D scene uses [Three.js](https://threejs.org) (MIT).
