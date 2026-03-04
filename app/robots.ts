import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://메이플디스코드.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/profile/", "/messages", "/verify-request"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
