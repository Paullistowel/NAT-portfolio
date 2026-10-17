"use client";

import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { BufferAttribute, BufferGeometry, Euler, Group, Material, MathUtils, Mesh, PerspectiveCamera, Vector3, type WebGLProgramParametersWithUniforms } from "three";
import type CameraControlsImpl from "camera-controls";
import { useTheme } from "@/lib/theme";
import { loadEdges, loadExplode } from "./stl-client";
import type { ProcessedStl } from "./stl-processing";
import type { ViewName } from "@/content/models";

export type DisplayMode = "solid" | "wireframe" | "inspect";

export type CameraApi = {
  setView: (view: ViewName, smooth?: boolean) => void;
  reset: () => void;
  zoom: (direction: 1 | -1) => void;
  orbit: (azimuth: number, polar: number) => void;
  /** Pull the camera back (or in) so an exploded model stays in frame. 0 = assembled. */
  frameExplode: (amount: number) => void;
};

/** Shared, mutable explode value: animated in useFrame, read by the shader and the floor shadow. */
export type ExplodeUniform = { value: number };

/**
 * Patches a built-in material so every vertex moves by `aExplode * uExplode`. aExplode holds each
 * body's offset; uExplode animates 0 → 1. One draw call, no geometry rebuilds while animating.
 */
function useExplodePatch(uniform: ExplodeUniform) {
  return useMemo(
    () => ({
      onBeforeCompile: (shader: WebGLProgramParametersWithUniforms) => {
        shader.uniforms.uExplode = uniform;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nattribute vec3 aExplode;\nuniform float uExplode;")
          .replace("#include <begin_vertex>", "vec3 transformed = vec3( position ) + aExplode * uExplode;");
      },
      customProgramCacheKey: () => "explode",
    }),
    [uniform],
  );
}

const VIEW_DIRECTIONS: Record<ViewName, [number, number, number]> = {
  front: [0, 0, 1],
  side: [1, 0, 0],
  top: [0, 1, 0.0001],
  iso: [1, 0.8, 1],
};

/** Studio lighting built from local light-formers: no HDR download, consistent soft reflections. */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 5, 4]} intensity={1.6} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#0d0e10"]} />
        <Lightformer form="rect" intensity={3} position={[0, 4, 0]} rotation-x={Math.PI / 2} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[8, 2.5, 1]} />
        <Lightformer form="ring" intensity={0.8} position={[0, 1, 6]} scale={3} />
      </Environment>
    </>
  );
}

export function useStlGeometry(data: ProcessedStl) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(data.positions, 3));
    g.setAttribute("normal", new BufferAttribute(data.normals, 3));
    g.computeBoundingSphere();
    return g;
  }, [data]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

export function StlMesh({
  data,
  mode = "solid",
  rotation,
  explode = 0,
  uniform,
  onEdgesLoading,
}: {
  data: ProcessedStl;
  mode?: DisplayMode;
  rotation?: [number, number, number];
  /** Target explode amount, 0 (assembled) → 1 (fully exploded). Animated smoothly. */
  explode?: number;
  /** Optional shared uniform, so siblings (e.g. the floor shadow) can follow the animation. */
  uniform?: ExplodeUniform;
  onEdgesLoading?: (loading: boolean) => void;
}) {
  const geometry = useStlGeometry(data);
  const theme = useTheme();
  const [edges, setEdges] = useState<BufferGeometry | null>(null);
  const ownUniform = useMemo<ExplodeUniform>(() => ({ value: 0 }), []);
  const u = uniform ?? ownUniform;
  const patch = useExplodePatch(u);
  const [offsetsReady, setOffsetsReady] = useState(false);

  // Explode offsets are computed in the worker the first time the model is exploded.
  const wantOffsets = explode > 0 && data.bodies > 1;
  useEffect(() => {
    if (!wantOffsets || offsetsReady) return;
    let active = true;
    loadExplode(data.positions).then((offsets) => {
      if (!active) return;
      geometry.setAttribute("aExplode", new BufferAttribute(offsets, 3));
      setOffsetsReady(true);
    });
    return () => {
      active = false;
    };
  }, [wantOffsets, offsetsReady, data, geometry]);

  // Three.js uniforms are mutable by design: they're updated every frame outside React's render cycle.
  useFrame((_, dt) => {
    const target = offsetsReady ? explode : 0;
    const next = MathUtils.damp(u.value, target, 5, dt);
    // eslint-disable-next-line react-hooks/immutability
    u.value = Math.abs(next - target) < 1e-4 ? target : next;
  });

  useEffect(() => {
    if (mode !== "inspect") return;
    let active = true;
    onEdgesLoading?.(true);
    loadEdges(data.positions).then(({ edges: positions, offsets }) => {
      if (!active) return;
      const g = new BufferGeometry();
      g.setAttribute("position", new BufferAttribute(positions, 3));
      g.setAttribute("aExplode", new BufferAttribute(offsets, 3));
      setEdges(g);
      onEdgesLoading?.(false);
    });
    return () => {
      active = false;
      onEdgesLoading?.(false);
    };
  }, [mode, data, onEdgesLoading]);

  useEffect(() => () => edges?.dispose(), [edges]);

  // Materials recompile when the shader inputs change; key them so the patch applies cleanly.
  const matKey = `${mode}-${theme}-${offsetsReady}`;
  return (
    <group rotation={rotation}>
      <mesh geometry={geometry} frustumCulled={false}>
        {mode === "wireframe" ? (
          <meshBasicMaterial
            key={matKey}
            {...(offsetsReady ? patch : {})}
            color={theme === "light" ? "#2f343a" : "#cfd3d9"}
            wireframe
            transparent
            opacity={theme === "light" ? 0.6 : 0.55}
          />
        ) : (
          <meshStandardMaterial
            key={matKey}
            {...(offsetsReady ? patch : {})}
            color={mode === "inspect" ? "#3b3f45" : "#b9bec5"}
            metalness={mode === "inspect" ? 0 : 0.45}
            roughness={mode === "inspect" ? 0.85 : 0.34}
            envMapIntensity={1.1}
            polygonOffset
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        )}
      </mesh>
      {mode === "inspect" && edges && (
        <lineSegments geometry={edges} frustumCulled={false}>
          <lineBasicMaterial key={matKey} {...patch} color="#f4f6f8" />
        </lineSegments>
      )}
    </group>
  );
}

/** Lowest point of the (centred, symmetric) bounding box after the model's display rotation. */
export function floorY(data: ProcessedStl, rotation?: [number, number, number]) {
  const [x, y, z] = data.halfExtents;
  if (!rotation) return -y;
  const e = new Euler(...rotation);
  let min = Infinity;
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    min = Math.min(min, new Vector3(sx * x, sy * y, sz * z).applyEuler(e).y);
  }
  return min;
}

/**
 * Soft contact shadow under the model. Re-rendered once per model to keep the frame cost low;
 * it fades out while the model is exploded (the baked shadow only matches the assembled pose).
 */
export function Floor({ y, explode }: { y: number; explode?: ExplodeUniform }) {
  const ref = useRef<Group>(null);
  const materials = useRef<Material[]>([]);
  useFrame(() => {
    if (!explode || !ref.current) return;
    if (!materials.current.length) {
      ref.current.traverse((o) => {
        if ((o as Mesh).isMesh) materials.current.push((o as Mesh).material as Material);
      });
    }
    const opacity = 0.55 * Math.max(0, 1 - explode.value * 2.5);
    for (const m of materials.current) m.opacity = opacity;
    ref.current.visible = opacity > 0.01;
  });
  return (
    <ContactShadows
      ref={ref}
      position={[0, y - 0.004, 0]}
      opacity={0.55}
      scale={5}
      blur={2.6}
      far={2.2}
      resolution={512}
      frames={1}
      color="#000000"
    />
  );
}

function fitDistance(camera: PerspectiveCamera, radius = 1.08) {
  const vFov = MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  return radius / Math.sin(Math.min(vFov, hFov) / 2);
}

/**
 * Orbit/zoom/pan rig with idle auto-rotation and preset views.
 * Auto-rotation pauses while the visitor interacts and resumes after a short idle period.
 */
export function CameraRig({
  apiRef,
  autoRotate,
  initialView = "iso",
  speed = 0.35,
  resetKey,
}: {
  apiRef?: Ref<CameraApi>;
  autoRotate: boolean;
  initialView?: ViewName;
  speed?: number;
  /** Changing this re-frames the camera with a smooth move (e.g. when a new model is loaded). */
  resetKey?: string;
}) {
  const controls = useRef<CameraControlsImpl>(null);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const interacting = useRef(false);
  const lastInteraction = useRef(0);

  const setView = (view: ViewName, smooth = true) => {
    const c = controls.current;
    if (!c) return;
    const [x, y, z] = VIEW_DIRECTIONS[view];
    const len = Math.hypot(x, y, z);
    const d = fitDistance(camera);
    c.setLookAt((x / len) * d, (y / len) * d, (z / len) * d, 0, 0, 0, smooth);
    lastInteraction.current = performance.now();
  };

  useImperativeHandle(apiRef, () => ({
    setView,
    reset: () => setView(initialView),
    zoom: (dir) => {
      controls.current?.dolly(dir * 0.6, true);
      lastInteraction.current = performance.now();
    },
    orbit: (az, polar) => {
      controls.current?.rotate(az, polar, true);
      lastInteraction.current = performance.now();
    },
    frameExplode: (amount) => {
      controls.current?.dollyTo(fitDistance(camera) * (1 + 0.8 * amount), true);
      lastInteraction.current = performance.now();
    },
  }));

  // Frame the model on mount and whenever the canvas aspect changes substantially.
  useEffect(() => {
    setView(initialView, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width > size.height]);

  // Glide to the new model's starting view when the model changes.
  const firstKey = useRef(resetKey);
  useEffect(() => {
    if (resetKey === firstKey.current) return;
    setView(initialView, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c || !autoRotate || interacting.current) return;
    if (performance.now() - lastInteraction.current < 2500) return;
    c.rotate(delta * speed, 0, false);
  });

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={1.35}
      maxDistance={14}
      smoothTime={0.35}
      draggingSmoothTime={0.08}
      onStart={() => {
        interacting.current = true;
      }}
      onEnd={() => {
        interacting.current = false;
        lastInteraction.current = performance.now();
      }}
    />
  );
}
