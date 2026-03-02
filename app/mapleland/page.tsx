"use client"
import ChatRoom from "../components/ChatRoom"
import AdBanner from "../components/AdBanner"

export default function MaplelandPage() {
  return (
    // Navbar는 layout.tsx에 이미 있으므로 여기선 생략합니다.
    <div className="min-h-screen bg-[#FFF9F2]">
      <main className="max-w-5xl mx-auto p-4 md:p-10">
        <AdBanner />

        {/* 메인 타이틀 섹션 */}
        <div className="mt-10 mb-8 text-center space-y-3">
           <h1 className="text-4xl md:text-5xl font-black text-[#E67E22] tracking-tighter drop-shadow-sm">
             MAPLELAND MARKET
           </h1>
           <p className="text-[#A64D13] font-bold text-lg italic bg-white/50 py-2 rounded-full inline-block px-10 border-2 border-[#FFD8A8]">
             "메이플랜드 유저들의 활발한 실시간 거래 광장"
           </p>
        </div>
        
        {/* 채팅창 메인 배치 (게시판 삭제로 화면 꽉 채움) */}
        <div className="w-full">
            <ChatRoom room="mapleland_trade" />
        </div>

        {/* 하단 안내 문구 */}
        <div className="mt-10 p-6 bg-white/40 border-2 border-dashed border-[#FFD8A8] rounded-3xl text-center">
            <p className="text-[#A64D13] text-sm font-bold">
              💡 팁: 닉네임을 클릭하면 해당 유저의 신뢰도와 인증 정보를 확인할 수 있습니다.
            </p>
        </div>
      </main>
    </div>
  )
}