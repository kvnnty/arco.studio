import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@arco/remotion", "@arco/project-schema"],
  webpack: (config) => {
    // The workspace packages use NodeNext-style ".js" extensions on relative
    // imports that actually resolve to ".ts" sources. Turbopack (dev) maps these
    // automatically, but the webpack production build does not, so we add the
    // extension alias explicitly to keep `next build` working.
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
