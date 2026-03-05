"use client"
import ChatRoom from "../components/ChatRoom"

export default function MaplelandPage() {
  return (
    <div className="min-h-screen bg-[#D6EEFF] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 text-center shadow-lg">
          <h1 className="text-3xl font-black text-white">🏪 메이플랜드 실시간 거래방</h1>
          <p className="text-sky-200 font-bold text-sm mt-1">실시간 채팅으로 빠르게 거래하세요!</p>
        </div>

        {/* 주의사항 */}
        <div className="bg-[#FFF3CD] border-2 border-[#FBBF24] rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm">
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p className="text-sm font-black text-[#92400E]">거래 하실때 상대방 핸드폰 번호 꼭 받고 거래 해주세요</p>
        </div>

        <ChatRoom room="mapleland_trade" />

      </div>
    </div>
  )
}
