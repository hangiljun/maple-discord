"use client"
import ChatRoom from "../components/ChatRoom"

export default function MaplelandPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-5 py-4">
          <h1 className="text-xl font-bold text-[#191F28]">메이플랜드 실시간 거래방</h1>
          <p className="text-[#8B95A1] text-sm mt-1">실시간 채팅으로 빠르게 거래하세요!</p>
        </div>

        {/* 주의사항 */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-base flex-shrink-0">⚠️</span>
          <p className="text-sm font-medium text-[#92400E]">거래 하실때 상대방 핸드폰 번호 꼭 받고 거래 해주세요</p>
        </div>

        <ChatRoom room="mapleland_trade" />

      </div>
    </div>
  )
}
