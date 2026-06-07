import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@arco/remotion", "@arco/project-schema"],
};

export default nextConfig;
