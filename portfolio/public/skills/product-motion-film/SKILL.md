---
name: "product-motion-film"
description: "Make premium SaaS-style product launch videos and feature clips in code (HTML + GSAP, optional Three.js) from a brief, product recordings and a brand kit, with test render, independent critic review and archived reusable templates."
---

# Product motion film

Build short product videos (15–90s) entirely in code, at the level of top SaaS launch films (Linear, Arc, Apple, Notion). Works for any company or a personal channel.

## Setup (every session)

1. Clone the reference kit and read only its SKILL.md first:
   `git clone --depth 1 https://github.com/echris6/motion-video-kit.git`
   Skill path: `motion-video-kit/business-motion-film/`. Read each `references/*.md` file only when the current step needs it (table in its SKILL.md). Never read all references at once.
2. Install deps locally: `npm i gsap three` (use local files, not CDNs, for rendering).
3. If you have your own motion kit, read its `README.md`, `ASSETS.md`, `WORKFLOW.md` and the latest `PROMPT_*.md`. Reuse existing templates and assets before making new ones.

## Inputs to collect (ask once, then proceed)

- What is promoted, who watches and what they care about, the single CTA
- Length, aspect ratio, fps
- Brand: logo SVG, fonts, palette, tone
- Fact source: the only allowed source of on-screen claims
- Assets: native product screen recordings (one per feature, 30–60s, light mode, demo account), website source, avatars, screenshots
- Style references (videos); else use the kit's launch-film-notes
- Feature status: which features work (show real UI rebuilt in HTML) vs. not working (concept animation only, equally polished, labelled in delivery notes)

If the user says they are away, decide reasonably, keep going, and record every judgment in the delivery notes.

## Rules

1. Each scene is its own HTML page; one GSAP timeline drives the film; every animated state is a pure function of timeline time (no requestAnimationFrame, Date.now or unseeded random). Expose `window.render(t)`; with `?render=1` the page does not autoplay.
2. Rebuild product UI in HTML one-to-one from the native recordings and website source. Do not paste screenshots into scenes.
3. Use Three.js only to explain space or structure.
4. All assets are local files. API keys live only in environment variables.
5. Render a 5-second test first (render pipeline, motion, output) before the full film.
6. Final render: Playwright screenshots at device_scale_factor=2, one frame per timeline time, then ffmpeg (lanczos) down to target size. Split frame ranges across parallel processes for long films.
7. Check cursor clicks land on the real target element: measure the element's position in the DOM before animating the cursor.
8. Zoom in when the copy walks through specific UI elements. Dense UIs are unreadable at full screen, so when a line of copy is about one element (a call window, a card, the composer), zoom into that region so every word is readable; for phones, showing only the top or bottom half of the device, cropped by the frame, works well. When a shot only needs to show what the whole screen or device looks like, keep it wide. Decide per shot; don't zoom everything.

## Workflow

0. Align goal and messaging: "we say / we don't say"; break down any reference film (structure, pacing, presenter or not, voiceover or not).
1. Brief + storyboard table: time → what the viewer sees → what this beat must explain → transition out (which element survives). About 12 compositions per 30s; vary scale (macro, wide, UI close-up, type impact). For transitions, use the `silky-motion` skill.
2. References: contact sheets with small frames (320–480px wide), dense only around transitions; write 3–5 borrowable motion mechanisms per reference. Never copy footage, layouts, logos or music.
3. Build components in isolation; check stills before they join the film.
4. Assemble; carry objects across scenes at exact pixel positions.
5. Review: a fresh agent that did not build the film sees only rendered frames + brief and lists the biggest problems. Fix, re-render, new critic verifies item by item. Max 3 rounds; stop when remaining items are cosmetic.
6. Audio: generate music in code when no licensed track is available; cuts and logo hit on beat.
7. Deliver: MP4, poster frame, contact sheet, editable source, delivery notes (judgments, critic changes, concept vs. real scenes, limits). Archive new templates into your motion kit and record lessons learned.

## Budget

- Read reference files on demand, once.
- Look at one small contact sheet at a time.
- Preview at 1x; render 2x only for the final.
- At most 3 review rounds.

## Never

- Invent users, metrics, reviews, customer cases or prices.
- Name competitors.
- Present non-working features as real recordings.
- Show real people's photos, real names or internal group names without confirmed consent; prefer AI-generated avatars.
- Copy reference films' footage, logos, layouts or music.
