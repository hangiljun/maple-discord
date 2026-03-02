"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import DMList from "@/app/components/DMList"
import DMChatWindow from "@/app/components/DMChatWindow"
import { getOrCreateGuestUid } from "@/lib/dm"

interface DMRoom {
  id: string
  participantNames: Record<string, string>
  participants: string[]
  lastMessage: string
  unread: Record<string, number>
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [myUid, setMyUid] = useState<string>("")
  const [myName, setMyName] = useState<string>("")
  const [selectedRoom, setSelectedRoom] = useState<DMRoom | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // 회원
        setUser(u)
        setMyUid(u.uid)
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) {
            setMyName(snap.data().nickname || u.email?.split("@")[0] || "모험가")
          } else {
            setMyName(u.email?.split("@")[0] || "모험가")
          }
        } catch {
          setMyName(u.email?.split("@")[0] || "모험가")
        }
      } else {
        // 비회원 - localStorage uid 사용
        setUser(null)
        const guestUid = getOrCreateGuestUid()
        const guestName = localStorage.getItem("maple_guest_name") || "비회원"
        setMyUid(guestUid)
        setMyName(guestName)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFFEFA]">
        <div className="w-8 h-8 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // uid가 없으면 (SSR 등) 대기
  if (!myUid) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFFEFA]">
        <div className="w-8 h-8 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const otherUid = selectedRoom?.participants.find(p => p !== myUid) || ""
  const otherName = selectedRoom?.participantNames[otherUid] || "알 수 없음"

  return (
    <div className="min-h-screen bg-[#FFFEFA]">
      <div className="max-w-2xl mx-auto">

        {selectedRoom ? (
          /* 대화창 */
          <div className="h-screen flex flex-col bg-white border-x border-[#FFD8A8]">
            <DMChatWindow
              chatId={selectedRoom.id}
              myUid={myUid}
              myName={myName}
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
              <div className="ml-auto flex items-center gap-1.5">
                {!user && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
                    비회원
                  </span>
                )}
                <span className="text-xs text-[#FFB347] font-bold">
                  {user ? `🍁 ${myName}` : `👤 ${myName}`}
                </span>
              </div>
            </div>

            {/* 비회원 안내 배너 */}
            {!user && (
              <div className="mx-4 mt-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <div>
                  <p className="text-xs font-black text-amber-700">비회원으로 이용 중이에요</p>
                  <p className="text-[10px] text-amber-600 mt-0.5">
                    같은 기기에서만 대화 내역을 볼 수 있어요.
                    <a href="/login" className="underline ml-1 font-bold">로그인하면</a> 어디서든 확인할 수 있어요!
                  </p>
                </div>
              </div>
            )}

            {/* DM 목록 */}
            <DMList
              myUid={myUid}
              onSelectRoom={(room) => setSelectedRoom(room as DMRoom)}
              selectedRoomId={selectedRoom?.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}