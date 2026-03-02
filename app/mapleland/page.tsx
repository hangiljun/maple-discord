"use client"
import ChatRoom from "../components/ChatRoom"

export default function MaplelandPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F2] p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 디스코드 바로가기 UI */}
        <div className="bg-white border-4 border-[#FFD8A8] p-6 rounded-[30px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#5865F2] rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">💬</div>
            <div>
              <h3 className="font-black text-[#E67E22] text-lg">공식 디스코드 채널</h3>
              <p className="text-[#A64D13] text-xs font-bold">더 많은 유저들과 실시간으로 소통해보세요!</p>
            </div>
          </div>
          <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-3 rounded-full font-black text-sm transition-all shadow-md">
            디스코드 입장하기
          </button>
        </div>

        {/* 채팅창 (메인) */}
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-black text-[#E67E22]">메이플랜드 실시간 거래소</h1>
            <p className="text-[#A64D13] text-sm font-bold mt-1">게시판 없이 채팅으로 빠르게 거래하세요!</p>
          </div>
          <ChatRoom room="mapleland_trade" />
        </div>

      </div>
    </div>
  )
}