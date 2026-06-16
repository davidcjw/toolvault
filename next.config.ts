import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up a stray lockfile in $HOME.
  turbopack: { root: __dirname },
};

export default nextConfig;
