"use client"

import AdBanner from "./components/AdBanner"
import ChatRoom from "./components/ChatRoom"

export default function Home() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-10">
      {/* 상단 광고 섹션 */}
      <AdBanner />

      {/* 실시간 채팅 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h2 className="text-2xl font-bold text-white">메이플랜드 실시간 거래방</h2>
        </div>
        {/* 방 이름을 'main_trade'로 통일합니다 */}
        <ChatRoom room="main_trade" />
      </section>
    </main>
  )
}