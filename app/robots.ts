import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://xn--hy1b4dx1oi1j79fx7mzwj.com"

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
