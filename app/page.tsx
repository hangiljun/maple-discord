"use client"
import ChatRoom from "./components/ChatRoom"

export default function Home() {
  return (
    // 💡 Navbar 코드를 여기서 완전히 삭제했습니다. 
    // 이제 layout.tsx에 있는 상단바 하나만 정상적으로 보입니다.
    <div className="min-h-screen bg-[#FFF9F2] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* 디스코드 섹션 */}
        <div className="bg-white border-4 border-[#FFD8A8] p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#5865F2] rounded-[20px] flex items-center justify-center text-white text-3xl shadow-lg">💬</div>
            <div>
              <h3 className="font-black text-[#E67E22] text-xl">메이플 디스코드 공식 커뮤니티</h3>
              <p className="text-[#A64D13] font-bold mt-1">가장 빠른 거래 정보와 유저 소통을 만나보세요!</p>
            </div>
          </div>
          <button className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-10 py-4 rounded-full font-black text-lg shadow-lg transition-transform active:scale-95">
            디스코드 입장하기
          </button>
        </div>

        {/* 채팅 섹션 */}
        <div className="grid grid-cols-1 gap-6">
          <div className="text-center">
            <h2 className="bg-[#E67E22] text-white py-2 px-8 rounded-full inline-block font-black shadow-md mb-4 uppercase tracking-tighter">
              Real-time Market
            </h2>
            <p className="text-[#A64D13] font-bold text-sm">원하는 거래 카테고리를 선택해 보세요.</p>
          </div>
          <ChatRoom room="main_trade" />
        </div>

      </div>
    </div>
  )
}