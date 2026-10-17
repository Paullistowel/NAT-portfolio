/**
 * Site-wide content. Edit this file to update your profile, links, skills and resume details.
 *
 * Any value set to `null` (or an empty array) renders as a clearly-marked placeholder in
 * development and is hidden in production unless NEXT_PUBLIC_SHOW_PLACEHOLDERS=true.
 * Everything below comes from Nat's CV (public/documents/resume.pdf) — only add details that are true.
 */
export type Experience = { role: string; org: string; period: string | null; points: string[] };
export type Video = {
  /** Path under /public. Videos whose file doesn't exist are skipped automatically. */
  src: string;
  poster?: string;
  title: string;
  description?: string;
  /** Show this video on a project page too. */
  project?: string;
};

export const site = {
  name: "NAT",
  fullName: "Nyaaba Adalebse Turibius",
  title: "NAT's Portfolio",
  professionalTitle: "Product Design Engineer",
  specialisms: ["Product Design", "Digital Engineering", "CAD", "CAE", "Simulation"],
  roles: ["3D Modeling", "CAD Design", "Engineering Visualization"],
  headline: "Engineering Ideas Into 3D Reality.",
  intro: "Explore my work in 3D modeling, CAD design, and engineering visualization.",
  /** Production URL for social-sharing metadata. Uses NEXT_PUBLIC_SITE_URL, else Vercel's production domain. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  location: "Ghana",

  contact: {
    email: "nyaabaturibius@gmail.com",
    phone: "+233 508 994 760" as string | null,
    linkedin: "https://www.linkedin.com/in/turibius-nyaaba",
    github: null as string | null,
    /** Any other verified profiles, e.g. { label: "GrabCAD", href: "https://…" } */
    other: [] as { label: string; href: string }[],
  },

  about: {
    introduction:
      "Biomedical Engineer with a strong focus on product design, digital engineering, simulation and technology-driven problem solving. Experienced in transforming engineering concepts into functional and manufacturable solutions through CAD, CAE and virtual testing. My engineering journey has developed from designing medical devices to applying digital engineering to real-world problems, including leading an 8-member team in the Siemens Immersive Design Challenge to develop a virtual prosthetics testing environment for children and adults.",
    education: {
      degree: "BSc. Biomedical Engineering",
      institution: "Kwame Nkrumah University of Science and Technology (KNUST)",
      period: "2023 – 2026",
    },
    interests: ["3D modeling", "CAD design", "Engineering visualization", "Product development", "Digital twins"],
    experience: [
      {
        role: "3D Modelling, Product Design & Simulation",
        org: "DIPPER Lab — Distributed IoT-Platforms, Privacy and Edge-Intelligence Research",
        period: "Sep 2025 – Aug 2026",
        points: [
          "Lead 3D modelling, product design and simulation activities across multiple biomedical engineering projects, translating concepts into detailed and manufacturable designs.",
          "Contribute to five medical-device projects: High-Intensity Phototherapy Device, Sleep Apnea Monitor, Ezytherm, Neonatal Incubator and Automated Neonatal Device (ANET).",
          "Apply CAD and CAE to refine product geometry, evaluate design performance and support engineering decisions before physical prototyping.",
          "Collaborate with multidisciplinary teams to balance functionality, performance, usability and manufacturing requirements.",
        ],
      },
      {
        role: "Team Lead",
        org: "Siemens Immersive Design Challenge",
        period: null,
        points: [
          "Led an 8-member engineering team developing a Virtual Prosthetics Test Lab using digital engineering and simulation.",
          "Designed and evaluated prosthetic concepts digitally for children and adults, reducing dependence on repeated physical iterations.",
          "Applied virtual testing to investigate structural integrity, gait behaviour and pressure points.",
          "Applied Siemens NX and Simcenter 3D to demonstrate more efficient prosthetic design and testing.",
        ],
      },
      {
        role: "Head of Trade and Technology (Tratech)",
        org: "Biomedical Engineering Students' Association, KNUST",
        period: null,
        points: [
          "Led technical development initiatives that have trained 300+ biomedical engineering students in practical engineering skills.",
          "Design and coordinate workshops covering CAD, CAE, CFD, programming, electronics and product design.",
          "Mentor students in engineering tools, technical problem solving and product-development thinking.",
        ],
      },
    ] as Experience[],
    volunteering: {
      role: "Co-founder",
      org: "Helping Hands Foundation",
      summary:
        "Community initiative supporting underprivileged children — annual donation drives, including 2024 and 2025 outreach providing food, clothing and toiletries to Holy Child Orphanage.",
    },
    objective: null as string | null,
  },

  /**
   * Skills, from the CV. `level` is optional (0–1) — leave it out to show a skill without
   * a proficiency indicator.
   */
  skills: [
    {
      category: "CAD & Product Design",
      items: [
        { name: "SolidWorks" },
        { name: "Siemens NX" },
        { name: "3D Modelling" },
        { name: "Product Development" },
        { name: "Design for Manufacturability" },
        { name: "Prototyping" },
      ],
    },
    {
      category: "Simulation & Analysis",
      items: [
        { name: "Simcenter 3D" },
        { name: "CAE" },
        { name: "CFD" },
        { name: "Virtual Testing" },
        { name: "Engineering Simulation" },
      ],
    },
    {
      category: "Electronics & Hardware",
      items: [
        { name: "KiCad" },
        { name: "Siemens Electronic Design Automation" },
        { name: "Circuit Design" },
        { name: "Embedded Systems" },
      ],
    },
    {
      category: "Programming",
      items: [{ name: "Python" }, { name: "C++" }, { name: "MATLAB" }],
    },
    {
      category: "Emerging Technologies",
      items: [
        { name: "Artificial Intelligence" },
        { name: "AI-Assisted Engineering" },
        { name: "Digital Twins" },
        { name: "Digital Engineering" },
        { name: "Engineering Automation" },
      ],
    },
  ] as { category: string; items: { name: string; level?: number }[] }[],

  software: ["SolidWorks", "Siemens NX", "Simcenter 3D", "KiCad", "Siemens EDA", "Python", "C++", "MATLAB"],

  awards: [
    { title: "EDA Tech Trek", org: "Siemens", year: "2026", result: "Winner" },
    { title: "Immersive Design Challenge", org: "Siemens", year: "2026", result: "Semifinalist" },
    { title: "Future Workforce — Rising Star", org: "Siemens", year: null, result: null },
    { title: "Project Management & Integrated Engineering Course", org: "Siemens", year: null, result: "Certification" },
  ] as { title: string; org: string; year: string | null; result: string | null }[],

  /** Projects listed on the CV. `slug` links to a project page when it exists on this site. */
  cvProjects: [
    { title: "Wearable Lift Assist Arm Brace" },
    { title: "Virtual Prosthetic Test Lab" },
    { title: "Hand Actuation For Rehabilitation and Performance (HARP)", slug: "harp-hand-linkage" },
    { title: "High-Intensity Phototherapy Device", slug: "phototherapy-unit" },
    { title: "Sleep Apnea Monitor" },
    { title: "Ezytherm", slug: "handheld-device" },
    { title: "Neonatal Incubator" },
    { title: "Fetal Heart Rate and Kick Counting Device" },
    { title: "Automated Neonatal Device (ANET)" },
    { title: "Design of an Industrial Baking Oven" },
  ] as { title: string; slug?: string }[],

  process: [
    { title: "Understand the requirements", body: "Clarify the brief, constraints, dimensions and how the part will be used." },
    { title: "Develop the concept", body: "Explore layouts and forms before committing to geometry." },
    { title: "Create the 3D model", body: "Build parts and assemblies with clean, editable features and mates." },
    { title: "Refine & inspect the geometry", body: "Check fit, clearances and internal features with section and hidden-line views." },
    { title: "Validate or simulate", body: "Where appropriate, verify the design with CAE, CFD or virtual testing." },
    { title: "Present the final design", body: "Produce renders, drawings and interactive models that communicate the result." },
  ],

  resume: {
    /** The CV served by the Download Resume button. Replace the file to update it. */
    file: "/documents/resume.pdf",
  },

  /**
   * Videos. Drop files in /public/videos/ and list them here (H.264 MP4 recommended, with a
   * poster .jpg). Entries whose file doesn't exist are skipped, so the Video section only
   * appears once at least one real video is present.
   */
  videos: [
    {
      src: "/videos/showcase.mp4",
      poster: "/videos/showcase-poster.jpg",
      title: "Modeling in Motion",
    },
  ] as Video[],

  /** Optional muted, looping clip behind the hero (keep it short and under ~4 MB). Skipped if missing. */
  heroVideo: { src: "/videos/hero-loop.mp4", poster: "/videos/hero-loop-poster.jpg" },
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
