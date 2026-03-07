"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

type SavedBlock = { type: "text"; value: string } | { type: "image"; url: string }

interface Notice {
  id: string
  title: string
  category: "패치노트" | "변경사항" | "공지"
  blocks?: SavedBlock[]
  content?: string      // 하위 호환
  imageUrls?: string[]  // 하위 호환
  imageUrl?: string     // 하위 호환
  createdAt?: any
  date: string
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

function getBlocks(notice: Notice): SavedBlock[] {
  if (notice.blocks && notice.blocks.length > 0) return notice.blocks
  // 하위 호환: 기존 content + imageUrls 조합
  const result: SavedBlock[] = []
  if (notice.content) result.push({ type: "text", value: notice.content })
  const imgs = notice.imageUrls && notice.imageUrls.length > 0
    ? notice.imageUrls
    : notice.imageUrl ? [notice.imageUrl] : []
  imgs.forEach(url => result.push({ type: "image", url }))
  return result
}

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, "notices", id)).then((snap) => {
      if (!snap.exists()) {
        setNotFound(true)
      } else {
        const data = snap.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR", {
          year: "numeric", month: "long", day: "numeric"
        }) || ""
        setNotice({ id: snap.id, ...data, date } as Notice)
      }
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !notice) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="font-semibold text-[#191F28] text-lg">공지를 찾을 수 없어요</p>
          <button onClick={() => router.push("/notice")}
            className="bg-[#3182F6] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#1C6EE8] transition-colors">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const blocks = getBlocks(notice)

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* 뒤로가기 */}
        <button onClick={() => router.push("/notice")}
          className="flex items-center gap-1.5 text-sm text-[#8B95A1] hover:text-[#191F28] transition-colors">
          ← 공지사항 목록
        </button>

        {/* 본문 카드 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">

          {/* 제목 */}
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

          {/* 블록 렌더링 */}
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
                    onError={(e) => {
                      const el = e.target as HTMLImageElement
                      if (el.parentElement) el.parentElement.style.display = "none"
                    }}
                  />
                </div>
              )
            )}
          </div>

        </div>

        {/* 목록 버튼 */}
        <button onClick={() => router.push("/notice")}
          className="w-full py-3 bg-white border border-[#E5E8EB] text-[#4E5968] rounded-xl font-medium text-sm hover:bg-[#F9FAFB] transition-colors">
          ← 공지 목록으로 돌아가기
        </button>

      </div>
    </div>
  )
}
