"use client";

import { Canvas } from "@react-three/fiber";
import {
  AlertTriangle,
  Box,
  Grid3x3,
  Maximize2,
  Minimize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ScanLine,
  Boxes,
  Keyboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import type { ModelEntry, ViewName } from "@/content/models";
import { CameraRig, Floor, floorY, StlMesh, StudioLights, type CameraApi, type DisplayMode, type ExplodeUniform } from "./Scene";
import { Placeholder } from "@/components/ui/Placeholder";
import type { ProcessedStl } from "./stl-processing";
import { hasWebGL, useStl } from "./useStl";

type Props = {
  models: ModelEntry[];
  initialId?: string;
  /** Studio: viewer with a side gallery rail. Embed: compact viewer for project pages. */
  variant?: "studio" | "embed";
  /** Show a "View project" link for models that belong to a project. */
  linkProjects?: boolean;
  onModelChange?: (id: string) => void;
};

const VIEWS: { id: ViewName; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
  { id: "iso", label: "Iso" },
];

const MODES: { id: DisplayMode; label: string; icon: ReactNode; key: string }[] = [
  { id: "solid", label: "Solid", icon: <Box size={15} strokeWidth={1.5} />, key: "S" },
  { id: "wireframe", label: "Wireframe", icon: <Grid3x3 size={15} strokeWidth={1.5} />, key: "W" },
  { id: "inspect", label: "Inspect edges", icon: <ScanLine size={15} strokeWidth={1.5} />, key: "E" },
];

const fmt = (n: number) => (n >= 100 ? Math.round(n).toString() : n.toFixed(1));

export default function ModelViewer({ models, initialId, variant = "studio", linkProjects = false, onModelChange }: Props) {
  const [activeId, setActiveId] = useState(initialId ?? models[0]?.id);
  const model = models.find((m) => m.id === activeId) ?? models[0];
  const reduceMotion = useReducedMotion();

  const [mode, setMode] = useState<DisplayMode>("solid");
  /** 0 = assembled, 1 = fully exploded. `lastExplode` remembers the slider when toggling off. */
  const [explode, setExplodeState] = useState(0);
  const lastExplode = useRef(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [edgesLoading, setEdgesLoading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [retry, setRetry] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);

  const container = useRef<HTMLDivElement>(null);
  const camera = useRef<CameraApi>(null);
  const state = useStl(model?.file ?? null, retry);

  // Keep the last loaded model on screen while the next one downloads, so switching never blanks the canvas.
  const [shown, setShown] = useState<{ model: ModelEntry; data: ProcessedStl } | null>(null);
  const switching = !!shown && !!model && shown.model.id !== model.id;
  // Shared with the floor shadow so it can fade while the model is exploded; fresh per model.
  const shownId = shown?.model.id;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- a new uniform per model resets the animation
  const explodeUniform = useMemo<ExplodeUniform>(() => ({ value: 0 }), [shownId]);
  useEffect(() => {
    if (state.status === "ready" && model) setShown({ model, data: state.data }); // eslint-disable-line react-hooks/set-state-in-effect
  }, [state, model]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only capability check
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    if (reduceMotion) setAutoRotate(false); // eslint-disable-line react-hooks/set-state-in-effect
  }, [reduceMotion]);

  // Stop rendering when the viewer is scrolled out of view.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = container.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      // Fullscreen API unavailable (e.g. iOS Safari on iPhone) — fail quietly.
    }
  }, []);

  const selectModel = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setMode("solid");
    setExplodeState(0);
    onModelChange?.(id);
  };

  const canExplode = (shown?.data.bodies ?? 0) > 1 && !switching;
  const setExplode = (value: number) => {
    if (!canExplode) return;
    const v = Math.min(1, Math.max(0, Math.round(value * 100) / 100));
    setExplodeState(v);
    if (v > 0) lastExplode.current = v;
    camera.current?.frameExplode(v);
  };
  const toggleExplode = () => setExplode(explode > 0 ? 0 : lastExplode.current);
  const reset = () => {
    setExplodeState(0);
    camera.current?.reset();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLButtonElement && (e.key === " " || e.key === "Enter")) return;
    const k = e.key.toLowerCase();
    const step = Math.PI / 12;
    const actions: Record<string, () => void> = {
      arrowleft: () => camera.current?.orbit(-step, 0),
      arrowright: () => camera.current?.orbit(step, 0),
      arrowup: () => camera.current?.orbit(0, -step),
      arrowdown: () => camera.current?.orbit(0, step),
      "+": () => camera.current?.zoom(1),
      "=": () => camera.current?.zoom(1),
      "-": () => camera.current?.zoom(-1),
      r: reset,
      x: () => toggleExplode(),
      "[": () => setExplode(explode - 0.1),
      "]": () => setExplode(explode + 0.1),
      f: toggleFullscreen,
      k: () => setShowKeys((v) => !v),
      escape: () => setShowKeys(false),
      " ": () => setAutoRotate((v) => !v),
      s: () => setMode("solid"),
      w: () => setMode("wireframe"),
      e: () => setMode("inspect"),
      "1": () => camera.current?.setView("front"),
      "2": () => camera.current?.setView("side"),
      "3": () => camera.current?.setView("top"),
      "4": () => camera.current?.setView("iso"),
    };
    const action = actions[k];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  if (!model) return null;
  const ready = state.status === "ready";
  const current = shown?.model ?? model;
  const multi = models.length > 1;
  const viewerHeight = fullscreen
    ? "h-screen w-screen"
    : variant === "studio"
      ? "h-[62vh] min-h-[400px] lg:h-[74vh]"
      : "h-[56vh] min-h-[360px]";

  const viewer = (
    <div
      ref={container}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label={`Interactive 3D model: ${model.title}. Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan. Press K for keyboard shortcuts.`}
      role="application"
      className={`group/viewer relative isolate overflow-hidden border border-line bg-[radial-gradient(ellipse_at_50%_35%,var(--stage-from)_0%,var(--stage-to)_72%)] outline-none focus-visible:border-silver ${viewerHeight}`}
    >
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />

      {webgl === false ? (
        <NoWebGL model={model} />
      ) : (
        webgl && (
          <Canvas
            frameloop={visible ? "always" : "never"}
            dpr={[1, 2]}
            camera={{ fov: 32, near: 0.01, far: 100, position: [3, 2.4, 3] }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
            className={`transition-[opacity,filter] duration-700 ${shown ? (switching ? "opacity-35 blur-[2px]" : "opacity-100") : "opacity-0"}`}
          >
            <StudioLights />
            {shown && (
              <group key={shown.model.id}>
                <StlMesh
                  data={shown.data}
                  mode={mode}
                  rotation={shown.model.rotation}
                  explode={switching ? 0 : explode}
                  uniform={explodeUniform}
                  onEdgesLoading={setEdgesLoading}
                />
                <Floor y={floorY(shown.data, shown.model.rotation)} explode={explodeUniform} />
              </group>
            )}
            <CameraRig apiRef={camera} autoRotate={autoRotate} initialView={current.initialView} resetKey={current.id} />
          </Canvas>
        )
      )}

      {state.status === "loading" && webgl !== false && <LoadingOverlay state={state} sizeMb={model.sizeMb} />}
      {state.status === "error" && <ErrorOverlay message={state.message} onRetry={() => setRetry((r) => r + 1)} />}

      <Corners />

      {shown && (
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
          <div className="flex flex-wrap gap-2">
            <Toolbar>
              {VIEWS.map((v, i) => (
                <ToolButton key={v.id} align="start" label={`${v.label} view (${i + 1})`} onClick={() => camera.current?.setView(v.id)}>
                  <span className="px-0.5 font-mono text-[10px] tracking-[0.14em] uppercase">{v.label}</span>
                </ToolButton>
              ))}
            </Toolbar>
            <Toolbar>
              {MODES.map((m) => (
                <ToolButton key={m.id} align="start" label={`${m.label} (${m.key})`} pressed={mode === m.id} onClick={() => setMode(m.id)}>
                  {m.icon}
                </ToolButton>
              ))}
            </Toolbar>
            <Toolbar>
              <ToolButton
                align="start"
                label={
                  canExplode
                    ? explode > 0
                      ? "Assemble (X)"
                      : `Explode view — ${shown.data.bodies} bodies (X)`
                    : "Single body — nothing to explode"
                }
                pressed={explode > 0}
                disabled={!canExplode}
                onClick={toggleExplode}
              >
                <Boxes size={15} strokeWidth={1.5} />
                <span className="ml-1.5 hidden font-mono text-[10px] tracking-[0.14em] uppercase sm:inline">Explode</span>
              </ToolButton>
              {explode > 0 && (
                <label className="flex items-center gap-2 pr-2 pl-1">
                  <span className="sr-only">Explode amount</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(explode * 100)}
                    onChange={(e) => setExplode(Number(e.target.value) / 100)}
                    onKeyDown={(e) => e.stopPropagation()}
                    aria-valuetext={`${Math.round(explode * 100)}% exploded`}
                    className="range-tool h-1 w-20 sm:w-28"
                    style={{ ["--p" as string]: `${explode * 100}%` }}
                  />
                  <span className="w-8 text-right font-mono text-[10px] text-muted tabular-nums">{Math.round(explode * 100)}%</span>
                </label>
              )}
            </Toolbar>
          </div>
          <Toolbar>
            <ToolButton align="end" label="Zoom in (+)" onClick={() => camera.current?.zoom(1)}>
              <Plus size={15} strokeWidth={1.5} />
            </ToolButton>
            <ToolButton align="end" label="Zoom out (−)" onClick={() => camera.current?.zoom(-1)}>
              <Minus size={15} strokeWidth={1.5} />
            </ToolButton>
            <ToolButton
              align="end"
              label={autoRotate ? "Pause auto-rotate (Space)" : "Resume auto-rotate (Space)"}
              pressed={autoRotate}
              onClick={() => setAutoRotate((v) => !v)}
            >
              {autoRotate ? <Pause size={15} strokeWidth={1.5} /> : <Play size={15} strokeWidth={1.5} />}
            </ToolButton>
            <ToolButton align="end" label="Reset view (R)" onClick={reset}>
              <RotateCcw size={15} strokeWidth={1.5} />
            </ToolButton>
            <ToolButton align="end" label="Keyboard shortcuts (K)" pressed={showKeys} onClick={() => setShowKeys((v) => !v)} className="hidden sm:inline-flex">
              <Keyboard size={15} strokeWidth={1.5} />
            </ToolButton>
            <ToolButton align="end" label={fullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize2 size={15} strokeWidth={1.5} /> : <Maximize2 size={15} strokeWidth={1.5} />}
            </ToolButton>
          </Toolbar>
        </div>
      )}

      {shown && (
        <div className="pointer-events-none absolute top-3 left-3 max-w-[60%] font-mono text-[10px] leading-5 tracking-[0.14em] text-faint uppercase sm:top-4 sm:left-4">
          <div className="truncate text-muted">{current.title}</div>
          <div>
            {shown.data.triangles.toLocaleString("en-US")} tris · {mode}
            {edgesLoading && " · computing edges…"}
          </div>
        </div>
      )}

      {shown && (
        <div className="pointer-events-none absolute top-3 right-3 hidden text-right font-mono text-[10px] leading-5 tracking-[0.14em] text-faint uppercase sm:top-4 sm:right-4 sm:block">
          <div>Drag · rotate</div>
          <div>Scroll · zoom</div>
          <div>Right-drag · pan</div>
        </div>
      )}

      {showKeys && shown && <ShortcutSheet onClose={() => setShowKeys(false)} />}
    </div>
  );

  const info = (
    <figcaption className="grid gap-5 border-b border-line pb-6 md:grid-cols-[1fr_auto] md:gap-10">
      <div aria-live="polite">
        <div className="eyebrow mb-2">{model.category}</div>
        <h3 className="text-[clamp(1.15rem,1.8vw,1.5rem)] leading-snug font-medium tracking-[-0.02em]">{model.title}</h3>
        {model.description ? (
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{model.description}</p>
        ) : (
          <div className="mt-2">
            <Placeholder label={`Description for ${model.title}`} file="src/content/models.ts" />
          </div>
        )}
        {linkProjects && model.project && (
          <Link href={`/projects/${model.project}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:text-silver">
            <span className="border-b border-line-strong pb-0.5">View project</span> <ArrowUpRight size={15} strokeWidth={1.5} />
          </Link>
        )}
      </div>
      <dl className="grid grid-cols-4 gap-5 self-start font-mono text-[11px] tracking-[0.1em] uppercase md:text-right">
        <div>
          <dt className="text-faint" title="Separate closed bodies in the STL — roughly the parts of the assembly">Bodies</dt>
          <dd className="mt-1 text-fg">{ready ? state.data.bodies.toLocaleString("en-US") : "—"}</dd>
        </div>
        <div>
          <dt className="text-faint">Triangles</dt>
          <dd className="mt-1 text-fg">{ready ? state.data.triangles.toLocaleString("en-US") : "—"}</dd>
        </div>
        <div>
          <dt className="text-faint">STL</dt>
          <dd className="mt-1 text-fg">{model.sizeMb.toFixed(1)} MB</dd>
        </div>
        <div>
          <dt className="text-faint" title="Bounding box in the STL's native units (millimetres for a default SolidWorks export)">Envelope</dt>
          <dd className="mt-1 whitespace-nowrap text-fg">{ready ? state.data.dimensions.map(fmt).join(" × ") : "—"}</dd>
        </div>
      </dl>
    </figcaption>
  );

  if (variant === "studio" && multi) {
    return (
      <figure className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="order-2 flex min-w-0 flex-col gap-5 lg:order-1">
          {viewer}
          {info}
        </div>
        <ModelPicker models={models} activeId={model.id} loadingId={state.status === "loading" ? model.id : null} onSelect={selectModel} layout="rail" />
      </figure>
    );
  }

  return (
    <figure className="flex flex-col gap-5">
      {viewer}
      {multi && (
        <ModelPicker models={models} activeId={model.id} loadingId={state.status === "loading" ? model.id : null} onSelect={selectModel} layout="strip" />
      )}
      {info}
    </figure>
  );
}

/** Visual model gallery: thumbnail cards that load a model into the viewer without leaving the page. */
function ModelPicker({
  models,
  activeId,
  loadingId,
  onSelect,
  layout,
}: {
  models: ModelEntry[];
  activeId: string;
  loadingId: string | null;
  onSelect: (id: string) => void;
  layout: "rail" | "strip";
}) {
  return (
    <div className={layout === "rail" ? "order-1 min-w-0 lg:order-2" : "min-w-0"}>
      <div className="eyebrow mb-3 flex items-center justify-between">
        <span>Model gallery</span>
        <span className="text-faint">{String(models.length).padStart(2, "0")} models</span>
      </div>
      <ul
        aria-label="Choose a model to load"
        className={
          layout === "rail"
            ? "-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:max-h-[calc(74vh+7rem)] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:px-0 lg:pr-1 lg:pb-0"
            : "-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
        }
      >
        {models.map((m, i) => {
          const active = m.id === activeId;
          return (
            <li key={m.id} className={`shrink-0 snap-start ${layout === "rail" ? "w-[220px] lg:w-auto" : "w-[200px]"}`}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                aria-pressed={active}
                aria-label={`Load ${m.title} (${m.sizeMb.toFixed(1)} MB)`}
                className={`group/card flex w-full items-center gap-3 border p-2 text-left transition-colors duration-300 ${
                  active ? "border-silver/70 bg-tint/[0.06]" : "border-line bg-tint/[0.015] hover:border-line-strong hover:bg-tint/[0.04]"
                }`}
              >
                <span className="relative block h-16 w-20 shrink-0 overflow-hidden bg-[radial-gradient(circle_at_50%_40%,var(--well-from),var(--well-to))]">
                  <Image
                    src={m.preview}
                    alt=""
                    fill
                    sizes="80px"
                    className={`object-contain p-1 transition-transform duration-500 ${active ? "scale-110" : "group-hover/card:scale-110"}`}
                  />
                  {loadingId === m.id && (
                    <span className="absolute inset-0 grid place-items-center bg-ink/60">
                      <span className="h-4 w-4 animate-spin border border-line-strong border-t-fg" />
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] tracking-[0.14em] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`block truncate text-[13px] leading-snug font-medium ${active ? "text-fg" : "text-fg/80"}`}>
                    {m.title.split(" — ")[0]}
                  </span>
                  <span className="block truncate font-mono text-[10px] tracking-[0.08em] text-faint uppercase">{m.category}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div role="toolbar" className="flex items-center border border-line bg-ink/70 p-0.5 backdrop-blur-md">
      {children}
    </div>
  );
}

function ToolButton({
  label,
  children,
  onClick,
  pressed,
  disabled = false,
  className = "",
  align = "center",
}: {
  align?: "start" | "center" | "end";
  label: string;
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={`group/btn relative inline-flex h-9 min-w-9 items-center justify-center px-2 text-muted transition-colors hover:bg-tint/8 hover:text-fg focus-visible:outline-offset-0 ${
        pressed ? "bg-tint/10 text-fg" : ""
      } ${disabled ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted" : ""} ${className}`}
    >
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full mb-2 translate-y-1 border ${
          align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"
        } border-line bg-ink px-2 py-1 font-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-fg opacity-0 transition-all duration-200 group-hover/btn:translate-y-0 group-hover/btn:opacity-100 group-focus-visible/btn:translate-y-0 group-focus-visible/btn:opacity-100`}
      >
        {label}
      </span>
    </button>
  );
}

function LoadingOverlay({
  state,
  sizeMb,
}: {
  state: { stage: "download" | "process"; progress: number | null };
  sizeMb: number;
}) {
  const pct = state.progress == null ? null : Math.round(state.progress * 100);
  return (
    <div role="status" aria-live="polite" className="absolute inset-0 grid place-items-center">
      <div className="w-56 text-center">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin border border-line-strong border-t-fg [animation-duration:1.4s]" />
        <div className="font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
          {state.stage === "process" ? "Processing geometry" : `Loading model${pct != null ? ` · ${pct}%` : ""}`}
        </div>
        <div className="mt-3 h-px w-full overflow-hidden bg-line">
          <div
            className="h-full bg-fg transition-[width] duration-200"
            style={{ width: state.stage === "process" ? "100%" : `${pct ?? 15}%` }}
          />
        </div>
        <div className="mt-2 font-mono text-[10px] text-faint">{sizeMb.toFixed(1)} MB STL</div>
      </div>
    </div>
  );
}

function ErrorOverlay({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="absolute inset-0 grid place-items-center p-6">
      <div className="max-w-sm text-center">
        <AlertTriangle className="mx-auto mb-4 text-muted" size={22} strokeWidth={1.5} />
        <p className="text-sm text-fg">This model couldn’t be loaded.</p>
        <p className="mt-1 font-mono text-[11px] text-faint">{message}</p>
        <button onClick={onRetry} className="btn-ghost mt-5">
          Try again
        </button>
      </div>
    </div>
  );
}

function NoWebGL({ model }: { model: ModelEntry }) {
  return (
    <div className="absolute inset-0">
      <Image src={model.preview} alt={`Static render of ${model.title}`} fill className="object-contain p-8" sizes="100vw" />
      <p className="absolute inset-x-0 bottom-4 text-center font-mono text-[11px] tracking-[0.1em] text-muted">
        Static preview — your browser doesn’t support WebGL, so the interactive viewer is unavailable.
      </p>
    </div>
  );
}

function Corners() {
  const c = "pointer-events-none absolute h-3 w-3 border-silver/40";
  return (
    <div aria-hidden>
      <span className={`${c} top-0 left-0 border-t border-l`} />
      <span className={`${c} top-0 right-0 border-t border-r`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} right-0 bottom-0 border-r border-b`} />
    </div>
  );
}

function ShortcutSheet({ onClose }: { onClose: () => void }) {
  const rows = [
    ["← → ↑ ↓", "Orbit"],
    ["+ / −", "Zoom"],
    ["1 2 3 4", "Front · Side · Top · Iso"],
    ["S W E", "Solid · Wireframe · Inspect"],
    ["X", "Explode / assemble"],
    ["[ ]", "Less / more explode"],
    ["Space", "Toggle auto-rotate"],
    ["R", "Reset view"],
    ["F", "Fullscreen"],
  ];
  return (
    <div className="absolute top-14 right-4 w-64 border border-line bg-ink/90 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="eyebrow">Shortcuts</span>
        <button onClick={onClose} className="font-mono text-[10px] text-faint hover:text-fg" aria-label="Close shortcuts">
          ESC
        </button>
      </div>
      <dl className="space-y-1.5 font-mono text-[11px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-fg">{k}</dt>
            <dd className="text-faint">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
