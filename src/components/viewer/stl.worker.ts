/// <reference lib="webworker" />
import { computeEdges, explodeOffsets, processStl } from "./stl-processing";

type Request =
  | { id: number; type: "load"; url: string }
  | { id: number; type: "edges"; positions: Float32Array }
  | { id: number; type: "explode"; positions: Float32Array };

const post = (msg: unknown, transfer: Transferable[] = []) =>
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg, transfer);

/** Reads a response body to an ArrayBuffer, reporting progress against the transferred bytes. */
async function download(res: Response, gzipped: boolean, onProgress: (loaded: number, total: number) => void) {
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body) return res.arrayBuffer();
  let loaded = 0;
  let stream: ReadableStream<Uint8Array> = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        loaded += chunk.length;
        onProgress(loaded, total);
        controller.enqueue(chunk);
      },
    }),
  );
  if (gzipped) stream = stream.pipeThrough(new DecompressionStream("gzip") as unknown as TransformStream<Uint8Array, Uint8Array>);
  return new Response(stream).arrayBuffer();
}

async function fetchStl(url: string, id: number): Promise<ArrayBuffer> {
  const progress = (loaded: number, total: number) => post({ id, type: "progress", loaded, total });
  // Prefer the pre-compressed copy (≈⅓ the size), generated at build time by scripts/compress-models.mjs.
  if (typeof DecompressionStream !== "undefined") {
    try {
      const res = await fetch(`${url}.gz`);
      if (res.ok) return await download(res, true, progress);
    } catch {
      // fall through to the raw file
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load model (HTTP ${res.status})`);
  return download(res, false, progress);
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const req = event.data;
  try {
    if (req.type === "edges") {
      const result = computeEdges(req.positions);
      post({ id: req.id, type: "edges", result }, [result.edges.buffer, result.offsets.buffer]);
      return;
    }
    if (req.type === "explode") {
      const result = explodeOffsets(req.positions);
      post({ id: req.id, type: "explode", result }, [result.buffer]);
      return;
    }
    const buffer = await fetchStl(req.url, req.id);
    post({ id: req.id, type: "processing" });
    const result = processStl(buffer);
    post({ id: req.id, type: "done", result }, [result.positions.buffer, result.normals.buffer]);
  } catch (err) {
    post({ id: req.id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
