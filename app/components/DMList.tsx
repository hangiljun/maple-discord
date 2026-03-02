"use client"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"

interface DMRoom {
  id: string
  participantNames: Record<string, string>
  participants: string[]
  lastMessage: string
  lastMessageAt?: any
  unread: Record<string, number>
}

interface Props {
  myUid: string
  onSelectRoom: (room: DMRoom) => void
  selectedRoomId?: string
}

export default function DMList({ myUid, onSelectRoom, selectedRoomId }: Props) {
  const [rooms, setRooms] = useState<DMRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, "dm_rooms"),
      where("participants", "array-contains", myUid),
      orderBy("lastMessageAt", "desc")
    )
    const unsub = onSnapshot(q, (snap) => {
      const data: DMRoom[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as DMRoom))
      setRooms(data)
      setLoading(false)
    }, console.error)
    return () => unsub()
  }, [myUid])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-6 h-6 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-4xl mb-3">💬</div>
        <p className="font-black text-[#A64D13] text-sm">아직 대화가 없어요</p>
        <p className="text-xs text-gray-400 mt-1">채팅방에서 유저를 우클릭해서<br/>1:1 대화를 시작해보세요!</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#FFE8CC]">
      {rooms.map((room) => {
        const otherUid = room.participants.find(p => p !== myUid) || ""
        const otherName = room.participantNames[otherUid] || "알 수 없음"
        const unreadCount = room.unread?.[myUid] || 0
        const isSelected = room.id === selectedRoomId

        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room)}
            className={`w-full text-left px-4 py-3.5 flex items-center gap-3 transition-colors ${
              isSelected ? "bg-[#FFF0DC]" : "hover:bg-[#FFF9F0]"
            }`}
          >
            {/* 아바타 */}
            <div className="w-10 h-10 rounded-full bg-[#FFD8A8] flex items-center justify-center text-lg flex-shrink-0">
              🍁
            </div>

            {/* 이름 + 마지막 메시지 */}
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-[#5D4037] truncate">{otherName}</p>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {room.lastMessage || "대화를 시작해보세요!"}
              </p>
            </div>

            {/* 안읽은 배지 */}
            {unreadCount > 0 && (
              <div className="w-5 h-5 rounded-full bg-[#E67E22] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}