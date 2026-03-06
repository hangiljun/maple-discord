"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface Notice {
  id: string
  title: string
  content: string
  category: "패치노트" | "변경사항" | "공지"
  imageUrl?: string
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

          {/* 히어로 이미지 */}
          {notice.imageUrl && (
            <div className="w-full aspect-video overflow-hidden bg-[#F9FAFB]">
              <img
                src={notice.imageUrl}
                alt={notice.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  if (el.parentElement) el.parentElement.style.display = "none"
                }}
              />
            </div>
          )}

          {/* 제목 영역 */}
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

          {/* 내용 */}
          <div className="p-6">
            <p className="text-sm text-[#4E5968] leading-relaxed whitespace-pre-wrap">
              {notice.content}
            </p>
          </div>

        </div>

        {/* 목록 버튼 */}
        <button
          onClick={() => router.push("/notice")}
          className="w-full py-3 bg-white border border-[#E5E8EB] text-[#4E5968] rounded-xl font-medium text-sm hover:bg-[#F9FAFB] transition-colors">
          ← 공지 목록으로 돌아가기
        </button>

      </div>
    </div>
  )
}
