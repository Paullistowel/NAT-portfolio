"use client";

import type { ProcessedStl } from "./stl-processing";

export type LoadEvents = {
  onProgress?: (fraction: number | null) => void;
  onProcessing?: () => void;
};

let worker: Worker | null = null;
let workerFailed = false;
let nextId = 1;
const pending = new Map<number, { resolve: (v: never) => void; reject: (e: Error) => void; events?: LoadEvents }>();
const cache = new Map<string, Promise<ProcessedStl>>();

function getWorker(): Worker | null {
  if (workerFailed || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./stl.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      const entry = pending.get(msg.id);
      if (!entry) return;
      if (msg.type === "progress") entry.events?.onProgress?.(msg.total ? msg.loaded / msg.total : null);
      else if (msg.type === "processing") entry.events?.onProcessing?.();
      else {
        pending.delete(msg.id);
        if (msg.type === "error") entry.reject(new Error(msg.message));
        else entry.resolve((msg.type === "done" ? msg.result : msg.edges) as never);
      }
    };
    worker.onerror = () => {
      workerFailed = true;
      pending.forEach((p) => p.reject(new Error("worker-failed")));
      pending.clear();
      worker = null;
    };
    return worker;
  } catch {
    workerFailed = true;
    return null;
  }
}

function callWorker<T>(w: Worker, msg: object, events?: LoadEvents, transfer: Transferable[] = []) {
  return new Promise<T>((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve: resolve as (v: never) => void, reject, events });
    w.postMessage({ ...msg, id }, transfer);
  });
}

/** Main-thread fallback for browsers where module workers are unavailable. */
async function loadOnMainThread(url: string, events?: LoadEvents): Promise<ProcessedStl> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load model (HTTP ${res.status})`);
  events?.onProgress?.(null);
  const buffer = await res.arrayBuffer();
  events?.onProcessing?.();
  await new Promise((r) => setTimeout(r, 30)); // let the UI paint the "processing" state
  const { processStl } = await import("./stl-processing");
  return processStl(buffer);
}

/**
 * Load and process an STL. Results are cached per URL, so switching between models is instant
 * after the first load. Progress callbacks fire only for the first request of a given URL.
 */
export function loadStl(url: string, events?: LoadEvents): Promise<ProcessedStl> {
  const cached = cache.get(url);
  if (cached) return cached;
  const w = getWorker();
  const promise = (w ? callWorker<ProcessedStl>(w, { type: "load", url }, events) : loadOnMainThread(url, events))
    .catch((err: Error) => {
      if (err.message === "worker-failed") return loadOnMainThread(url, events);
      throw err;
    })
    .catch((err) => {
      cache.delete(url); // allow retry
      throw err;
    });
  cache.set(url, promise);
  return promise;
}

const edgeCache = new WeakMap<Float32Array, Promise<Float32Array>>();

export function loadEdges(positions: Float32Array): Promise<Float32Array> {
  const cached = edgeCache.get(positions);
  if (cached) return cached;
  const w = getWorker();
  const promise = w
    ? callWorker<Float32Array>(w, { type: "edges", positions: positions.slice() })
    : import("./stl-processing").then((m) => m.computeEdges(positions));
  edgeCache.set(positions, promise);
  return promise;
}
