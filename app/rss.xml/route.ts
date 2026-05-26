import { NextResponse } from "next/server"

const BASE_URL = "https://www.maplediscord.com"
const PROJECT_ID = "maplediscord-cfc6a"

async function fetchCollection(collection: string, orderBy: string, limit: number) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=${limit}&orderBy=${orderBy}%20desc`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.documents || []
  } catch {
    return []
  }
}

function escape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function getField(doc: any, field: string): string {
  const fields = doc.fields || {}
  const f = fields[field]
  if (!f) return ""
  return f.stringValue ?? f.integerValue ?? f.booleanValue ?? ""
}

function getTimestamp(doc: any, field: string): string {
  const fields = doc.fields || {}
  const f = fields[field]
  if (!f?.timestampValue) return new Date().toUTCString()
  return new Date(f.timestampValue).toUTCString()
}

function getDocId(doc: any): string {
  // doc.name = "projects/.../databases/(default)/documents/collection/DOCID"
  return (doc.name as string).split("/").pop() ?? ""
}

export async function GET() {
  const [boardDocs, noticeDocs] = await Promise.all([
    fetchCollection("board_posts", "createdAt", 20),
    fetchCollection("notices", "createdAt", 10),
  ])

  type RssItem = { title: string; link: string; description: string; pubDate: string; guid: string }
  const items: RssItem[] = []

  for (const doc of noticeDocs) {
    const title = getField(doc, "title")
    const content = getField(doc, "content")
    if (!title) continue
    const id = getDocId(doc)
    const url = `${BASE_URL}/notice/${id}`
    items.push({
      title: escape(title),
      link: url,
      description: escape(content.slice(0, 200)),
      pubDate: getTimestamp(doc, "createdAt"),
      guid: url,
    })
  }

  for (const doc of boardDocs) {
    const title = getField(doc, "title")
    const content = getField(doc, "content")
    if (!title) continue
    const id = getDocId(doc)
    const url = `${BASE_URL}/board/${id}`
    items.push({
      title: escape(title),
      link: url,
      description: escape(content.slice(0, 200)),
      pubDate: getTimestamp(doc, "createdAt"),
      guid: url,
    })
  }

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>메이플랜드 거래방</title>
    <link>${BASE_URL}</link>
    <description>메이플랜드 메소 거래, 아이템 안전거래, 교환 전문 디스코드 거래방</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map(item => `    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <description>${item.description}</description>
      <pubDate>${item.pubDate}</pubDate>
      <guid>${item.guid}</guid>
    </item>`).join("\n")}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  })
}
