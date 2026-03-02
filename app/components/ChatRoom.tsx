"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, where, limit } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Link from "next/link"

interface ChatRoomProps { room?: string; }

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
    return () => unsubAuth()
  }, [])

  // 🔄 실시간 채팅 동기화 (타인 글 안 보임 해결)
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("room", "==", room),
      orderBy("createdAt", "asc")
    )

    const unsubChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        // 시간 포맷팅 (오후 12:30 형식)
        const date = data.createdAt?.toDate();
        const timeString = date ? date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true }) : "";
        return { id: doc.id, ...data, timeString };
      });
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });

    return () => unsubChat()
  }, [room])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user) return

    const textToSend = newMessage;
    setNewMessage(""); // ⚡ 전송 즉시 비우기 (딜레이 제거)

    await addDoc(collection(db, "chats"), {
      text: textToSend,
      createdAt: serverTimestamp(),
      uid: user.uid,
      room: room,
      displayName: userData?.nickname || user.email?.split('@')[0],
      isVerified: userData?.verified || false,
      badge: userData?.badge || "B"
    });
  }

  return (
    <div className="flex flex-col h-[75vh] bg-white border-4 border-[#FFD8A8] rounded-[40px] overflow-hidden shadow-[0_10px_25px_rgba(255,216,168,0.3)]">
      {/* 파스텔 헤더 */}
      <div className="bg-[#FFF4E6] p-5 border-b-4 border-[#FFD8A8] flex justify-between items-center">
        <h2 className="font-black text-[#E67E22] text-xl flex items-center gap-2">
          <span className="animate-bounce">🍁</span> {room === "mapleland_trade" ? "메이플랜드 공식 거래 광장" : "통합 채팅"}
        </h2>
        <div className="px-4 py-1 bg-white rounded-full border-2 border-[#FFD8A8] text-[#E67E22] text-xs font-bold">
          실시간 접속 중
        </div>
      </div>

      {/* 채팅 메인 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FFFEFA]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-2 mb-1">
              {msg.isVerified && (
                <span className="bg-[#E67E22] text-white text-[10px] px-2 py-0.5 rounded-lg font-black shadow-sm">
                  {msg.badge}
                </span>
              )}
              <Link href={`/profile/${msg.uid}`} className="text-xs font-bold text-[#A64D13] hover:underline">
                {msg.displayName}
              </Link>
            </div>
            
            <div className="flex items-end gap-2 max-w-[90%]">
              {msg.uid === user?.uid && <span className="text-[10px] text-[#FFB347] mb-1 font-bold">{msg.timeString}</span>}
              <div className={`p-4 rounded-[25px] text-sm font-medium shadow-sm border-2 ${
                msg.uid === user?.uid 
                ? "bg-[#FFE8CC] text-[#A64D13] rounded-tr-none border-[#FFD8A8]" 
                : "bg-white text-[#5D4037] rounded-tl-none border-[#FEE2E2]"
              }`}>
                {msg.text}
              </div>
              {msg.uid !== user?.uid && <span className="text-[10px] text-[#FFB347] mb-1 font-bold">{msg.timeString}</span>}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 하단 입력창 */}
      <form onSubmit={sendMessage} className="p-5 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] flex gap-3">
        <input 
          type="text" 
          className="flex-1 bg-white border-3 border-[#FFD8A8] p-4 rounded-full text-sm font-bold text-[#A64D13] outline-none focus:border-[#E67E22] transition-all placeholder-[#FFD8A8]" 
          placeholder="거래하실 내용을 입력해주세요! (예: 공노목 10 구매합니다)"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!user}
        />
        <button className="bg-[#E67E22] hover:bg-[#D35400] px-8 rounded-full font-black text-white shadow-lg transition-transform active:scale-95">
          전송
        </button>
      </form>
    </div>
  )
}