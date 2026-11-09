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
