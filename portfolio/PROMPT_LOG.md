# Prompt log and critique (assignment 2, part 1)

## Tools used

The assignment requires the Viber Coding Agent. I started in Viber. It stopped responding after it proposed a plan, so I built the code with Claude Code instead. **The code in this submission was written by Claude Code, not Viber.** I used Claude Code to help ne understand the assignment instructions and plan how I can use Viber to rebuild my website using my local project files. 

Why this project: my existing portfolio was made in a no-code AI site builder. Rebuilding it in Next.js gives me code I own and understand.

## Major prompts

### 1. Planning prompt, sent to Viber (drafted with Claude Code)

> I'm building my personal portfolio website with Next.js (App Router, TypeScript) for a course assignment. Part 1 runs locally for now. The repository will be public. [...concept and five lenses...] Required pages, all reachable from one shared navigation: / , /about-me, /projects, /projects/[slug], /contact-me-server-form. [...exact contact form and email rules...] Part 2 will add /contact-me, which calls /api/contact [...] Do not build these now [...] Before writing any code, propose: folder structure, project data, contact flow, assumptions. Wait for my approval before building.

**Result:** Viber proposed a `portfolio/` subfolder, `data/projects.ts`, `lib/validation.ts`, `lib/submissions.ts`, and a client form that POSTs to `/api/contact`. No code was written.

### 2. Plan revision, for Viber

> /contact-me-server-form should be a real server form. Use a Server Action in an actions.ts next to the page, with useActionState. No fetch, no controlled inputs. Don't add /api/contact yet, that's Part 2. Keep lib/validation.ts and lib/submissions.ts so both can share them later. portfolio/ subfolder is fine, leave the Python files alone. Add an MIT LICENSE at the repo root and one line in the root README pointing to portfolio/. Go ahead and build.

**Result:** Viber stopped responding, so this was not built in Viber.

### 3. Switch to Claude Code since viber is not responding

> Let's just do it here, Viber is down and not answering. We just need to keep the prompt log well. I think wanting to rebuild my personal website on a new tech stack is also a reason worth stating.

**Result:** Claude Code built the approved plan: every file under `portfolio/`, the root `LICENSE`, and the root README line.

### 4. Real content (my own words, sent to Claude Code)

> you can check my other chats and zoe-os for position, title to refine the descriptions on my portfolio also I notice the projects now are only placeholders. can we add the images, videos we have locally to the website?

**Result:** Claude Code read my private notes for job titles and dates, rewrote the project and About copy, and replaced the placeholders with my existing videos and screenshots. Using rules I had written in those notes about what I can show publicly, it removed one project and renamed another, so the site now has four projects instead of the five in prompt 1. It also trimmed one video and redrew one visual in SVG for the same reason.

### 5. Order and visuals (my own words, sent to Claude Code)

> make some changes to the website: the new order: storyteller, analyst, builder(use multi images and make them into a 16:9 whole image. instead of singel image because the window is not fullfilled now. I don't want the black fields ) , explorer for Zoe-OS build a animation like lam research, now a static image like ppt

**Result:** Claude Code reordered the projects in `data/projects.ts`, combined my existing screenshots into one 16:9 image for TUTU, and rewrote `components/StatusWall.tsx` as an animated SVG driven by `requestAnimationFrame`.

### 6. 3D lens (translated from Chinese)

> Let's do the lens.

**Result:** Claude Code added an interactive 3D lens to the home page with Three.js (`lib/lensScene.ts`, `components/LensViewer.tsx`), reusing the lens model from my earlier site. Dragging or scrolling the lens switches projects.

## Critique

### Example 1: contact form transport (`app/contact-me-server-form/actions.ts`)
- **Proposed:** Viber's plan used a client component with `fetch` to `/api/contact`.
- **Decision:** Changed to a Server Action.
- **Why:** That design is what part 2's `/contact-me` page asks for. Using it here would make the two forms the same, and I had asked it not to build `/api/contact` yet.
- **Check and outcome:** Submitted the form in a browser. No request to `/api/contact` appeared, `GET /api/contact` returned 404, and the entry was saved in `storage/submissions.json`.

### Example 2: scaffold config and unknown slugs (`next.config.ts`)
- **Proposed:** The `create-next-app` scaffold enabled `cacheComponents` and `partialPrefetching`.
- **Decision:** Removed both flags.
- **Why:** With them on, the first request to an unknown slug returned HTTP 200 with no heading in the response. An unknown project should clearly be not found.
- **Check and outcome:** With the flags: `/projects/does-not-exist` returned 200 on the first request. Without them: it returned 404 every time, and the browser showed the "This reel isn't in the can" page. `/projects/picklens` and `/projects/tutu` returned 200 with different headings.

### Example 3: email validation (`lib/validation.ts`, `tests/validation.test.ts`)
- **Proposed:** Claude Code split the email on `@` and `.` and did not use a regular expression. It does not trim the email.
- **Decision:** Accepted, because the assignment rejects whitespace anywhere and trimming would hide that.
- **Check and outcome:** `npm test` ran 21 tests and all passed, including `a@@b.com`, `a b@c.com`, `@b.com`, `a@b`, `a@b..com`, `a@.com` and `a@b.`, which are rejected. In the browser, blank fields and `a@b..com` showed field errors and kept what I typed. Corrupting the JSON file on purpose showed the server-error banner and left the file unchanged.

---

# Prompt log and critique (assignment 2, part 2)

## Tools used

Viber worked again for this part, so everything below (the API contact form, the blog, the tests) was built in Viber, the tool the assignment requires. I kept the same workflow that worked in part 1: Viber proposes files and contracts before writing code, I answer its questions and override it when needed, then I verify with `npm test`, `npm run build` and `curl`.

## Major prompts

### 1. Part 2 scope: second contact form through an API

> OK now let's start part 2. I want a second contact page at /contact-me. Same three fields (name, email, message) with labels, but this time the form sends the data with fetch to a POST route handler at app/api/contact/route.ts instead of using a Server Action. Please reuse validateContact and saveSubmission instead of writing new validation [...] I'd like the API to return 201 when it saves, 400 with the field errors when validation fails, and 500 if saving breaks, and the page should show those clearly [...] Tell me which files you plan to add or change before you write anything.

**Result:** Viber listed the three new files and the response contract before writing anything, then asked how to handle two contact pages in the navigation. I chose: point the nav's Contact at `/contact-me` and put a small link to the other form on each page. It then built `app/api/contact/route.ts` and `app/contact-me/` (page + fetch form), reusing `lib/validation.ts` and `lib/submissions.ts` unchanged. Verified with curl: valid post → 201, each bad field → 400 with its own error, broken JSON → 400, GET → 405, both cross-links in the served HTML.

### 2. Repo housekeeping and a walkthrough

> My portfolio for part 1 is already on GitHub (main, commit e016eb3), but this folder is behind and has an old untracked portfolio/ folder from an earlier try. Please rename that folder to portfolio-old so nothing gets lost, pull main, and then read portfolio/ and tell me how the current contact form works, from app/contact-me-server-form to lib/validation.ts and lib/submissions.ts.

**Result:** Viber renamed my half-built folder to `portfolio-old/`, fast-forwarded main to `e016eb3`, and walked me through the form flow file by file, which I used to prepare my demo explanation.

### 3. Blog storage, API and seed

> Next, blogs. Add a lib/blogs.ts that reads and writes storage/blogs.json the same way lib/submissions.ts does. Then app/api/blogs/route.ts with a GET that returns all posts newest first, and a POST that takes a title and content, rejects them if they're blank after trimming, makes a slug from the title (add a number if that slug is taken), and returns the new post with 201. Since storage/ is gitignored, please also add a small seed file with two example posts, so /blogs isn't empty when someone clones the repo.

**Result:** Viber built `lib/blogs.ts` with the same discipline as `lib/submissions.ts` (server-only, serialized writes, atomic temp-file rename), a seed fallback, `app/api/blogs/route.ts`, a `/blogs` page and a nav entry. Verified with curl: seed posts on a fresh clone, slugs `hello-world`, `hello-world-2` for a duplicate title, `post` for a Chinese-only title, and 400s with field errors for blanks.

### 4. Blog pages

> Now the pages. /admin/blogs: a form with title and content that POSTs to /api/blogs with fetch, shows any errors from the API, and links to the new post after it's created. /blogs: load the list by calling GET /api/blogs from the client [...] /blogs/[slug]: show one post by reading lib/blogs.ts on the server, and use notFound() for a slug that doesn't exist, same as projects/[slug] does. Add Blogs to the nav, but leave the admin page out of it.

**Result:** Viber added the admin form (success banner links to the new post), a client-side blog list, and a server-rendered detail page with a friendly 404. The first build failed on a wrong relative import (`../api` from one folder too deep) and Viber fixed it after reading the error.

### 5. Tests and a full check

> let's check everything. Add tests for the two APIs (blank fields, a bad email, a valid submission, a duplicate blog title), then run the tests, lint and build and tell me what passed or failed. Then walk me through what happens from clicking submit on /contact-me to the line being written in submissions.json, with file names, so I can explain it myself in the demo.

**Result:** `tests/api.test.ts` added five tests, and all 26 tests passed; `npm run lint` and `npm run build` passed clean.

## Critique

### Example 1: how the blog seed works (`lib/blogs.ts`)
- **Proposed:** I only said "add a small seed file so /blogs isn't empty". Viber made reads fall back to a tracked `seed/blogs.json` when `storage/blogs.json` does not exist, and let GET stay read-only — the real file is only created on the first POST, already containing the seed posts.
- **Decision:** Accepted.
- **Why:** Copying the seed into storage on first read would make a GET write to disk, which is surprising and breaks on read-only setups. The fallback keeps a fresh clone working and keeps runtime data out of git.
- **Check and outcome:** With `storage/` deleted, `GET /api/blogs` returned the two seed posts and no storage folder appeared. After one POST, the file held the seed posts plus the new one.

### Example 2: rendering mode of `/blogs/[slug]` vs `/projects/[slug]`
- **Proposed:** Viber skipped `generateStaticParams` (which the projects template uses) and marked the blog detail page `force-dynamic`.
- **Decision:** Accepted.
- **Why:** Projects are static data in memory; blog posts change at runtime through the API, so prerendering at build time would freeze the pages.
- **Check and outcome:** After a curl POST, the new slug's page returned 200 immediately without a rebuild, and an unknown slug returned 404 with the "This post isn't in the can" page.

### Example 3: testing route handlers without Next.js running (`tests/`)
- **Proposed:** Import `app/api/contact/route.ts` and `app/api/blogs/route.ts` directly into `node --test`.
- **Decision:** Accepted with two additions Viber proposed: a small module-resolver hook (`tests/alias-hooks.mjs`) so Node understands the `@/` import alias, and `--conditions=react-server` so `import "server-only"` does not throw. The tests also `chdir` into a temp folder first, so they write to a temp storage and never touch real submissions.
- **Why:** Testing the real handlers (not a copy of their logic) is what makes the tests meaningful; the alternative would be testing against the running dev server, which is slow and brittle.
- **Check and outcome:** 26/26 tests pass, and `portfolio/storage/` stayed empty after `npm test`.

---

# Prompt log and critique (midterm)

## Tools used

Viber for everything in this part. Same workflow: Viber proposes the files and contracts, I review in the browser after each step, then tests, lint, build and curl before moving on.

## Major prompts

### 1. Midterm scope and the Prompt Lab idea (translated from Chinese)

> [pasted the midterm requirements] The project already has blogs... The LocalStorage feature and the backend feature can't repeat blogs/projects/contact, and all four API objects need full CRUD interfaces. My idea: add a Prompt Lab page that shares the AI prompts and Claude skills behind my videos — favorites use LocalStorage (no clash with the toggle), comments use backend CRUD (the custom third object). Let's go step by step: 1. get the page and cards on screen, 2. one-click copy, 3. favorites, 4. comments.

**Result:** Viber agreed the split satisfies both "different from previous features" rules and built step 1: `data/promptLab.ts` with seven cards (three prompt cards, four skill cards), a three-column showcase, `public/skills/` with the real skill folders and zips, and a Prompt Lab entry in the nav.

### 2. X embeds for the video cards (translated from Chinese)

> If every video card embeds X's official iframe directly, will that slow the page down? Give me two options.

**Result:** Viber offered (A) lazy iframes for every card and (B) a poster-style card that opens a `<dialog>` with the official X embed only after a click. I chose B. The page loads with zero iframes.

### 3. Copy buttons and favorites (translated from Chinese)

> Add one-click copy to every card... then: favorites should use LocalStorage, and make sure the code is testable.

**Result:** Viber added copy buttons with a clipboard fallback and a two-second "Copied ✓", then `lib/favorites.ts` as pure functions that take a `Storage` object (testable without a browser), `hooks/useFavorites.ts`, and an All/Favorites toggle with an empty state. Six new tests.

### 4. Comments with full CRUD (translated from Chinese)

> Make comments full CRUD: name + message; blank / too long / unknown cardId → 400 with a clear error; update or delete of an id that doesn't exist → 404; the server logs one line per API call (method, path, status, content); every comment gets Edit/Delete in the UI and the list updates immediately; and loading, error and empty states are all required.

**Result:** Viber built `lib/comments.ts` (same serialized atomic writes as blogs), `/api/comments` and `/api/comments/[id]`, a `CommentSection` client component with lazy loading, inline edit and two-step delete, and eight API tests. Server log lines like `[comments] POST /api/comments 201 — "Zoe: …"`.

### 5. "Continue now" — the remaining CRUD (translated from Chinese)

> Continue now.

**Result:** With the plan already agreed, Viber finished the rest of the midterm checklist in one pass: `PUT`/`DELETE /api/blogs/[id]` plus an `/admin/blogs` list with inline edit and delete; `GET`/`PUT`/`DELETE` for `/api/contact` plus an `/admin/contact` page; projects moved from a constant into `storage/projects.json` with `/api/projects` CRUD and an `/admin/projects` page; shared slug helpers extracted to `lib/slug.ts`; one `logApiCall` helper so blogs, contact, projects and comments all log in the same format. 52/52 tests, lint clean, build clean.

## Critique

### Example 1: where the projects seed lives (`data/projects.ts`, `lib/projects.ts`)
- **Proposed:** Viber first suggested converting all four projects into `seed/projects.json`, mirroring the blogs seed.
- **Decision:** Kept `data/projects.ts` as the seed source instead, and made `lib/projects.ts` fall back to it when `storage/projects.json` does not exist.
- **Why:** The projects are long, typed objects with covers and galleries; transcribing them into JSON by hand invited mistakes, while importing the existing constant keeps the type checking. The graded requirement — projects persisted to backend JSON and editable through CRUD — is still met: after the first create, edit or delete, the live copy is in `storage/projects.json`.
- **Check and outcome:** On a fresh clone `GET /api/projects` returned the four seed projects and created no file; after one create-and-delete cycle the file existed with the four projects again.

### Example 2: projects pages switched from prerendered to per-request (`app/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`)
- **Proposed:** Keep `generateStaticParams` and the static pages after moving projects to the file-based store.
- **Decision:** Removed `generateStaticParams`, marked the three pages `force-dynamic`, and made `getProjectBySlug` async.
- **Why:** Projects now change at runtime through `/api/projects`, so build-time prerendering would freeze them — the same reason `/blogs/[slug]` is dynamic. The build's type check caught the one page that still called the now-async reader without `await`.
- **Check and outcome:** Created a project through the API, its detail page returned 200 immediately without a rebuild; after `DELETE` the same page returned 404.

### Example 3: reading LocalStorage without cascading renders (`hooks/useFavorites.ts`)
- **Proposed:** Read LocalStorage and call `setFavorites` directly inside the mount effect.
- **Decision:** Wrapped the read in `queueMicrotask` with a `cancelled` flag.
- **Why:** The React lint rule rejects synchronous `setState` inside an effect because it forces an extra render before paint. The microtask keeps the first render (and hydration) identical to the server output while still restoring favorites right after mount.
- **Check and outcome:** `npm run lint` went from four errors to zero, and favorites still reappear after a reload.
