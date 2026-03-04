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
  패치노트: "bg-blue-100 text-blue-700 border-blue-200",
  변경사항: "bg-purple-100 text-purple-700 border-purple-200",
  공지: "bg-amber-100 text-amber-700 border-amber-200",
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
      <div className="min-h-screen bg-[#D6EEFF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1877D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !notice) {
    return (
      <div className="min-h-screen bg-[#D6EEFF] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">📭</div>
          <p className="font-black text-[#0A3D6B] text-lg">공지를 찾을 수 없어요</p>
          <button onClick={() => router.push("/notice")}
            className="bg-[#1877D4] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md">
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D6EEFF]">

      {/* 히어로 이미지 영역 */}
      {notice.imageUrl ? (
        <div className="relative w-full h-56 md:h-80 overflow-hidden bg-[#0A3D6B]">
          <img
            src={notice.imageUrl}
            alt={notice.title}
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              const el = e.target as HTMLImageElement
              if (el.parentElement) el.parentElement.style.display = "none"
            }}
          />
          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A3D6B]/80 via-transparent to-transparent" />
          {/* 뒤로가기 버튼 */}
          <button
            onClick={() => router.push("/notice")}
            className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-black text-sm hover:bg-white/30 transition-colors flex items-center gap-1.5 border border-white/30">
            ← 목록으로
          </button>
        </div>
      ) : (
        /* 이미지 없을 때 헤더 배너 */
        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] px-4 pt-4 pb-6">
          <button
            onClick={() => router.push("/notice")}
            className="text-sky-200 font-bold text-sm hover:text-white transition-colors flex items-center gap-1.5 mb-3">
            ← 목록으로
          </button>
        </div>
      )}

      {/* 본문 카드 */}
      <div className="max-w-2xl mx-auto px-4 -mt-4 md:-mt-6 pb-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-[#5BA8D8] overflow-hidden">

          {/* 제목 영역 */}
          <div className="p-6 pb-4 border-b-2 border-[#EBF7FF]">
            {/* 이미지 없을 때 뒤로가기 대신 이 영역에 표시 — 이미지 있으면 위에서 처리됨 */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${categoryStyle[notice.category]}`}>
                {categoryIcon[notice.category]} {notice.category}
              </span>
              <span className="text-xs text-gray-400 font-bold">{notice.date}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#0A3D6B] leading-snug">
              {notice.title}
            </h1>
          </div>

          {/* 이미지 있을 때 카드 내부에도 표시 (썸네일용 — 히어로와 별개) */}
          {/* 실제 내용 */}
          <div className="p-6">
            <p className="text-sm md:text-base text-[#444] leading-relaxed whitespace-pre-wrap font-medium">
              {notice.content}
            </p>
          </div>

        </div>

        {/* 목록 버튼 */}
        <button
          onClick={() => router.push("/notice")}
          className="mt-5 w-full py-3.5 bg-[#EBF7FF] border-2 border-[#5BA8D8] text-[#1877D4] rounded-2xl font-black text-sm hover:bg-[#D0E8FF] transition-colors">
          ← 공지 목록으로 돌아가기
        </button>
      </div>

    </div>
  )
}
