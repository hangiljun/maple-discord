import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.maplediscord.com"
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${base}/mapleland`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/notice`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/board`, lastModified: now, changeFrequency: "hourly", priority: 0.7 },
    { url: `${base}/report`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/tip`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/verify-request`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]
}
