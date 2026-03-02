"use client"

import ChatRoom from "../components/ChatRoom"

export default function MaplelandPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">메이플랜드 거래소</h1>
      <p className="text-gray-400 text-sm italic">실시간으로 올라오는 아이템 거래 정보를 확인하세요.</p>
      
      <div className="mt-4">
        {/* 홈 화면과 같은 채팅 데이터를 공유하도록 room 이름을 똑같이 맞춥니다 */}
        <ChatRoom room="main_trade" />
      </div>
    </main>
  )
}