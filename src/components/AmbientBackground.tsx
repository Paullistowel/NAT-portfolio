"use client";

import { useEffect, useRef } from "react";

type Vec3 = [number, number, number];
type Solid = { verts: Vec3[]; edges: [number, number][]; x: number; y: number; size: number; depth: number; speed: number; tilt: number };

const PHI = (1 + Math.sqrt(5)) / 2;
const ICOSA: Vec3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
const CUBE: Vec3[] = [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [x, y, z] as Vec3)));
const OCTA: Vec3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

/** Connect every pair of vertices at the shortest distance — gives the polyhedron's edges. */
function edgesOf(verts: Vec3[]): [number, number][] {
  const d = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  let min = Infinity;
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) min = Math.min(min, d(verts[i], verts[j]));
  const out: [number, number][] = [];
  for (let i = 0; i < verts.length; i++) for (let j = i + 1; j < verts.length; j++) if (d(verts[i], verts[j]) < min * 1.01) out.push([i, j]);
  return out;
}

/**
 * Site-wide atmosphere: slow ambient light, a fine technical grid, sparse drifting particles and
 * a few wireframe solids, all with gentle pointer/scroll parallax. One throttled 2D canvas,
 * paused when the tab is hidden; a single static frame when the visitor prefers reduced motion.
 */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    // Particle / wireframe colour comes from the theme tokens and follows theme switches.
    let rgb = "215, 220, 226";
    const readColor = () => {
      rgb = getComputedStyle(document.documentElement).getPropertyValue("--particle-rgb").trim() || rgb;
      if (reduce) draw(0);
    };
    const themeObserver = new MutationObserver(readColor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let w = 0;
    let h = 0;
    let particles: { x: number; y: number; vx: number; vy: number; r: number; z: number }[] = [];
    const solids: Solid[] = [
      { verts: ICOSA, edges: edgesOf(ICOSA), x: 0.84, y: 0.22, size: 120, depth: 0.6, speed: 0.06, tilt: 0.4 },
      { verts: CUBE, edges: edgesOf(CUBE), x: 0.1, y: 0.68, size: 70, depth: 0.35, speed: -0.045, tilt: 0.7 },
      { verts: OCTA, edges: edgesOf(OCTA), x: 0.62, y: 0.86, size: 90, depth: 0.45, speed: 0.05, tilt: 0.2 },
    ];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
        r: Math.random() * 1.1 + 0.3,
        z: Math.random() * 0.8 + 0.2,
      }));
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.tx = e.clientX / w - 0.5;
      pointer.ty = e.clientY / h - 0.5;
    };

    const draw = (t: number) => {
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, w, h);

      // Particles + faint links between close neighbours.
      for (const p of particles) {
        if (!reduce) {
          p.x = (p.x + p.vx + w) % w;
          p.y = (p.y + p.vy + h) % h;
        }
      }
      const px = (p: (typeof particles)[number]) => p.x - pointer.x * 30 * p.z;
      const py = (p: (typeof particles)[number]) => ((p.y - scroll * 0.05 * p.z) % h + h) % h - pointer.y * 30 * p.z;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        const ax = px(a), ay = py(a);
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = ax - px(b), dy = ay - py(b);
          const dist = dx * dx + dy * dy;
          if (dist < 14000) {
            ctx.strokeStyle = `rgba(${rgb},${0.05 * (1 - dist / 14000)})`;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(px(b), py(b));
            ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${rgb},${0.18 * a.z})`;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wireframe solids.
      const time = reduce ? 0 : t / 1000;
      for (const s of solids) {
        const ang = time * s.speed;
        const cy = Math.cos(ang), sy = Math.sin(ang), cx = Math.cos(s.tilt + ang * 0.6), sx = Math.sin(s.tilt + ang * 0.6);
        const size = s.size * Math.min(1, w / 1200);
        const ox = s.x * w - pointer.x * 60 * s.depth;
        const oy = s.y * h - scroll * 0.12 * s.depth - pointer.y * 60 * s.depth;
        const wrapY = ((oy % (h + 400)) + h + 400) % (h + 400) - 200;
        const proj = s.verts.map(([x, y, z]) => {
          const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
          const y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
          const persp = 4 / (4 + z2);
          return [ox + x1 * size * persp * 0.5, wrapY + y1 * size * persp * 0.5, z2] as const;
        });
        ctx.lineWidth = 0.7;
        for (const [i, j] of s.edges) {
          const depthAlpha = 0.05 + 0.04 * (1 - (proj[i][2] + proj[j][2] + 4) / 8);
          ctx.strokeStyle = `rgba(${rgb},${depthAlpha})`;
          ctx.beginPath();
          ctx.moveTo(proj[i][0], proj[i][1]);
          ctx.lineTo(proj[j][0], proj[j][1]);
          ctx.stroke();
        }
      }

      // Grid parallax (CSS layer).
      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${-pointer.x * 14}px, ${(-scroll * 0.03) % 64 - pointer.y * 14}px, 0)`;
      }
    };

    resize();
    readColor();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });

    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || t - last < 33) return; // ~30 fps is plenty for ambient motion
      last = t;
      draw(t);
    };
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      {/* Slow ambient light */}
      <div className="ambient-light absolute -inset-[20%]" />
      {/* Technical grid */}
      <div ref={gridRef} className="absolute -inset-16 will-change-transform">
        <div className="blueprint-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_40%,black_10%,transparent_70%)] opacity-70" />
        <div className="blueprint-grid-fine absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_40%,black_0%,transparent_55%)] opacity-60" />
      </div>
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Vignette keeps the edges calm and text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,transparent_40%,var(--vignette)_100%)]" />
    </div>
  );
}
