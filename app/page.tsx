"use client"
import Navbar from "./components/Navbar"
import ChatRoom from "./components/ChatRoom" // 👈 경로가 "@/app/components/ChatRoom" 이어야 할 수도 있습니다.
import AdBanner from "./components/AdBanner"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdBanner />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
             <div className="bg-[#1a1a1a] p-10 rounded-3xl border border-gray-800 text-center">
                <h2 className="text-2xl font-bold text-gray-600">준비 중인 게시판입니다.</h2>
             </div>
          </div>
          <div className="lg:col-span-1">
            <ChatRoom />
          </div>
        </div>
      </main>
    </div>
  )
}