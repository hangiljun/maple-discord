"use client"
import { useState, useEffect, useRef } from "react"
import { db } from "@/lib/firebase"
import {
  collection, query, orderBy, onSnapshot,
  limit, doc
} from "firebase/firestore"
import { sendDMMessage, markAsRead } from "@/lib/dm"

interface DMMessage {
  id: string
  text: string
  senderUid: string
  senderName: string
  createdAt?: any
  clientTime?: number
  time: string
}

interface Props {
  chatId: string
  myUid: string
  myName: string
  otherName: string
  onBack: () => void
}

export default function DMChatWindow({ chatId, myUid, myName, otherName, onBack }: Props) {
  const [messages, setMessages] = useState<DMMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 실시간 메시지 리스너
  useEffect(() => {
    const q = query(
      collection(db, "dm_rooms", chatId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    )
    const unsub = onSnapshot(q, (snap) => {
      const msgs: DMMessage[] = snap.docs.map(d => {
        const data = d.data()
        const date = data.createdAt?.toDate() || new Date(data.clientTime)
        return {
          id: d.id,
          ...data,
          time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        } as DMMessage
      })
      setMessages(msgs)
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }, console.error)

    // 입장 시 읽음 처리
    markAsRead(chatId, myUid).catch(console.error)

    return () => unsub()
  }, [chatId, myUid])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return
    const text = newMessage.trim()
    setNewMessage("")
    setSending(true)

    // 상대방 uid 구하기 (chatId = uid1_uid2 형태)
    const otherUid = chatId.split("__").find(id => id !== myUid) || ""

    try {
      await sendDMMessage(chatId, myUid, myName, text, otherUid)
    } catch (err) {
      console.error("전송 실패:", err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="bg-[#FFF4E6] border-b-4 border-[#FFD8A8] px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#FFD8A8] hover:bg-[#FFB347] text-[#A64D13] font-black transition-colors text-sm"
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#FFD8A8] flex items-center justify-center text-sm">
            🍁
          </div>
          <div>
            <p className="font-black text-[#A64D13] text-sm leading-tight">{otherName}</p>
            <p className="text-[10px] text-[#FFB347]">1:1 대화</p>
          </div>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFEFA]">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm text-[#FFD8A8] font-bold">{otherName}님께 첫 메시지를 보내보세요!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderUid === myUid
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              {!isMine && (
                <span className="text-[10px] font-bold text-[#A64D13] mb-1 ml-1">
                  🍁 {msg.senderName}
                </span>
              )}
              <div className="flex items-end gap-1.5">
                {isMine && <span className="text-[9px] text-gray-400 mb-0.5">{msg.time}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-bold max-w-[75%] break-words ${
                  isMine
                    ? "bg-[#E67E22] text-white rounded-br-sm"
                    : "bg-white border-2 border-[#FFD8A8] text-[#5D4037] rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
                {!isMine && <span className="text-[9px] text-gray-400 mb-0.5">{msg.time}</span>}
              </div>
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {/* 입력창 */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] flex gap-2"
      >
        <input
          className="flex-1 p-3 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white"
          placeholder={`${otherName}님께 메시지 보내기`}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          disabled={sending || !newMessage.trim()}
          className="bg-[#E67E22] disabled:bg-gray-300 text-white px-5 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all whitespace-nowrap"
        >
          전송
        </button>
      </form>
    </div>
  )
}