/**
 * 3D models shown in the 3D Studio gallery, the hero and on project pages.
 *
 * To add or replace a model:
 *   1. Drop the binary or ASCII .stl file into /public/models/ (a compressed .stl.gz copy is
 *      generated automatically at build time — see scripts/compress-models.mjs).
 *   2. Add (or edit) an entry below. `file` is the public URL path.
 *   3. Add a thumbnail at /public/images/renders/<id>.png (used in the gallery and as the
 *      no-WebGL fallback) and set `project` to link it to a project page.
 *
 * Geometry is centred and scaled automatically, so exported units/origins don't matter.
 * Models are assumed to be Y-up (SolidWorks default). Use `rotation` (radians, XYZ)
 * if a file arrives in a different orientation.
 */
export type ViewName = "front" | "side" | "top" | "iso";

export type ModelEntry = {
  id: string;
  title: string;
  /** Short label for the gallery card. */
  category: string;
  file: string;
  /** Raw STL size in MB (the download is about a third of this, compressed). */
  sizeMb: number;
  /** What the model shows. `null` renders an editable placeholder in development. */
  description: string | null;
  /** Slug of the related project in projects.ts, if any. */
  project?: string;
  /** Static render: gallery thumbnail and WebGL fallback. */
  preview: string;
  rotation?: [number, number, number];
  /** Initial camera direction. Defaults to an isometric view. */
  initialView?: ViewName;
};

export const models: ModelEntry[] = [
  {
    id: "phototherapy",
    title: "High-Intensity Phototherapy Device",
    category: "Medical device · Tray & lamp",
    file: "/models/phototherapy.stl",
    sizeMb: 1.2,
    description:
      "Tray-style base with a curved support arm carrying an overhead lamp housing, exported as a single assembly.",
    project: "phototherapy-unit",
    preview: "/images/renders/phototherapy.png",
  },
  {
    id: "phototherapy-2",
    title: "Phototherapy Device — Mobile Stand",
    category: "Medical device · Full assembly",
    file: "/models/phototherapy-2.stl",
    sizeMb: 3.2,
    description:
      "Full-height configuration: tray, overhead lamp and an under-frame on castors, modelled as one assembly.",
    project: "phototherapy-unit",
    preview: "/images/renders/phototherapy-2.png",
  },
  {
    id: "harp",
    title: "HARP — Hand Actuation for Rehabilitation and Performance",
    category: "Wearable · Rehabilitation",
    file: "/models/harp.stl",
    sizeMb: 1.7,
    description:
      "Wrist cuff with individual linkage rods and caps routed to each finger, built as a multi-part assembly.",
    project: "harp-hand-linkage",
    preview: "/images/renders/harp.png",
  },
  {
    id: "part-two-assembly",
    title: "Bearing Housing Assembly",
    category: "Mechanical · Assembly",
    file: "/models/part-two-assembly.stl",
    sizeMb: 6.9,
    description:
      "Ribbed pillow-block housing, bearings, flanged cover and seal ring, assembled on a common bore with a top bolt.",
    project: "bearing-housing",
    preview: "/images/renders/part-two-assembly.png",
  },
  {
    id: "bicycle",
    title: "Bicycle",
    category: "Product · Full assembly",
    file: "/models/bicycle.stl",
    sizeMb: 18.7,
    description:
      "Complete bicycle assembly — frame, spoked wheels with treaded tyres, chain drive, pedals, saddle and handlebars.",
    project: "bicycle",
    preview: "/images/renders/bicycle.png",
    initialView: "side",
  },
  {
    id: "syringe",
    title: "Syringe",
    category: "Medical device · Assembly",
    file: "/models/syringe.stl",
    sizeMb: 0.9,
    description: "Graduated syringe barrel with plunger, hub and needle, modelled as a multi-part assembly.",
    project: "syringe",
    preview: "/images/renders/syringe.png",
  },
  {
    id: "part-one-assembly",
    title: "Part One Assembly",
    category: "Mechanism · Linkage",
    file: "/models/part-one-assembly.stl",
    sizeMb: 5.5,
    description: "Multi-link hinged arm assembly with pinned joints between each segment.",
    project: "part-one-assembly",
    preview: "/images/renders/part-one-assembly.png",
    initialView: "front",
  },
  {
    id: "push-button",
    title: "Panel-Mount Push Button",
    category: "Component",
    file: "/models/push-button.stl",
    sizeMb: 2.2,
    description:
      "Threaded panel-mount push button with locking ring and solder terminals — a small part with dense detail.",
    project: "component-models",
    preview: "/images/renders/push-button.png",
  },
  {
    id: "sod",
    title: "SOD",
    category: "Part",
    file: "/models/sod.stl",
    sizeMb: 11.6,
    description: null,
    project: "sod",
    preview: "/images/renders/sod.png",
    // Exported standing upright (≈968 mm tall, ≈39 mm wide); displayed lying down so it fills the frame.
    rotation: [0, 0, Math.PI / 2],
  },
];

/** The model rendered in the hero. Keep this one light so the first screen stays fast. */
export const heroModelId = "phototherapy";

export const getModel = (id: string) => models.find((m) => m.id === id);
export const modelsForProject = (slug: string) => models.filter((m) => m.project === slug);
