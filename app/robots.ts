import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dev", "/login", "/api/"],
      },
    ],
    sitemap: "https://www.maplediscord.com/sitemap.xml",
    host: "https://www.maplediscord.com",
  }
}
