import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'standalone' output mode - not needed for Amplify SSR
  // Amplify's WEB_COMPUTE platform handles the deployment automatically
};

export default nextConfig;
