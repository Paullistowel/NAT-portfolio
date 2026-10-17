"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { ModelEntry } from "@/content/models";
import { Floor, floorY, StlMesh, StudioLights } from "./Scene";
import type { ProcessedStl } from "./stl-processing";
import { hasWebGL, useStl } from "./useStl";

/** Pulls the camera back on tall/narrow stages so the whole model stays in frame. */
function FitCamera() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    camera.position.setLength(4.1 * Math.max(1, 1.35 / aspect));
  }, [camera, aspect]);
  return null;
}

export type HeroModelInfo = { triangles: number; dimensions: [number, number, number] };

/**
 * Hero presentation of a live STL: slow auto-rotation, drag to orbit on pointer devices
 * (touch devices keep native scrolling), and the previous model stays visible while the
 * next one loads when the visitor switches models.
 */
export default function HeroModel({ model, onReady }: { model: ModelEntry; onReady?: (info: HeroModelInfo) => void }) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const [finePointer, setFinePointer] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const state = useStl(webgl ? model.file : null);
  const [shown, setShown] = useState<{ model: ModelEntry; data: ProcessedStl } | null>(null);

  useEffect(() => {
    setWebgl(hasWebGL()); // eslint-disable-line react-hooks/set-state-in-effect
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (state.status !== "ready") return;
    setShown({ model, data: state.data }); // eslint-disable-line react-hooks/set-state-in-effect
    onReady?.({ triangles: state.data.triangles, dimensions: state.data.dimensions });
  }, [state, model, onReady]);

  const loading = state.status === "loading";

  return (
    <div ref={wrap} className="absolute inset-0">
      {webgl && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{ fov: 30, position: [2.6, 1.4, 2.9], near: 0.05, far: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ pointerEvents: finePointer ? "auto" : "none", touchAction: "pan-y" }}
          className={`transition-[opacity,filter] duration-[1200ms] ease-out ${
            shown ? (loading ? "opacity-40 blur-[2px]" : "opacity-100") : "opacity-0"
          } ${finePointer ? "cursor-grab active:cursor-grabbing" : ""}`}
          aria-label={finePointer ? `Live 3D model: ${model.title}. Drag to rotate.` : undefined}
        >
          <StudioLights />
          {shown && (
            <group key={shown.model.id} rotation={[0, -0.6, 0]}>
              <StlMesh data={shown.data} rotation={shown.model.rotation} />
              <Floor y={floorY(shown.data, shown.model.rotation)} />
            </group>
          )}
          <FitCamera />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enabled={finePointer}
            autoRotate={!reduceMotion}
            autoRotateSpeed={0.7}
            enableDamping
            dampingFactor={0.06}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.55}
          />
        </Canvas>
      )}
      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
            Loading model{state.progress != null && ` · ${Math.round(state.progress * 100)}%`}
          </div>
        </div>
      )}
      {webgl === false && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={model.preview} alt={`Render of ${model.title}`} className="absolute inset-0 h-full w-full object-contain p-10" />
      )}
    </div>
  );
}
