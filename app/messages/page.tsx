"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import DMList from "@/app/components/DMList"
import DMChatWindow from "@/app/components/DMChatWindow"

interface DMRoom {
  id: string
  participantNames: Record<string, string>
  participants: string[]
  lastMessage: string
  unread: Record<string, number>
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<DMRoom | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) {
            setUserNickname(snap.data().nickname || u.email?.split("@")[0] || "모험가")
          }
        } catch {
          setUserNickname(u.email?.split("@")[0] || "모험가")
        }
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-5xl">🔒</div>
        <p className="font-black text-[#A64D13] text-lg">로그인이 필요해요</p>
        <p className="text-sm text-gray-400">1:1 메시지는 회원만 사용할 수 있어요</p>
        <a href="/login"
          className="bg-[#E67E22] text-white px-8 py-3 rounded-2xl font-black text-sm shadow-md hover:bg-[#D35400] transition-colors">
          로그인하기
        </a>
      </div>
    )
  }

  const otherUid = selectedRoom?.participants.find(p => p !== user.uid) || ""
  const otherName = selectedRoom?.participantNames[otherUid] || ""

  return (
    <div className="min-h-screen bg-[#FFFEFA]">
      {/* 모바일: 목록 또는 대화창 전환 */}
      <div className="max-w-2xl mx-auto">

        {/* 대화창이 선택된 경우 */}
        {selectedRoom ? (
          <div className="h-screen flex flex-col bg-white border-x border-[#FFD8A8]">
            <DMChatWindow
              chatId={selectedRoom.id}
              myUid={user.uid}
              myName={userNickname}
              otherName={otherName}
              onBack={() => setSelectedRoom(null)}
            />
          </div>
        ) : (
          /* 목록 화면 */
          <div className="bg-white border-x border-[#FFD8A8] min-h-screen">
            {/* 헤더 */}
            <div className="bg-[#FFF4E6] border-b-4 border-[#FFD8A8] px-5 py-4 flex items-center gap-2 sticky top-0 z-10">
              <a href="/"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFD8A8] hover:bg-[#FFB347] text-[#A64D13] font-black text-sm transition-colors mr-1">
                ←
              </a>
              <span className="text-lg">💬</span>
              <span className="font-black text-[#A64D13]">메시지</span>
              <span className="ml-auto text-xs text-[#FFB347] font-bold">🍁 {userNickname}</span>
            </div>

            {/* DM 목록 */}
            <DMList
              myUid={user.uid}
              onSelectRoom={(room) => setSelectedRoom(room as DMRoom)}
              selectedRoomId={selectedRoom?.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}