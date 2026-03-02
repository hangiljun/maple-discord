"use client"
import ChatRoom from "../components/ChatRoom" // 👈 경로가 맞는지 다시 확인 (상위 폴더의 components)
import Navbar from "../components/Navbar"

export default function MaplelandPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2 border-l-4 border-orange-500 pl-4">
           <h1 className="text-3xl font-bold text-white uppercase tracking-tighter">Mapleland Exchange</h1>
           <p className="text-gray-500 text-sm italic">실시간으로 올라오는 아이템 거래 정보를 확인하세요.</p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-[#1a1a1a] rounded-3xl border border-gray-800 p-20 text-center">
             <p className="text-gray-600 font-bold">거래 게시판은 업데이트 예정입니다.</p>
          </div>
          
          <div className="lg:col-span-1">
            {/* ✨ 이제 여기서 room="main_trade"를 넣어도 에러가 나지 않습니다. */}
            <ChatRoom room="main_trade" />
          </div>
        </div>
      </main>
    </div>
  )
}