"use client";

import { CameraControls, ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { BufferAttribute, BufferGeometry, Euler, MathUtils, PerspectiveCamera, Vector3 } from "three";
import type CameraControlsImpl from "camera-controls";
import { loadEdges } from "./stl-client";
import type { ProcessedStl } from "./stl-processing";
import type { ViewName } from "@/content/models";

export type DisplayMode = "solid" | "wireframe" | "inspect";

export type CameraApi = {
  setView: (view: ViewName, smooth?: boolean) => void;
  reset: () => void;
  zoom: (direction: 1 | -1) => void;
  orbit: (azimuth: number, polar: number) => void;
};

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
  onEdgesLoading,
}: {
  data: ProcessedStl;
  mode?: DisplayMode;
  rotation?: [number, number, number];
  onEdgesLoading?: (loading: boolean) => void;
}) {
  const geometry = useStlGeometry(data);
  const [edges, setEdges] = useState<BufferGeometry | null>(null);

  useEffect(() => {
    if (mode !== "inspect") return;
    let active = true;
    onEdgesLoading?.(true);
    loadEdges(data.positions).then((positions) => {
      if (!active) return;
      const g = new BufferGeometry();
      g.setAttribute("position", new BufferAttribute(positions, 3));
      setEdges(g);
      onEdgesLoading?.(false);
    });
    return () => {
      active = false;
      onEdgesLoading?.(false);
    };
  }, [mode, data, onEdgesLoading]);

  useEffect(() => () => edges?.dispose(), [edges]);

  return (
    <group rotation={rotation}>
      <mesh geometry={geometry}>
        {mode === "wireframe" ? (
          <meshBasicMaterial color="#cfd3d9" wireframe transparent opacity={0.55} />
        ) : (
          <meshStandardMaterial
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
        <lineSegments geometry={edges}>
          <lineBasicMaterial color="#f4f6f8" />
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

/** Soft contact shadow under the model. Re-rendered once per model to keep the frame cost low. */
export function Floor({ y }: { y: number }) {
  return (
    <ContactShadows
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
}: {
  apiRef?: Ref<CameraApi>;
  autoRotate: boolean;
  initialView?: ViewName;
  speed?: number;
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
  }));

  // Frame the model on mount and whenever the canvas aspect changes substantially.
  useEffect(() => {
    setView(initialView, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialView, size.width > size.height]);

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
