"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, where } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function ChatRoom({ room = "mapleland_trade" }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. 유저 상태 확인
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid))
        if (snap.exists()) setUserData(snap.data())
      }
    })
    return () => unsubAuth()
  }, [])

  // 2. 실시간 채팅 불러오기 (데이터가 안 보일 때 이 부분을 확인하세요)
  useEffect(() => {
    // 💡 팁: 'createdAt'이 아직 서버에 생성되지 않은 찰나의 에러를 방지합니다.
    const q = query(
      collection(db, "chats"),
      where("room", "==", room),
      orderBy("createdAt", "asc")
    )

    const unsubChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data()
        // 시간 표시 로직 (값이 없을 경우 대비)
        const timeStr = data.createdAt ? data.createdAt.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : "방금 전"
        return { id: doc.id, ...data, time: timeStr }
      })
      setMessages(msgs)
      // 메시지 수신 시 스크롤 하단 이동
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    })

    return () => unsubChat()
  }, [room])

  // 3. 메시지 전송 (비회원 가능)
  const sendMessage = async (type = "일반") => {
    if (!newMessage.trim() && type === "일반") return

    const textValue = newMessage
    setNewMessage("") // ⚡ 딜레이 제거를 위해 즉시 비우기 [cite: 2026-03-02]

    try {
      await addDoc(collection(db, "chats"), {
        text: textValue,
        createdAt: serverTimestamp(),
        uid: user?.uid || "guest_user", // 비회원 기본 ID [cite: 2026-03-02]
        room: room, 
        displayName: userData?.nickname || (user ? user.email.split('@')[0] : "즐거운 모험가"),
        msgType: type // 삽니다, 팝니다 구분 [cite: 2026-03-02]
      })
    } catch (error) {
      console.error("전송 에러:", error)
    }
  }

  return (
    <div className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[30px] overflow-hidden shadow-xl">
      {/* 헤더 */}
      <div className="bg-[#FFF4E6] p-4 border-b-4 border-[#FFD8A8] flex justify-between items-center">
        <h2 className="font-black text-[#E67E22] flex items-center gap-2">🍁 실시간 거래 광장</h2>
        <span className="text-[10px] font-bold text-[#A64D13] bg-white px-3 py-1 rounded-full border border-[#FFD8A8]">비회원 채팅 가능</span>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-extrabold text-[#A64D13]">{msg.displayName}</span>
              <span className="text-[9px] text-[#FFB347] font-bold">{msg.time}</span>
            </div>
            <div className={`p-3 rounded-2xl text-sm font-bold border-2 shadow-sm ${
              msg.msgType === "삽니다" ? "border-green-300 bg-green-50 text-green-700" :
              msg.msgType === "팝니다" ? "border-orange-300 bg-orange-50 text-orange-700" :
              "border-[#FFD8A8] bg-white text-[#5D4037]"
            }`}>
              {msg.msgType !== "일반" && <span className="mr-1">[{msg.msgType}]</span>}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 버튼 및 입력창 */}
      <div className="p-5 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] space-y-4">
        <div className="flex gap-3">
          <button onClick={() => sendMessage("삽니다")} className="flex-1 bg-[#2ECC71] text-white py-3 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all">
            [삽니다] 초록색
          </button>
          <button onClick={() => sendMessage("팝니다")} className="flex-1 bg-[#E67E22] text-white py-3 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all">
            [팝니다] 주황색
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 p-4 rounded-2xl border-2 border-[#FFD8A8] text-sm font-bold outline-none focus:border-[#E67E22]" 
            placeholder="거래 내용을 입력해주세요!" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage("일반")}
          />
        </div>
      </div>
    </div>
  )
}