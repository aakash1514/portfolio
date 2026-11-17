import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // YouTube thumbnails for the click-to-load demo video embeds.
    remotePatterns: [new URL("https://i.ytimg.com/vi/**")],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "quantaxis.dev" }],
        destination: "https://aakash-devkar.vercel.app/projects/quantaxis",
        permanent: true,
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
