import type { MetadataRoute } from "next"

const BASE_URL = "https://www.maplediscord.com"
const PROJECT_ID = "maplediscord-cfc6a"

async function fetchDocs(col: string): Promise<{ id: string; lastModified: Date }[]> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${col}?pageSize=200&orderBy=createdAt%20desc`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return (data.documents || []).map((doc: any) => {
      const id = (doc.name as string).split("/").pop() ?? ""
      const ts = doc.fields?.createdAt?.timestampValue
      return { id, lastModified: ts ? new Date(ts) : new Date() }
    })
  } catch {
    return []
  }
}

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                   lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/notice`,       lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/board`,        lastModified: now, changeFrequency: "hourly",  priority: 0.8 },
    { url: `${BASE_URL}/maplestory`,   lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/mapleland`,    lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/mapleplanet`,  lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/tip`,          lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ]

  const [noticeDocs, boardDocs] = await Promise.all([
    fetchDocs("notices"),
    fetchDocs("board_posts"),
  ])

  const noticeRoutes: MetadataRoute.Sitemap = noticeDocs.map(({ id, lastModified }) => ({
    url: `${BASE_URL}/notice/${id}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const boardRoutes: MetadataRoute.Sitemap = boardDocs.map(({ id, lastModified }) => ({
    url: `${BASE_URL}/board/${id}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.7,
  }))

  return [...staticRoutes, ...noticeRoutes, ...boardRoutes]
}
