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
  Keyboard,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import type { ModelEntry, ViewName } from "@/content/models";
import { CameraRig, Floor, floorY, StlMesh, StudioLights, type CameraApi, type DisplayMode } from "./Scene";
import { hasWebGL, useStl } from "./useStl";

type Props = {
  models: ModelEntry[];
  initialId?: string;
  /** Taller, framed studio layout vs. compact embed on project pages. */
  variant?: "studio" | "embed";
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

export default function ModelViewer({ models, initialId, variant = "studio", onModelChange }: Props) {
  const [activeId, setActiveId] = useState(initialId ?? models[0]?.id);
  const model = models.find((m) => m.id === activeId) ?? models[0];
  const reduceMotion = useReducedMotion();

  const [mode, setMode] = useState<DisplayMode>("solid");
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
    setActiveId(id);
    setMode("solid");
    onModelChange?.(id);
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
      r: () => camera.current?.reset(),
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

  return (
    <figure className="flex flex-col gap-4">
      {models.length > 1 && (
        <div role="tablist" aria-label="Choose a model" className="flex flex-wrap gap-x-1 gap-y-1 border-b border-line">
          {models.map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={m.id === model.id}
              onClick={() => selectModel(m.id)}
              className={`relative px-3 py-2.5 text-left font-mono text-[11px] tracking-[0.12em] uppercase transition-colors ${
                m.id === model.id ? "text-fg" : "text-faint hover:text-muted"
              }`}
            >
              {m.title.split(" — ")[0]}
              {m.title.includes(" — ") && <span className="text-faint"> / {m.title.split(" — ")[1]}</span>}
              <span
                className={`absolute inset-x-0 -bottom-px h-px bg-fg transition-transform duration-300 ${
                  m.id === model.id ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      <div
        ref={container}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`Interactive 3D model: ${model.title}. Drag to rotate, scroll or pinch to zoom, right-drag or two-finger drag to pan. Press K for keyboard shortcuts.`}
        role="application"
        className={`group/viewer relative isolate overflow-hidden border border-line bg-[radial-gradient(ellipse_at_50%_35%,#1d1f23_0%,#0d0e10_70%)] outline-none focus-visible:border-silver ${
          fullscreen ? "h-screen w-screen" : variant === "studio" ? "h-[68vh] min-h-[420px] lg:h-[78vh]" : "h-[56vh] min-h-[360px]"
        }`}
      >
        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />

        {webgl === false ? (
          <NoWebGL model={model} />
        ) : (
          webgl && (
            <Canvas
              key={model.id}
              frameloop={visible ? "always" : "never"}
              dpr={[1, 2]}
              camera={{ fov: 32, near: 0.01, far: 100, position: [3, 2.4, 3] }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
              className={`transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
            >
              <StudioLights />
              {state.status === "ready" && (
                <>
                  <StlMesh data={state.data} mode={mode} rotation={model.rotation} onEdgesLoading={setEdgesLoading} />
                  <Floor y={floorY(state.data, model.rotation)} />
                </>
              )}
              <CameraRig apiRef={camera} autoRotate={autoRotate} initialView={model.initialView} />
            </Canvas>
          )
        )}

        {state.status === "loading" && webgl !== false && <LoadingOverlay state={state} sizeMb={model.sizeMb} />}
        {state.status === "error" && <ErrorOverlay message={state.message} onRetry={() => setRetry((r) => r + 1)} />}

        {/* Corner registration marks */}
        <Corners />

        {/* Control panel */}
        {ready && (
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
                  <ToolButton
                    key={m.id}
                    align="start"
                    label={`${m.label} (${m.key})`}
                    pressed={mode === m.id}
                    onClick={() => setMode(m.id)}
                  >
                    {m.icon}
                  </ToolButton>
                ))}
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
              <ToolButton align="end" label="Reset view (R)" onClick={() => camera.current?.reset()}>
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

        {ready && (
          <div className="pointer-events-none absolute top-3 left-3 font-mono text-[10px] leading-5 tracking-[0.14em] text-faint uppercase sm:top-4 sm:left-4">
            <div className="text-muted">{model.title}</div>
            <div>
              {state.data.triangles.toLocaleString("en-US")} tris · {mode}
              {edgesLoading && " · computing edges…"}
            </div>
          </div>
        )}

        {ready && (
          <div className="pointer-events-none absolute top-3 right-3 hidden text-right font-mono text-[10px] leading-5 tracking-[0.14em] text-faint uppercase sm:top-4 sm:right-4 sm:block">
            <div>Drag · rotate</div>
            <div>Scroll · zoom</div>
            <div>Right-drag · pan</div>
          </div>
        )}

        {showKeys && ready && <ShortcutSheet onClose={() => setShowKeys(false)} />}
      </div>

      <figcaption className="grid gap-4 border-b border-line pb-6 sm:grid-cols-[1fr_auto] sm:gap-10">
        <div>
          <p className="text-[15px] leading-relaxed text-muted">
            {model.caption ?? <span className="text-faint italic">Description to be added.</span>}
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-6 font-mono text-[11px] tracking-[0.1em] uppercase sm:text-right">
          <div>
            <dt className="text-faint">Triangles</dt>
            <dd className="mt-1 text-fg">{ready ? state.data.triangles.toLocaleString("en-US") : "—"}</dd>
          </div>
          <div>
            <dt className="text-faint">File</dt>
            <dd className="mt-1 text-fg">{model.sizeMb.toFixed(1)} MB</dd>
          </div>
          <div>
            <dt className="text-faint" title="Bounding box in the STL's native units (millimetres for a default SolidWorks export)">
              Envelope
            </dt>
            <dd className="mt-1 whitespace-nowrap text-fg">
              {ready ? state.data.dimensions.map(fmt).join(" × ") : "—"}
            </dd>
          </div>
        </dl>
      </figcaption>
    </figure>
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
  className = "",
  align = "center",
}: {
  align?: "start" | "center" | "end";
  label: string;
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`group/btn relative inline-flex h-9 min-w-9 items-center justify-center px-2 text-muted transition-colors hover:bg-white/8 hover:text-fg focus-visible:outline-offset-0 ${
        pressed ? "bg-white/10 text-fg" : ""
      } ${className}`}
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
