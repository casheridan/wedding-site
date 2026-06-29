import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray package-lock.json exists in a parent folder; pin the workspace root
  // to this project so Turbopack/file-tracing resolve correctly (incl. on Vercel).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
