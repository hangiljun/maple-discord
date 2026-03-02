"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, where } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

// ✨ room 속성을 받을 수 있도록 정의
interface ChatRoomProps {
  room?: string; 
}

export default function ChatRoom({ room = "main_trade" }: ChatRoomProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid))
        if (userSnap.exists()) setUserData(userSnap.data())
      }
    })

    // ✨ 특정 room의 메시지만 가져오도록 쿼리 수정
    const q = query(
      collection(db, "chats"), 
      where("room", "==", room), // 👈 room 필드가 일치하는 것만 필터링
      orderBy("createdAt", "asc")
    )
    
    const unsubChat = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    return () => { unsubAuth(); unsubChat(); }
  }, [room]) // room이 바뀌면 채팅방도 새로고침

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    await addDoc(collection(db, "chats"), {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: user.uid,
      room: room, // ✨ 어떤 방에서 쓴 채팅인지 저장
      displayName: userData?.nickname || user.email?.split('@')[0],
      isVerified: userData?.verified || false,
      badge: userData?.badge || "B"
    })
    setNewMessage("")
  }

  return (
    <div className="flex flex-col h-[600px] bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="font-bold text-orange-500 text-sm">
          {room === "main_trade" ? "전체 거래 채팅" : "메이플랜드 전용 채팅"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              {msg.isVerified && (
                <span className="bg-green-600 text-white text-[9px] px-1 rounded font-bold uppercase">{msg.badge}</span>
              )}
              <Link href={`/profile/${msg.uid}`} className="text-[11px] text-gray-400 hover:text-orange-400 font-medium">
                {msg.displayName} {msg.isVerified && <span className="text-blue-400">✓</span>}
              </Link>
            </div>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.uid === user?.uid ? "bg-orange-600 text-white rounded-tr-none" : "bg-gray-800 text-gray-200 rounded-tl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-gray-900 flex gap-2">
        <input 
          type="text" 
          className="flex-1 bg-black border border-gray-700 p-3 rounded-xl text-sm text-white outline-none focus:border-orange-500" 
          placeholder="메시지를 입력하세요..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!user}
        />
        <button className="bg-orange-600 px-4 py-2 rounded-xl font-bold text-sm text-white">전송</button>
      </form>
    </div>
  )
}