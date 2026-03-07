import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일
  },

  async headers() {
    return [
      // JS/CSS 정적 에셋 — 영구 캐시 (해시 포함이라 안전)
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // 공개 폴더 이미지 — 7일 캐시
      {
        source: "/(.*)\\.(png|jpg|jpeg|webp|avif|svg|ico|gif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      // 보안 헤더 (전체)
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
