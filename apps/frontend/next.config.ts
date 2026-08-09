import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    // Allow Next Image to optimize images served from the /uploads/ path.
    // These are candidate photos and other user-uploaded assets served by
    // the API container through the nginx /uploads/ proxy location.
    // The browser always accesses them via the same origin as the frontend
    // (relative path), so we declare them as localPatterns.
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],

    // If the STORAGE_BASE_URL is ever set to an absolute HTTP origin (e.g.
    // when the API is deployed on a separate host), the remotePatterns below
    // allow Next Image to also optimize those absolute URLs.
    // The wildcard hostname ensures it works for any configured API origin
    // without hardcoding localhost or Docker service names.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
