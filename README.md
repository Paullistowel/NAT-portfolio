# NAT's Portfolio

Interactive 3D modeling & CAD portfolio. Next.js 16 · TypeScript · Tailwind CSS 4 · React Three Fiber / Drei · GSAP · Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also type-checks)
npm run lint
```

Deploys to Vercel as-is: import the repo, add the env vars from `.env.example` if you want the contact form, deploy.

---

## Where everything lives

| What | Where |
| --- | --- |
| Profile, about, skills, process, resume text, links, video title | `src/content/site.ts` |
| Projects (Selected Works + project pages) | `src/content/projects.ts` |
| 3D models (3D Studio gallery, hero, project viewers) | `src/content/models.ts` |
| STL files | `public/models/` (`.stl.gz` copies are generated at build time) |
| Project images | `public/images/projects/<project-slug>/` |
| Model thumbnails (gallery cards, WebGL fallback, covers for model-only projects) | `public/images/renders/<model-id>.png` |
| Videos | `public/videos/` + the `videos` list in `src/content/site.ts` |
| Optional hero background loop | `public/videos/hero-loop.mp4` (+ `hero-loop-poster.jpg`) |
| Resume | `public/documents/resume.pdf` |

Any field left as `null` shows a dashed amber **[Placeholder]** note in development and is **hidden in production**,
so nothing unfinished or invented ever reaches visitors. Set `NEXT_PUBLIC_SHOW_PLACEHOLDERS=true` to see them on a preview deploy.

## Common updates

### Replace or add a 3D model
1. Put the `.stl` (binary or ASCII) in `public/models/`.
2. Add or edit an entry in `src/content/models.ts` — `file`, `title`, `sizeMb`, `caption`, and `project` (slug) to show it on that project's page.
3. The viewer centres and scales the geometry automatically. Models are treated as Y-up (SolidWorks default); if one arrives on its side, set `rotation: [x, y, z]` in radians.
4. Change `heroModelId` to pick the hero model — keep it a small file (under ~3 MB) so the first screen stays fast.
5. Optional: add a static render at `public/images/renders/<id>.png` for the no-WebGL fallback (the existing ones were rendered from your STLs).

### Add a project
1. Create `public/images/projects/<slug>/` and add images.
2. Copy an entry in `src/content/projects.ts`, set a unique `slug`, and fill in the fields. Include each image's real `width`/`height` (Finder → Get Info, or `sips -g pixelWidth -g pixelHeight file.jpg`) so the layout doesn't shift.
3. The project page at `/projects/<slug>` is generated automatically. Set `featured: false` to list it under "More work" instead of the large layout.

### Update images
Replace the file in `public/images/projects/<slug>/` (keep the name) or change the `src` in `projects.ts`. Images are optimised automatically by `next/image` and never upscaled past their native width.

### Add videos
1. Put H.264 MP4 files (and a poster `.jpg` for each) in `public/videos/`.
2. List them in `videos` in `src/content/site.ts` — `src`, `poster`, `title`, optional `description`, and `project: "<slug>"` to also show a video on that project page.
3. Rebuild. Entries whose file doesn't exist are skipped, so the Video section only appears once a real file is present. With two or more videos visitors get a selectable playlist. Videos use `preload="none"`: only posters load until someone presses play.
4. Optional: a short, muted loop at `public/videos/hero-loop.mp4` plays behind the hero (static poster for visitors who prefer reduced motion). Keep it under ~4 MB.

### Add or replace the resume
Save your CV as `public/documents/resume.pdf`. The **Download Resume** button activates automatically on the next build — no code changes.

### Contact form
The form only goes live when an email provider is configured; until then it shows a clear "not active yet" message instead of pretending to send.
1. Create a free account at [resend.com](https://resend.com) and an API key.
2. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (where messages should go). For a custom sender, verify your domain in Resend and set `CONTACT_FROM_EMAIL`.
3. Redeploy. Spam protection: honeypot field, minimum fill time, per-IP rate limit, server-side validation.

## How the site is put together
- **Hero** — live STL with drag-to-rotate (on mouse/trackpad; touch keeps normal scrolling), a switcher for three light models, and a live triangle/envelope readout. Edit `HERO_MODELS` in `src/app/page.tsx`.
- **Selected Works** — featured projects in a horizontal gallery: pinned and driven by scroll on large screens, a native swipe row on phones or with reduced motion.
- **Renders & Drawings** — one carousel with every project's images, grouped by project. The same carousel (thumbnails, arrows, swipe, keyboard, fullscreen lightbox) is used on project pages.
- **3D Studio** — every model in `models.ts` appears as a card in the gallery and loads into the viewer without a page reload.
- **Light / dark mode** — toggle in the nav. Visitors who haven't chosen follow their system setting; a choice is saved in the browser. Colours are tokens in `src/app/globals.css` (`:root` = dark, `[data-theme="light"]` = light — keep the two light blocks in sync). Use the `light:` Tailwind variant for one-off light-mode tweaks. To make dark the default for everyone, change the fallback in `src/lib/theme-script.ts`.
- **Background** — `src/components/AmbientBackground.tsx`: ambient light, grid, particles and wireframe solids on one throttled canvas; static under reduced motion.

## 3D viewer notes
- Models download as `.stl.gz` (about a third of the size) and are decompressed in the worker; if the `.gz` is missing (e.g. in `npm run dev` before a build) the raw `.stl` is used. Run `npm run compress-models` to regenerate manually.
- STLs are downloaded and parsed in a Web Worker (with streamed progress), so even the 11.6 MB SOD model doesn't freeze the page. Results are cached, so switching back to a model is instant.
- Normals are computed with crease detection (32°): curved surfaces render smooth and machined edges stay sharp.
- Three.js loads only when the viewer nears the viewport; the hero model waits until the browser is idle. Rendering pauses when a viewer is off-screen.
- **Exploded view**: the Explode button separates an assembly into its parts, and a slider sets how far apart they move. STL files don't store parts, so the viewer treats each separate closed shell in the mesh as one part. That works for multi-body SolidWorks assembly exports. A model exported as a single merged body (currently HARP) has nothing to separate, so its button is disabled. Re-export it as an assembly STL ("one file, all components") to enable it.
- Controls: drag to rotate, scroll/pinch to zoom, right-drag/two-finger drag to pan, preset views, solid / wireframe / edge-inspection modes, auto-rotate (off when the visitor prefers reduced motion), reset, fullscreen. Keyboard: arrows, `+`/`−`, `1–4`, `S`/`W`/`E`, `X` explode, `[`/`]` explode amount, `Space`, `R`, `F`, `K` for the cheat-sheet.
# NAT-portfolio
