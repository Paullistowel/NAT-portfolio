"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { ModelEntry } from "@/content/models";
import type { HeroModelInfo } from "./HeroModel";

const ModelViewer = dynamic(() => import("./ModelViewer"), { ssr: false, loading: () => <ViewerSkeleton /> });
const HeroModelInner = dynamic(() => import("./HeroModel"), { ssr: false });

function ViewerSkeleton() {
  return <div className="h-[62vh] min-h-[400px] border border-line bg-tint/[0.02] lg:h-[74vh]" />;
}

/** Mounts the 3D viewer (and downloads Three.js + the STL) only when it approaches the viewport. */
export function LazyViewer(props: { models: ModelEntry[]; initialId?: string; variant?: "studio" | "embed"; linkProjects?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{mounted ? <ModelViewer {...props} /> : <ViewerSkeleton />}</div>;
}

/** Hero model, deferred until the browser is idle so the headline paints first. */
export function HeroModel({ model, onReady }: { model: ModelEntry; onReady?: (info: HeroModelInfo) => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = ric(() => setReady(true), { timeout: 1200 } as IdleRequestOptions);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);
  return ready ? <HeroModelInner model={model} onReady={onReady} /> : null;
}
