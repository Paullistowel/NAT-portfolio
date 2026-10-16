/// <reference lib="webworker" />
import { computeEdges, processStl } from "./stl-processing";

type Request =
  | { id: number; type: "load"; url: string }
  | { id: number; type: "edges"; positions: Float32Array };

const post = (msg: unknown, transfer: Transferable[] = []) =>
  (self as unknown as DedicatedWorkerGlobalScope).postMessage(msg, transfer);

self.onmessage = async (event: MessageEvent<Request>) => {
  const req = event.data;
  try {
    if (req.type === "edges") {
      const edges = computeEdges(req.positions);
      post({ id: req.id, type: "edges", edges }, [edges.buffer]);
      return;
    }

    const res = await fetch(req.url);
    if (!res.ok) throw new Error(`Could not load model (HTTP ${res.status})`);
    const total = Number(res.headers.get("content-length")) || 0;

    let buffer: ArrayBuffer;
    if (res.body && total) {
      const reader = res.body.getReader();
      const bytes = new Uint8Array(total);
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        // Guard against content-length mismatches (e.g. transparent compression).
        if (received + value.length > bytes.length) throw new RangeError("length");
        bytes.set(value, received);
        received += value.length;
        post({ id: req.id, type: "progress", loaded: received, total });
      }
      buffer = bytes.buffer.slice(0, received);
    } else {
      buffer = await res.arrayBuffer();
    }

    post({ id: req.id, type: "processing" });
    const result = processStl(buffer);
    post({ id: req.id, type: "done", result }, [result.positions.buffer, result.normals.buffer]);
  } catch (err) {
    post({ id: req.id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};
