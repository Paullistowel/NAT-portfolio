import { BufferAttribute, BufferGeometry, EdgesGeometry } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

/** Plain, transferable result of processing an STL. Positions are centred and scaled to fit a unit sphere. */
export type ProcessedStl = {
  positions: Float32Array;
  normals: Float32Array;
  triangles: number;
  /** Bounding box of the file in its original units (STL is unitless; SolidWorks exports mm by default). */
  dimensions: [number, number, number];
  /** Normalised half-extents after scaling, used to place the floor and frame the camera. */
  halfExtents: [number, number, number];
  /** Number of separate closed bodies (≈ parts of an assembly). 1 means it can't be exploded. */
  bodies: number;
};

const CREASE_ANGLE = (32 * Math.PI) / 180;

export function processStl(buffer: ArrayBuffer): ProcessedStl {
  const loader = new STLLoader();
  const geometry: BufferGeometry = loader.parse(buffer);

  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const dimensions: [number, number, number] = [
    box.max.x - box.min.x,
    box.max.y - box.min.y,
    box.max.z - box.min.z,
  ];

  // Centre on the origin and scale so the bounding sphere has radius 1, whatever the export units.
  geometry.center();
  geometry.computeBoundingSphere();
  const scale = 1 / (geometry.boundingSphere!.radius || 1);
  geometry.scale(scale, scale, scale);

  // STL normals are per-face (faceted). Creased normals smooth curved surfaces while keeping
  // machined edges crisp, which reads far closer to the CAD original.
  const positions = geometry.getAttribute("position").array as Float32Array;
  const groups = groupCorners(positions);
  const normals = creasedNormals(positions, groups, CREASE_ANGLE);
  const { count: bodies } = labelBodies(positions.length / 9, groups);
  geometry.dispose();

  return {
    positions,
    normals,
    triangles: positions.length / 9,
    bodies,
    dimensions,
    halfExtents: [
      (dimensions[0] * scale) / 2,
      (dimensions[1] * scale) / 2,
      (dimensions[2] * scale) / 2,
    ],
  };
}

/**
 * Feature edges (angle > threshold) for the technical-inspection overlay, plus each edge vertex's
 * explode offset so the overlay separates together with the mesh.
 */
export function computeEdges(positions: Float32Array, thresholdDeg = 30): { edges: Float32Array; offsets: Float32Array } {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  const edgesGeometry = new EdgesGeometry(geometry, thresholdDeg);
  const edges = edgesGeometry.getAttribute("position").array as Float32Array;
  geometry.dispose();

  const groups = groupCorners(positions);
  const { label } = labelBodies(positions.length / 9, groups);
  const centres = bodyOffsets(positions, label);
  const offsets = new Float32Array(edges.length);
  for (let v = 0; v < edges.length / 3; v++) {
    const corners = groups.get(cornerKey(edges, v));
    if (!corners) continue;
    const b = label[(corners[0] / 3) | 0];
    offsets[v * 3] = centres[b * 3];
    offsets[v * 3 + 1] = centres[b * 3 + 1];
    offsets[v * 3 + 2] = centres[b * 3 + 2];
  }
  return { edges, offsets };
}

/** Per-vertex explode offsets for the mesh: every vertex moves with its body's offset. */
export function explodeOffsets(positions: Float32Array): Float32Array {
  const triCount = positions.length / 9;
  const { label } = labelBodies(triCount, groupCorners(positions));
  const centres = bodyOffsets(positions, label);
  const out = new Float32Array(positions.length);
  for (let t = 0; t < triCount; t++) {
    const b = label[t] * 3;
    for (let k = 0; k < 3; k++) {
      const o = t * 9 + k * 3;
      out[o] = centres[b];
      out[o + 1] = centres[b + 1];
      out[o + 2] = centres[b + 2];
    }
  }
  return out;
}

const Q = 1e5;
const cornerKey = (pos: Float32Array, c: number) =>
  `${Math.round(pos[c * 3] * Q)},${Math.round(pos[c * 3 + 1] * Q)},${Math.round(pos[c * 3 + 2] * Q)}`;

/** Groups triangle corners that share a (quantised) position. */
function groupCorners(pos: Float32Array): Map<string, number[]> {
  const groups = new Map<string, number[]>();
  for (let c = 0; c < pos.length / 3; c++) {
    const key = cornerKey(pos, c);
    const g = groups.get(key);
    if (g) g.push(c);
    else groups.set(key, [c]);
  }
  return groups;
}

/**
 * Connected components: triangles that share a vertex belong to the same body. CAD assemblies
 * export each part as its own closed shell, so bodies correspond to parts.
 */
function labelBodies(triCount: number, groups: Map<string, number[]>): { label: Int32Array; count: number } {
  const parent = new Int32Array(triCount);
  for (let i = 0; i < triCount; i++) parent[i] = i;
  const find = (x: number) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };
  for (const corners of groups.values()) {
    const a = find((corners[0] / 3) | 0);
    for (let i = 1; i < corners.length; i++) {
      const b = find((corners[i] / 3) | 0);
      if (a !== b) parent[b] = a;
    }
  }
  const label = new Int32Array(triCount);
  const ids = new Map<number, number>();
  for (let t = 0; t < triCount; t++) {
    const r = find(t);
    let id = ids.get(r);
    if (id === undefined) ids.set(r, (id = ids.size));
    label[t] = id;
  }
  return { label, count: ids.size };
}

/**
 * Explode direction per body: from the assembly centre (the origin, after centring) towards the
 * body's area-weighted centroid, with eased magnitudes (see below).
 */
function bodyOffsets(pos: Float32Array, label: Int32Array): Float32Array {
  let count = 0;
  for (let t = 0; t < label.length; t++) count = Math.max(count, label[t] + 1);
  const sum = new Float64Array(count * 3);
  const area = new Float64Array(count);
  for (let t = 0; t < label.length; t++) {
    const o = t * 9;
    const ax = pos[o + 3] - pos[o], ay = pos[o + 4] - pos[o + 1], az = pos[o + 5] - pos[o + 2];
    const bx = pos[o + 6] - pos[o], by = pos[o + 7] - pos[o + 1], bz = pos[o + 8] - pos[o + 2];
    const a = Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx) / 2 + 1e-12;
    const b = label[t];
    sum[b * 3] += ((pos[o] + pos[o + 3] + pos[o + 6]) / 3) * a;
    sum[b * 3 + 1] += ((pos[o + 1] + pos[o + 4] + pos[o + 7]) / 3) * a;
    sum[b * 3 + 2] += ((pos[o + 2] + pos[o + 5] + pos[o + 8]) / 3) * a;
    area[b] += a;
  }
  const out = new Float32Array(count * 3);
  if (count < 2) return out; // a single body has nothing to separate from
  let max = 0;
  for (let b = 0; b < count; b++) {
    for (let k = 0; k < 3; k++) out[b * 3 + k] = sum[b * 3 + k] / area[b];
    max = Math.max(max, Math.hypot(out[b * 3], out[b * 3 + 1], out[b * 3 + 2]));
  }
  if (max < 1e-6) return out.fill(0);
  // Distance-proportional offsets leave parts near the centre almost touching, so ease the
  // falloff (square root): inner parts open up clearly while the outermost part travels 1 unit.
  for (let b = 0; b < count; b++) {
    const len = Math.hypot(out[b * 3], out[b * 3 + 1], out[b * 3 + 2]);
    const k = len > 1e-9 ? Math.sqrt(len / max) / len : 0;
    for (let i = 0; i < 3; i++) out[b * 3 + i] *= k;
  }
  return out;
}

/**
 * Linear-time crease normals. Corners sharing a position are greedily clustered by face normal;
 * each cluster gets the area-weighted average of its faces. three.js's toCreasedNormals compares
 * every pair of faces at a vertex, which is quadratic for dense triangle fans (seconds on some CAD exports).
 */
function creasedNormals(pos: Float32Array, groups: Map<string, number[]>, creaseAngle: number): Float32Array {
  const triCount = pos.length / 9;
  const unit = new Float32Array(triCount * 3); // unit face normals
  const weighted = new Float32Array(triCount * 3); // area-weighted face normals
  for (let t = 0; t < triCount; t++) {
    const o = t * 9;
    const ax = pos[o + 3] - pos[o], ay = pos[o + 4] - pos[o + 1], az = pos[o + 5] - pos[o + 2];
    const bx = pos[o + 6] - pos[o], by = pos[o + 7] - pos[o + 1], bz = pos[o + 8] - pos[o + 2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const len = Math.hypot(nx, ny, nz) || 1;
    weighted[t * 3] = nx;
    weighted[t * 3 + 1] = ny;
    weighted[t * 3 + 2] = nz;
    unit[t * 3] = nx / len;
    unit[t * 3 + 1] = ny / len;
    unit[t * 3 + 2] = nz / len;
  }

  const out = new Float32Array(pos.length);
  const cos = Math.cos(creaseAngle);
  const clusterOf = new Int32Array(triCount * 3).fill(-1);
  for (const corners of groups.values()) {
    const seeds: number[] = []; // face index of each cluster seed
    const sums: number[] = [];
    for (const c of corners) {
      const f = (c / 3) | 0;
      let k = 0;
      for (; k < seeds.length; k++) {
        const s = seeds[k] * 3;
        if (unit[s] * unit[f * 3] + unit[s + 1] * unit[f * 3 + 1] + unit[s + 2] * unit[f * 3 + 2] > cos) break;
      }
      if (k === seeds.length) {
        seeds.push(f);
        sums.push(0, 0, 0);
      }
      sums[k * 3] += weighted[f * 3];
      sums[k * 3 + 1] += weighted[f * 3 + 1];
      sums[k * 3 + 2] += weighted[f * 3 + 2];
      clusterOf[c] = k;
    }
    for (const c of corners) {
      const k = clusterOf[c] * 3;
      const len = Math.hypot(sums[k], sums[k + 1], sums[k + 2]) || 1;
      out[c * 3] = sums[k] / len;
      out[c * 3 + 1] = sums[k + 1] / len;
      out[c * 3 + 2] = sums[k + 2] / len;
    }
  }
  return out;
}
