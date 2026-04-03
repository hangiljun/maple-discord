import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"

const PROJECT_ID = "maplediscord-cfc6a"
const API_KEY = "AIzaSyDn72fWR9UcseyGgK3uefx66f7o9Bv2t9A"

type SavedBlock = { type: "text"; value: string } | { type: "image"; url: string }

interface Notice {
  id: string
  title: string
  category: "패치노트" | "변경사항" | "공지"
  blocks?: SavedBlock[]
  content?: string
  imageUrls?: string[]
  imageUrl?: string
  createdAt?: string
  date: string
}

function parseFirestoreDoc(id: string, fields: any): Notice {
  function parseValue(v: any): any {
    if (!v) return null
    if (v.stringValue !== undefined) return v.stringValue
    if (v.integerValue !== undefined) return Number(v.integerValue)
    if (v.booleanValue !== undefined) return v.booleanValue
    if (v.timestampValue !== undefined) return v.timestampValue
    if (v.arrayValue) return (v.arrayValue.values || []).map(parseValue)
    if (v.mapValue) {
      const obj: any = {}
      for (const k in v.mapValue.fields) obj[k] = parseValue(v.mapValue.fields[k])
      return obj
    }
    return null
  }

  const data: any = {}
  for (const key in fields) data[key] = parseValue(fields[key])

  const ts = data.createdAt
  const date = ts
    ? new Date(ts).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : ""

  return { id, ...data, date }
}

async function getNotice(id: string): Promise<Notice | null> {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/notices/${id}?key=${API_KEY}`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return null
    const json = await res.json()
    if (!json.fields) return null
    return parseFirestoreDoc(id, json.fields)
  } catch {
    return null
  }
}

function getBlocks(notice: Notice): SavedBlock[] {
  if (notice.blocks && notice.blocks.length > 0) return notice.blocks
  const result: SavedBlock[] = []
  if (notice.content) result.push({ type: "text", value: notice.content })
  const imgs = notice.imageUrls && notice.imageUrls.length > 0
    ? notice.imageUrls
    : notice.imageUrl ? [notice.imageUrl] : []
  imgs.forEach(url => result.push({ type: "image", url }))
  return result
}

function getPreviewText(notice: Notice): string {
  const blocks = getBlocks(notice)
  const textBlock = blocks.find(b => b.type === "text")
  return textBlock ? (textBlock as { type: "text"; value: string }).value.slice(0, 120) : ""
}

const categoryStyle: Record<string, string> = {
  패치노트: "bg-blue-50 text-blue-600 border-blue-200",
  변경사항: "bg-purple-50 text-purple-600 border-purple-200",
  공지: "bg-amber-50 text-amber-600 border-amber-200",
}

const categoryIcon: Record<string, string> = {
  패치노트: "🔧",
  변경사항: "📝",
  공지: "📢",
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const notice = await getNotice(id)
  if (!notice) return { title: "공지를 찾을 수 없어요" }

  const description = getPreviewText(notice) || `메이플랜드 거래방 ${notice.category} 공지사항입니다.`

  return {
    title: notice.title,
    description,
    alternates: { canonical: `/notice/${id}` },
    openGraph: {
      title: notice.title,
      description,
      url: `/notice/${id}`,
      type: "article",
    },
  }
}

export default async function NoticeDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const notice = await getNotice(id)
  if (!notice) notFound()

  const blocks = getBlocks(notice)

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">

        <Link href="/notice"
          className="flex items-center gap-1.5 text-sm text-[#8B95A1] hover:text-[#191F28] transition-colors">
          ← 공지사항 목록
        </Link>

        <div className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">
          <div className="p-6 pb-4 border-b border-[#E5E8EB]">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${categoryStyle[notice.category]}`}>
                {categoryIcon[notice.category]} {notice.category}
              </span>
              <span className="text-xs text-[#8B95A1]">{notice.date}</span>
            </div>
            <h1 className="text-xl font-bold text-[#191F28] leading-snug">
              {notice.title}
            </h1>
          </div>

          <div className="p-6 space-y-4">
            {blocks.map((block, i) =>
              block.type === "text" ? (
                <p key={i} className="text-sm text-[#4E5968] leading-relaxed whitespace-pre-wrap">
                  {block.value}
                </p>
              ) : (
                <div key={i} className="w-full bg-[#F9FAFB] rounded-xl overflow-hidden border border-[#E5E8EB]">
                  <img
                    src={block.url}
                    alt={`이미지 ${i + 1}`}
                    className="w-full h-auto"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <Link href="/notice"
          className="block w-full py-3 bg-white border border-[#E5E8EB] text-[#4E5968] rounded-xl font-medium text-sm text-center hover:bg-[#F9FAFB] transition-colors">
          ← 공지 목록으로 돌아가기
        </Link>

      </div>
    </div>
  )
}
