import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // Proxy API routes to handle potential CORS issues
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
};

export default nextConfig;
