"use client"
import { useEffect, useState } from "react"
import ChatRoom from "./ChatRoom"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

interface Banner {
  id: string
  imageUrl: string
  description: string
  link: string
  order: number
  active: boolean
}

export default function HomeClient() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("order"))
    return onSnapshot(q, (snap) => {
      setBanners(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Banner))
          .filter(b => b.active)
          .slice(0, 4)
      )
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-5">

        {/* 상단 안내 패널 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E8EB]">
            <h1 className="font-bold text-[#191F28] text-base">메이플랜드 전용 실시간 거래 채팅방</h1>
            <p className="text-[#8B95A1] text-sm mt-1">아이템 구매・판매・교환을 실시간으로! 인증 유저와 안전하게 거래하세요.</p>
          </div>
          <div className="px-5 py-3 bg-[#FFFBEB] border-b border-[#E5E8EB] flex items-center gap-2">
            <span className="text-sm flex-shrink-0">⚠️</span>
            <p className="text-sm font-medium text-[#92400E]">거래 하실때 상대방 핸드폰 번호 꼭 받고 거래 해주세요</p>
          </div>
          <div className="px-5 py-3 flex flex-wrap gap-2">
            <span className="bg-[#EBF3FE] text-[#3182F6] text-xs font-semibold px-3 py-1 rounded-full">인증 유저 거래</span>
            <span className="bg-[#EBF3FE] text-[#3182F6] text-xs font-semibold px-3 py-1 rounded-full">실시간 채팅</span>
            <span className="bg-[#EBF3FE] text-[#3182F6] text-xs font-semibold px-3 py-1 rounded-full">사기꾼 제보</span>
          </div>
        </div>

        {/* 거래 채팅 */}
        <div>
          <p className="text-xs font-semibold text-[#8B95A1] uppercase tracking-wide mb-2 px-1">실시간 거래방</p>
          <ChatRoom room="mapleland_trade" />
        </div>

        {/* 배너 섹션 */}
        {banners.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8B95A1] uppercase tracking-wide mb-2 px-1">신용 인증</p>
            <div className="grid grid-cols-2 gap-3">
              {banners.map(banner => (
                <a key={banner.id} href={banner.link} target="_blank" rel="noopener noreferrer"
                  className="block bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden hover:border-[#3182F6] transition-colors">
                  <div className="aspect-[4/3] bg-[#F9FAFB] overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.description}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                  <div className="px-3 py-2.5 border-t border-[#E5E8EB]">
                    <p className="text-xs font-medium text-[#4E5968] line-clamp-2 leading-relaxed">{banner.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
