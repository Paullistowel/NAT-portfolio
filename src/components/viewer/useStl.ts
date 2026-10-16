"use client";

import { useEffect, useState } from "react";
import { loadStl } from "./stl-client";
import type { ProcessedStl } from "./stl-processing";

export type StlState =
  | { status: "loading"; stage: "download" | "process"; progress: number | null }
  | { status: "ready"; data: ProcessedStl }
  | { status: "error"; message: string };

export function useStl(url: string | null, retryKey = 0): StlState {
  const [state, setState] = useState<StlState>({ status: "loading", stage: "download", progress: 0 });

  useEffect(() => {
    if (!url) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when the URL changes
    setState({ status: "loading", stage: "download", progress: 0 });
    loadStl(url, {
      onProgress: (p) => active && setState({ status: "loading", stage: "download", progress: p }),
      onProcessing: () => active && setState({ status: "loading", stage: "process", progress: null }),
    })
      .then((data) => active && setState({ status: "ready", data }))
      .catch((err: Error) => active && setState({ status: "error", message: err.message }));
    return () => {
      active = false;
    };
  }, [url, retryKey]);

  return state;
}

export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
