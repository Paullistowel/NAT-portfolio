/**
 * Site-wide content. Edit this file to update your profile, links, skills and resume details.
 *
 * Any value set to `null` (or an empty array) renders as a clearly-marked placeholder in
 * development and is hidden in production unless NEXT_PUBLIC_SHOW_PLACEHOLDERS=true.
 * Nothing here should be invented — only add details that are true.
 */
export const site = {
  name: "NAT",
  fullName: null as string | null, // e.g. "Nathaniel …" — shown in the footer and metadata if set
  title: "NAT's Portfolio",
  roles: ["3D Modeling", "CAD Design", "Engineering Visualization"],
  headline: "Engineering Ideas Into Detailed 3D Reality.",
  intro:
    "I design and visualize detailed 3D models, transforming technical concepts into precise, compelling digital representations.",
  /** Production URL for social-sharing metadata. Uses NEXT_PUBLIC_SITE_URL, else Vercel's production domain. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  location: null as string | null,

  contact: {
    email: null as string | null, // e.g. "nat@example.com"
    linkedin: null as string | null, // full URL
    github: null as string | null, // full URL
    /** Any other verified profiles, e.g. { label: "GrabCAD", href: "https://…" } */
    other: [] as { label: string; href: string }[],
  },

  about: {
    introduction: null as string | null,
    education: null as string | null,
    interests: [
      "3D modeling",
      "CAD design",
      "Engineering visualization",
      "Product development",
    ],
    experience: null as string | null,
    objective: null as string | null,
  },

  /**
   * Skills. Only list what you can back up. `level` is optional (0–1) — leave it out to show
   * a skill without a proficiency indicator.
   * The entries below are evidenced by the supplied project files and screenshots.
   */
  skills: [
    {
      category: "CAD & 3D Modeling",
      items: [
        { name: "SolidWorks — part modeling" },
        { name: "SolidWorks — assembly modeling & mates" },
        { name: "Swept, flex & cut-extrude features" },
      ],
    },
    {
      category: "Engineering Design",
      items: [
        { name: "Enclosure design around PCBs" },
        { name: "Wearable & linkage mechanisms" },
        { name: "Material assignment" },
      ],
    },
    {
      category: "Visualization & Rendering",
      items: [{ name: "Photorealistic product renders" }, { name: "Translucent & section-style inspection renders" }],
    },
    {
      category: "Technical Drawing",
      items: [{ name: "Dimensioned drawing sheets" }, { name: "Orthographic & isometric views" }],
    },
  ] as { category: string; items: { name: string; level?: number }[] }[],

  /** Software list — add names you use (e.g. "Fusion 360", "AutoCAD", "KeyShot"). */
  software: ["SolidWorks"],

  process: [
    { title: "Understand the requirements", body: "Clarify the brief, constraints, dimensions and how the part will be used." },
    { title: "Develop the concept", body: "Explore layouts and forms before committing to geometry." },
    { title: "Create the 3D model", body: "Build parts and assemblies with clean, editable features and mates." },
    { title: "Refine & inspect the geometry", body: "Check fit, clearances and internal features with section and hidden-line views." },
    { title: "Validate or simulate", body: "Where appropriate, verify the design with analysis or physical checks." },
    { title: "Present the final design", body: "Produce renders, drawings and interactive models that communicate the result." },
  ],

  resume: {
    /** Drop your CV at /public/documents/resume.pdf — the download button activates automatically. */
    file: "/documents/resume.pdf",
    summary: null as string | null,
    qualifications: [] as string[],
  },

  /**
   * Video showcase. Drop your file at /public/videos/showcase.mp4 (H.264 MP4 recommended)
   * and an optional poster frame at /public/videos/showcase-poster.jpg.
   * The section appears automatically once the video file exists.
   */
  video: {
    src: "/videos/showcase.mp4",
    poster: "/videos/showcase-poster.jpg",
    title: "Modeling in Motion",
    description: null as string | null,
  },
};

export const navItems = [
  { id: "home", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "studio", label: "3D Studio" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "resume", label: "Resume" },
  { id: "contact", label: "Contact" },
] as const;
