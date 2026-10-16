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
| 3D models (3D Studio, hero, project viewers) | `src/content/models.ts` |
| STL files | `public/models/` |
| Project images | `public/images/projects/<project-slug>/` |
| Static STL renders (WebGL fallback + covers for model-only projects) | `public/images/renders/` |
| Video | `public/videos/showcase.mp4` (+ optional `showcase-poster.jpg`) |
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

### Add the video
Drop an H.264 MP4 at `public/videos/showcase.mp4` (and ideally a poster frame at `public/videos/showcase-poster.jpg`). The section appears automatically on the next build. Set its description in `site.video.description`. The video uses `preload="none"`, so nothing downloads until someone presses play.

### Add or replace the resume
Save your CV as `public/documents/resume.pdf`. The **Download Resume** button activates automatically on the next build — no code changes.

### Contact form
The form only goes live when an email provider is configured; until then it shows a clear "not active yet" message instead of pretending to send.
1. Create a free account at [resend.com](https://resend.com) and an API key.
2. Set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (where messages should go). For a custom sender, verify your domain in Resend and set `CONTACT_FROM_EMAIL`.
3. Redeploy. Spam protection: honeypot field, minimum fill time, per-IP rate limit, server-side validation.

## 3D viewer notes
- STLs are downloaded and parsed in a Web Worker (with streamed progress), so even the 11.6 MB SOD model doesn't freeze the page. Results are cached, so switching back to a model is instant.
- Normals are computed with crease detection (32°): curved surfaces render smooth and machined edges stay sharp.
- Three.js loads only when the viewer nears the viewport; the hero model waits until the browser is idle. Rendering pauses when a viewer is off-screen.
- Controls: drag to rotate, scroll/pinch to zoom, right-drag/two-finger drag to pan, preset views, solid / wireframe / edge-inspection modes, auto-rotate (off when the visitor prefers reduced motion), reset, fullscreen. Keyboard: arrows, `+`/`−`, `1–4`, `S`/`W`/`E`, `Space`, `R`, `F`, `K` for the cheat-sheet.
# NAT-portfolio
