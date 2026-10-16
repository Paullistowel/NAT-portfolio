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
  const normals = creasedNormals(positions, CREASE_ANGLE);
  geometry.dispose();

  return {
    positions,
    normals,
    triangles: positions.length / 9,
    dimensions,
    halfExtents: [
      (dimensions[0] * scale) / 2,
      (dimensions[1] * scale) / 2,
      (dimensions[2] * scale) / 2,
    ],
  };
}

/** Feature edges (angle > threshold) for the technical-inspection overlay. */
export function computeEdges(positions: Float32Array, thresholdDeg = 30): Float32Array {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  const edges = new EdgesGeometry(geometry, thresholdDeg);
  const out = edges.getAttribute("position").array as Float32Array;
  geometry.dispose();
  return out;
}

/**
 * Linear-time crease normals. Corners sharing a position are greedily clustered by face normal;
 * each cluster gets the area-weighted average of its faces. three.js's toCreasedNormals compares
 * every pair of faces at a vertex, which is quadratic for dense triangle fans (seconds on some CAD exports).
 */
function creasedNormals(pos: Float32Array, creaseAngle: number): Float32Array {
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

  // Group corners by quantised position.
  const groups = new Map<string, number[]>();
  const q = 1e5;
  for (let c = 0; c < triCount * 3; c++) {
    const key = `${Math.round(pos[c * 3] * q)},${Math.round(pos[c * 3 + 1] * q)},${Math.round(pos[c * 3 + 2] * q)}`;
    const g = groups.get(key);
    if (g) g.push(c);
    else groups.set(key, [c]);
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
