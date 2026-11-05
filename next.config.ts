import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Fotos de capa dos destinos (Wikipédia/Wikimedia Commons)
    remotePatterns: [new URL("https://upload.wikimedia.org/**"), new URL("https://thumb.wikimedia.org/**")],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
