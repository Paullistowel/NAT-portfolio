/**
 * Selected Works.
 *
 * To add a project:
 *   1. Create /public/images/projects/<slug>/ and drop images in it.
 *   2. Copy one of the entries below, give it a unique `slug`, and fill the fields.
 *   3. (Optional) add an STL to models.ts with `project: "<slug>"` — the project page
 *      will then show an interactive 3D preview automatically. Videos in site.ts with
 *      `project: "<slug>"` appear on the page too.
 *
 * Any field set to `null` renders as a clearly-marked editable placeholder in development
 * (and is hidden in production unless NEXT_PUBLIC_SHOW_PLACEHOLDERS=true).
 *
 * Descriptions come from what is visible in the supplied renders, screenshots and STL files;
 * titles and contributions come from Nat's CV where it names the project.
 */
export type ProjectImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Optional short name for tight layouts. */
  shortTitle?: string;
  category: string;
  /** One or two factual sentences describing the design. */
  summary: string;
  objective: string | null;
  contribution: string | null;
  tools: string[] | null;
  /** Technical observations / process notes. Keep these factual. */
  process: string[];
  outcome: string | null;
  /** Featured projects appear in the large horizontal gallery; others in the "More work" index. */
  featured?: boolean;
  cover: ProjectImage | null;
  images: ProjectImage[];
};

const img = (slug: string, file: string, width: number, height: number, alt: string, caption?: string): ProjectImage => ({
  src: `/images/projects/${slug}/${file}`,
  width,
  height,
  alt,
  caption,
});

const DIPPER =
  "Developed at DIPPER Lab (KNUST), where I lead 3D modelling, product design and simulation activities across the lab's biomedical engineering projects.";

const phototherapy = [
  img("phototherapy-unit", "render-photoview.jpg", 1862, 1953, "Photorealistic render of the phototherapy device: green tray, translucent liner and overhead lamp on a tubular frame", "Final render"),
  img("phototherapy-unit", "render-tray-lamp.jpg", 990, 775, "Rendered phototherapy tray with overhead lamp housing on a tubular support", "Tray and lamp sub-assembly"),
  img("phototherapy-unit", "assembly-stand.jpg", 1600, 1000, "SolidWorks assembly of the phototherapy device on its mobile stand with castors", "Full assembly on the mobile stand"),
  img("phototherapy-unit", "wireframe-tray-lamp.jpg", 1242, 799, "Hidden-lines-visible view of the tray and lamp showing internal features", "Hidden-line inspection view"),
  img("phototherapy-unit", "drawing-sheet.jpg", 1280, 751, "SolidWorks drawing sheet with dimensioned orthographic and isometric views of the tray assembly", "Dimensioned drawing sheet"),
];

const ezytherm = [
  img("handheld-device", "render-exterior.jpg", 1210, 775, "Rendered Ezytherm handheld device with grey body, purple grip and a grille at the tip", "Exterior render"),
  img("handheld-device", "render-internal-pcb.jpg", 1280, 744, "Translucent Ezytherm housing revealing a PCB, connector and components inside", "Translucent housing with internal PCB"),
  img("handheld-device", "render-side.jpg", 1280, 631, "Side render of the Ezytherm device showing the button recess", "Side profile"),
  img("handheld-device", "render-transparent.jpg", 1015, 771, "Translucent Ezytherm device showing an integrated circuit inside the body", "Component packaging inside the body"),
  img("handheld-device", "render-cutaway-tip.jpg", 840, 765, "Close-up render of the Ezytherm tip with the internal board visible", "Tip and internal board"),
  img("handheld-device", "render-transparent-end.jpg", 959, 855, "Translucent end view of the Ezytherm device with the vent grille", "Vented end cap"),
];

const bearing = [
  img("bearing-housing", "exploded-assembly.jpg", 2000, 1570, "Exploded render of the bearing housing assembly: bearing, ribbed housing, sleeve, bearing, flanged cover and seal ring on one axis", "Exploded assembly"),
  img("bearing-housing", "assembled.jpg", 1747, 1712, "Render of the assembled bearing housing with top bolt and visible bearing", "Assembled"),
  img("bearing-housing", "housing.jpg", 1423, 1863, "Render of the ribbed pillow-block housing with bolt-hole flange and mounting feet", "Ribbed housing"),
  img("bearing-housing", "flange-cover.jpg", 1547, 1771, "Render of the blue flanged cover with radial ribs and bolt circle", "Flanged cover"),
  img("bearing-housing", "seal-ring.jpg", 1227, 1443, "Render of the bearing and seal ring with a bolt circle", "Bearing & seal ring"),
];

const enclosure = [
  img("electronics-enclosure", "render-open-pcb.jpg", 1600, 1000, "Open black enclosure with a populated PCB, connectors and a buzzer", "PCB seated in the enclosure base"),
  img("electronics-enclosure", "render-closed.jpg", 1133, 851, "Closed black enclosure with connector cut-outs on the side wall", "Closed, with connector cut-outs"),
  img("electronics-enclosure", "render-transparent.jpg", 1258, 806, "Translucent enclosure showing PCB clearance and port alignment", "Translucent clearance check"),
];

export const projects: Project[] = [
  {
    slug: "phototherapy-unit",
    title: "High-Intensity Phototherapy Device",
    shortTitle: "Phototherapy Device",
    category: "Medical Device · Product Design",
    summary:
      "A tray-style phototherapy device with an overhead lamp housing on a curved tubular support, developed in two configurations: a compact tray-and-lamp assembly and a full-height mobile stand on castors.",
    objective: null,
    contribution: DIPPER,
    tools: ["SolidWorks"],
    process: [
      "Modelled as a multi-part SolidWorks assembly with separate base, tray, liner and support components.",
      "Prepared a dimensioned drawing sheet with orthographic and isometric views.",
      "Checked internal features using hidden-line views before rendering.",
      "Developed a second, full-height configuration with a frame and castors.",
    ],
    outcome: null,
    cover: phototherapy[0],
    images: phototherapy,
  },
  {
    slug: "harp-hand-linkage",
    title: "HARP — Hand Actuation for Rehabilitation and Performance",
    shortTitle: "HARP",
    category: "Wearable · Rehabilitation",
    summary:
      "A hand-mounted rehabilitation assembly: a wrist cuff with individual linkage rods routed along each finger and terminating in fingertip caps.",
    objective: null,
    contribution: null,
    tools: ["SolidWorks"],
    process: [
      "Built as an assembly of separate wrist and per-finger parts (index, middle and ring finger linkages).",
      "Linkage paths modelled with swept features to follow the finger layout.",
    ],
    outcome: null,
    cover: img("harp-hand-linkage", "render.jpg", 1917, 1239, "Render of HARP: textured wrist cuff with four linkage rods ending in fingertip caps"),
    images: [
      img("harp-hand-linkage", "render.jpg", 1917, 1239, "Render of HARP: textured wrist cuff with four linkage rods ending in fingertip caps", "Final render"),
      img("harp-hand-linkage", "assembly-solidworks.jpg", 1213, 852, "SolidWorks assembly of HARP with a wrist cuff and finger rods", "Assembly in SolidWorks"),
    ],
  },
  {
    slug: "bearing-housing",
    title: "Bearing Housing Assembly",
    category: "Mechanical Design · Assembly",
    summary:
      "A ribbed pillow-block bearing housing with bearings, sleeve, flanged cover and seal ring arranged on a common axis, shown exploded and assembled.",
    objective: null,
    contribution: null,
    tools: null,
    process: [
      "Housing and cover designed with radial stiffening ribs and matching bolt circles.",
      "Components aligned on a common bore and presented in an exploded view to show assembly order.",
      "Individual part renders of the housing, flanged cover and seal ring.",
    ],
    outcome: null,
    cover: bearing[0],
    images: bearing,
  },
  {
    slug: "handheld-device",
    title: "Ezytherm",
    category: "Medical Device · Enclosure",
    summary:
      "A slim handheld device with a two-tone body, ergonomic grip and vented tip, designed around an internal circuit board and its components.",
    objective: null,
    contribution: DIPPER,
    tools: null,
    process: [
      "Housing shaped around an internal PCB, with the board and components packaged inside the body.",
      "Translucent renders used to check component placement and clearances.",
      "Separate grip and end-cap parts in a contrasting finish.",
    ],
    outcome: null,
    cover: ezytherm[0],
    images: ezytherm,
  },
  {
    slug: "bicycle",
    title: "Bicycle",
    category: "Product Design · Full Assembly",
    summary:
      "A complete bicycle assembly — frame, spoked wheels with treaded tyres, chain drive, crank and pedals, saddle and handlebars with grips.",
    objective: null,
    contribution: null,
    tools: null,
    process: [
      "Large multi-part assembly (373,638 triangles in the exported STL) covering frame, drivetrain and controls.",
      "Detailed tyre tread, spokes and chain links modelled rather than textured.",
    ],
    outcome: null,
    cover: img("bicycle", "render.jpg", 2000, 1863, "Render of the pink bicycle with black treaded tyres, chrome handlebars and chain drive"),
    images: [img("bicycle", "render.jpg", 2000, 1863, "Render of the pink bicycle with black treaded tyres, chrome handlebars and chain drive", "Final render")],
  },
  {
    slug: "electronics-enclosure",
    title: "Electronics Enclosure",
    category: "Enclosure Design",
    summary: "A compact enclosure for a populated circuit board, with cut-outs aligned to the board's connectors.",
    objective: null,
    contribution: null,
    tools: null,
    process: [
      "Enclosure base sized around the PCB, with connector cut-outs aligned to the board's ports.",
      "Translucent render used to verify board clearance and port alignment.",
    ],
    outcome: null,
    cover: enclosure[0],
    images: enclosure,
  },
  {
    slug: "syringe",
    title: "Syringe",
    category: "Medical Device · Assembly",
    summary: "A graduated syringe with translucent barrel, plunger, hub and needle, rendered with a separate needle cap.",
    objective: null,
    contribution: null,
    tools: ["SolidWorks"],
    process: ["Barrel graduations, plunger and needle hub modelled as separate parts of one assembly."],
    outcome: null,
    cover: img("syringe", "render.jpg", 2000, 1342, "Render of a graduated syringe with translucent barrel, yellow plunger and green needle hub"),
    images: [img("syringe", "render.jpg", 2000, 1342, "Render of a graduated syringe with translucent barrel, yellow plunger and green needle hub", "Final render")],
  },
  {
    slug: "shoulder-support",
    title: "Shoulder Support Assembly",
    category: "Wearable Design · Assembly",
    summary: "A wearable support structure with a contoured, cut-out back plate, shoulder pads and hooked attachment arms.",
    objective: null,
    contribution: null,
    tools: ["SolidWorks"],
    process: [
      "Contoured plate with weight-saving cut-outs, modelled using flex and cut-extrude features.",
      "Materials applied in SolidWorks include polyurethane foam (shoulder pad) and 1060 aluminium alloy.",
    ],
    outcome: null,
    cover: img("shoulder-support", "final-assembly.jpg", 1280, 800, "SolidWorks assembly of the shoulder support with contoured plate and hooked arms"),
    images: [
      img("shoulder-support", "final-assembly.jpg", 1280, 800, "SolidWorks assembly of the shoulder support with contoured plate and hooked arms", "Final assembly"),
      img("shoulder-support", "shoulder-pad-assembly.jpg", 1280, 800, "Line view of the shoulder pad assembly in SolidWorks", "Shoulder pad assembly — line view"),
    ],
  },
  {
    slug: "phone-lens-mount",
    title: "Phone Lens Attachment",
    category: "Product Design · Assembly",
    summary:
      "A clamp-style phone attachment that holds a lens over the camera, assembled from a metal plate, phone clamp, lens holder and adjustment bolt.",
    objective: null,
    contribution: null,
    tools: ["SolidWorks"],
    process: [
      "Four-part assembly: metal plate, phone attachment, lens attachment and bolt.",
      "Constrained with coincident, concentric, parallel and cam-tangent mates.",
    ],
    outcome: null,
    cover: img("phone-lens-mount", "isometric.png", 1898, 1160, "Isometric view of the phone lens attachment assembly"),
    images: [
      img("phone-lens-mount", "isometric.png", 1898, 1160, "Isometric view of the phone lens attachment assembly", "Isometric"),
      img("phone-lens-mount", "front.png", 1915, 1144, "Front view of the phone lens attachment showing the adjustment knob", "Front — adjustment knob"),
      img("phone-lens-mount", "side.png", 1919, 1113, "Side view of the phone lens attachment clamp", "Side"),
      img("phone-lens-mount", "rear.png", 1912, 1141, "Rear view of the phone lens attachment showing the lens opening", "Rear — lens opening"),
    ],
  },
  {
    slug: "part-one-assembly",
    featured: false,
    title: "Part One Assembly",
    category: "Mechanism · Assembly",
    summary: "A multi-link hinged arm assembly with pinned joints between each segment, presented as an interactive 3D model.",
    objective: null,
    contribution: null,
    tools: null,
    process: [],
    outcome: null,
    cover: null,
    images: [],
  },
  {
    slug: "sod",
    featured: false,
    title: "SOD",
    category: "3D Model",
    summary:
      "A long, slender rod-like part — roughly 968 mm long and 39 mm across — with a ball end, a sleeve joint and a thicker end section with cross-holes, presented as an interactive 3D model.",
    objective: null,
    contribution: null,
    tools: null,
    process: [],
    outcome: null,
    cover: null,
    images: [],
  },
  {
    slug: "component-models",
    featured: false,
    title: "Push Button & Buzzer",
    category: "Component Modelling",
    summary:
      "Detailed component models — a threaded panel-mount push button and a cylindrical buzzer — for use in larger electronic assemblies.",
    objective: null,
    contribution: null,
    tools: ["SolidWorks"],
    process: [],
    outcome: null,
    cover: img("component-models", "push-button.jpg", 1600, 1000, "Rendered panel-mount push button with an illuminated ring"),
    images: [
      img("component-models", "push-button.jpg", 1600, 1000, "Rendered panel-mount push button with an illuminated ring", "Panel-mount push button"),
      img("component-models", "buzzer.jpg", 1600, 1000, "Rendered cylindrical buzzer component", "Buzzer"),
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
