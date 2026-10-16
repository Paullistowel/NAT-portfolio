/**
 * 3D models shown in the 3D Studio and on project pages.
 *
 * To add or replace a model:
 *   1. Drop the binary or ASCII .stl file into /public/models/
 *   2. Add (or edit) an entry below. `file` is the public URL path.
 *   3. Optionally link it to a project by setting `project` to that project's slug.
 *
 * Geometry is centred and scaled automatically, so exported units/origins don't matter.
 * Models are assumed to be Y-up (SolidWorks default). Use `rotation` (radians, XYZ)
 * if a file arrives in a different orientation.
 */
export type ModelEntry = {
  id: string;
  title: string;
  file: string;
  /** Approximate file size in MB, shown before loading so visitors know what to expect. */
  sizeMb: number;
  /** Short caption shown with the viewer. `null` renders an editable placeholder. */
  caption: string | null;
  /** Slug of the related project in projects.ts, if any. */
  project?: string;
  /** Static render used when WebGL is unavailable and as a poster. */
  preview: string;
  rotation?: [number, number, number];
  /** Initial camera direction. Defaults to an isometric view. */
  initialView?: ViewName;
};

export type ViewName = "front" | "side" | "top" | "iso";

export const models: ModelEntry[] = [
  {
    id: "phototherapy",
    title: "Phototherapy Unit — Tray & Lamp",
    file: "/models/phototherapy.stl",
    sizeMb: 1.2,
    caption:
      "Tray-style base with a curved support arm carrying an overhead lamp housing, exported as a single assembly.",
    project: "phototherapy-unit",
    preview: "/images/renders/phototherapy.png",
  },
  {
    id: "phototherapy-2",
    title: "Phototherapy Unit — Mobile Stand",
    file: "/models/phototherapy-2.stl",
    sizeMb: 3.2,
    caption:
      "Full-height configuration: tray, overhead lamp and an under-frame on castors, modelled as one assembly.",
    project: "phototherapy-unit",
    preview: "/images/renders/phototherapy-2.png",
  },
  {
    id: "harp",
    title: "HARP — Hand Linkage Assembly",
    file: "/models/harp.stl",
    sizeMb: 1.7,
    caption:
      "Wrist cuff with individual linkage rods and caps routed to each finger, built as a multi-part assembly.",
    project: "harp-hand-linkage",
    preview: "/images/renders/harp.png",
  },
  {
    id: "part-one-assembly",
    title: "Part One Assembly",
    file: "/models/part-one-assembly.stl",
    sizeMb: 5.5,
    caption:
      "Multi-link hinged arm assembly with pinned joints between each segment.",
    project: "part-one-assembly",
    preview: "/images/renders/part-one-assembly.png",
    initialView: "front",
  },
  {
    id: "push-button",
    title: "Panel-Mount Push Button",
    file: "/models/push-button.stl",
    sizeMb: 2.2,
    caption:
      "Threaded panel-mount push button with locking ring and solder terminals — a small part with dense detail.",
    project: "component-models",
    preview: "/images/renders/push-button.png",
  },
  {
    id: "sod",
    title: "SOD",
    file: "/models/sod.stl",
    sizeMb: 11.6,
    caption: null,
    project: "sod",
    preview: "/images/renders/sod.png",
    // Exported standing upright (≈968 mm tall, ≈39 mm wide); displayed lying down so it fills the frame.
    rotation: [0, 0, Math.PI / 2],
  },
];

/** The model rendered in the hero. Keep this one light so the first screen stays fast. */
export const heroModelId = "phototherapy";

export const getModel = (id: string) => models.find((m) => m.id === id);
export const modelsForProject = (slug: string) =>
  models.filter((m) => m.project === slug);
