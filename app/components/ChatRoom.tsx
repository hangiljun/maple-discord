"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, limit } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function ChatRoom({ room = "main_trade" }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [category, setCategory] = useState("전체") // ✨ 삽니다/팝니다 카테고리 상태 [cite: 2026-03-02]
  const [user, setUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));

    // 🔄 실시간 리스너 최적화 [cite: 2026-03-02]
    const q = query(
      collection(db, "chats"), 
      where("room", "==", room), 
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) || "방금 전"
      }));
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [room]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textValue = newMessage;
    const currentMsgType = category === "전체" ? "일반" : category;

    setNewMessage(""); // ⚡ 즉시 비우기 (딜레이 해결) [cite: 2026-03-02]

    try {
      await addDoc(collection(db, "chats"), {
        text: textValue,
        createdAt: serverTimestamp(),
        uid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        room: room,
        displayName: user ? user.email.split('@')[0] : "즐거운 모험가",
        msgType: currentMsgType // ✨ 선택된 카테고리로 저장 [cite: 2026-03-02]
      });
    } catch (err) {
      console.error("전송 에러:", err);
    }
  };

  // ✨ 카테고리 필터링 (전체일 땐 다 보여주고, 클릭 시 해당 카테고리만) [cite: 2026-03-02]
  const filteredMessages = category === "전체" 
    ? messages 
    : messages.filter(m => m.msgType === category || m.msgType === "일반");

  return (
    <div className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-xl">
      {/* ✨ 카테고리 탭 메뉴 [cite: 2026-03-02] */}
      <div className="flex bg-[#FFF4E6] border-b-4 border-[#FFD8A8]">
        {["전체", "삽니다", "팝니다"].map((tab) => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            className={`flex-1 py-4 font-black text-sm transition-all ${
              category === tab ? "bg-[#E67E22] text-white" : "text-[#A64D13] hover:bg-[#FFE8CC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {filteredMessages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#A64D13]">
              {msg.displayName} <span className="text-[#FFB347] font-normal">{msg.time}</span>
            </div>
            <div className={`p-3.5 rounded-2xl text-sm font-bold border-2 ${
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

      {/* 입력 섹션 */}
      <form onSubmit={sendMessage} className="p-5 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] flex gap-2">
        <input 
          className="flex-1 p-4 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22]" 
          placeholder={`[${category}] 내용을 입력해 보세요!`} 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="bg-[#E67E22] text-white px-8 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-transform">
          전송
        </button>
      </form>
    </div>
  )
}