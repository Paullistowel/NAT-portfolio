import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 is used for gallery/lightbox views, where CAD screenshots carry fine lines and UI text.
    qualities: [75, 90],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        // STL files are large and change rarely; let browsers and the CDN cache them.
        source: "/models/:file*",
        headers: [
          { key: "Content-Type", value: "model/stl" },
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
