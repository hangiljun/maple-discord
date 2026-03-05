"use client"
import { useEffect, useState } from "react"
import ChatRoom from "./components/ChatRoom"
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

export default function Home() {
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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">

        {/* 상단 안내 패널 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-[#1e3a5f] px-5 py-3">
            <span className="text-white font-black text-sm">🍁 메이플랜드 거래방에 오신 것을 환영합니다!</span>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div>
              <p className="font-bold text-blue-700 text-base mb-1">⚔️ 메이플랜드 전용 실시간 거래 채팅방</p>
              <p className="text-gray-500 font-medium text-sm">아이템 구매・판매・교환을 실시간으로! 인증 유저와 안전하게 거래하세요.</p>
            </div>
            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2.5 flex items-center gap-2">
              <span className="text-base flex-shrink-0">⚠️</span>
              <p className="text-sm font-bold text-yellow-800">거래 하실때 상대방 핸드폰 번호 꼭 받고 거래 해주세요</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">🛡️ 인증 유저 거래</span>
              <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">💬 실시간 채팅</span>
              <span className="bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">📋 사기꾼 제보</span>
            </div>
          </div>
        </div>

        {/* 거래 채팅 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <div className="bg-[#1e3a5f] px-5 py-2 rounded-full shadow-sm">
              <span className="text-white font-bold text-sm">🏪 실시간 거래방</span>
            </div>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
          <ChatRoom room="mapleland_trade" />
        </div>

        {/* 배너 섹션 */}
        {banners.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />
              <div className="bg-[#1e3a5f] px-5 py-2 rounded-full shadow-sm">
                <span className="text-white font-bold text-sm">🛡️ 신용 인증</span>
              </div>
              <div className="h-px flex-1 bg-gray-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {banners.map(banner => (
                <a key={banner.id} href={banner.link} target="_blank" rel="noopener noreferrer"
                  className="block border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all bg-white">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.description}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                  <div className="px-3 py-2.5 bg-white border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-relaxed">{banner.description}</p>
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
