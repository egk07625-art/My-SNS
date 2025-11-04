import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "img.clerk.com" }],
  },
  // Route Group 내 Client Component 빌드 이슈 해결
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Turbopack 설정 (Next.js 16에서 기본 활성화)
  // webpack 설정은 제거하고 Turbopack을 사용
  turbopack: {
    // Workspace root 경고 해결
    root: process.cwd(),
  },
};

export default nextConfig;
