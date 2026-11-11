import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Fotos de capa dos destinos (Wikipédia/Wikimedia Commons)
    remotePatterns: [new URL("https://upload.wikimedia.org/**"), new URL("https://thumb.wikimedia.org/**")],
  },
  partialPrefetching: true,
  // Endereço oficial: tripper.robertoluis.com.br. O antigo (vercel.app) redireciona para ele,
  // menos /api (callbacks de login e webhooks em andamento continuam funcionando).
  async redirects() {
    return [
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "tripper-lovat.vercel.app" }],
        destination: "https://tripper.robertoluis.com.br/:path",
        permanent: false,
      },
    ];
  },
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
