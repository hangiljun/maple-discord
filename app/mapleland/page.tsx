"use client"
import ChatRoom from "../components/ChatRoom"

export default function MaplelandPage() {
  return (
    // 💡 여기서 Navbar를 넣지 마세요! layout.tsx에서 자동으로 보여줍니다.
    <div className="min-h-screen bg-[#FFF9F2] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* 🎨 디스코드 바로가기 UI */}
        <div className="bg-white border-4 border-[#FFD8A8] p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#5865F2] rounded-[20px] flex items-center justify-center text-white text-3xl shadow-lg">💬</div>
            <div>
              <h3 className="font-black text-[#E67E22] text-xl">공식 디스코드 커뮤니티</h3>
              <p className="text-[#A64D13] font-bold mt-1">가장 빠른 거래 정보와 유저 소통을 만나보세요!</p>
            </div>
          </div>
          <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-4 rounded-full font-black text-lg shadow-lg transition-transform active:scale-95">
            디스코드 입장하기
          </button>
        </div>

        {/* 채팅창 섹션 */}
        <div className="grid grid-cols-1 gap-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-[#E67E22]">메이플랜드 거래 광장</h1>
            <p className="text-[#A64D13] font-bold text-sm">별도의 게시판 없이 실시간 채팅으로 빠르게 거래하세요!</p>
          </div>
          <ChatRoom room="mapleland_trade" />
        </div>

      </div>
    </div>
  )
}