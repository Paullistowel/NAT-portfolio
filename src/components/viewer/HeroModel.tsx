"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { useReducedMotion } from "motion/react";
import type { ModelEntry } from "@/content/models";
import { Floor, StlMesh, StudioLights } from "./Scene";
import { hasWebGL, useStl } from "./useStl";

function Turntable({ children, enabled }: { children: React.ReactNode; enabled: boolean }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (enabled && ref.current) ref.current.rotation.y += dt * 0.18;
  });
  return (
    <group ref={ref} rotation={[0, -0.7, 0]}>
      {children}
    </group>
  );
}

/** Non-interactive, slowly rotating presentation of the hero model. Fades in once processed. */
export default function HeroModel({ model }: { model: ModelEntry }) {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const state = useStl(webgl ? model.file : null);

  useEffect(() => {
    setWebgl(hasWebGL()); // eslint-disable-line react-hooks/set-state-in-effect
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const ready = state.status === "ready";

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      {webgl && (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 1.75]}
          camera={{ fov: 30, position: [0, 0.55, 4.1], near: 0.05, far: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ pointerEvents: "none" }}
          className={`transition-opacity duration-[1600ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}
          onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        >
          <StudioLights />
          {state.status === "ready" && (
            <>
              <Turntable enabled={!reduceMotion}>
                <StlMesh data={state.data} />
              </Turntable>
              <Floor y={-state.data.halfExtents[1]} />
            </>
          )}
        </Canvas>
      )}
      {!ready && state.status !== "error" && webgl !== false && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
            Loading model
            {state.status === "loading" && state.progress != null && ` · ${Math.round(state.progress * 100)}%`}
          </div>
        </div>
      )}
    </div>
  );
}
