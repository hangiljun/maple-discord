"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, limit } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function ChatRoom({ room = "main_trade" }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [category, setCategory] = useState("전체")
  const [user, setUser] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => setUser(currentUser));

    // 🔄 1. 복합 인덱스(room + createdAt)가 필요한 쿼리
    const q = query(
      collection(db, "chats"), 
      where("room", "==", room), 
      orderBy("createdAt", "asc"),
      limit(100)
    );

    // 🔄 2. 에러 핸들러가 추가된 실시간 리스너
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        // 🕒 serverTimestamp() 지연 해결: createdAt이 없으면 clientTime 사용
        const date = data.createdAt?.toDate() || new Date(data.clientTime);
        const timeStr = date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        return {
          id: doc.id, 
          ...data,
          time: timeStr
        };
      });
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }, (error) => {
      // ⚠️ 여기서 인덱스 생성 링크가 콘솔에 뜹니다. 반드시 확인 후 클릭하세요!
      console.error("Firestore 에러 발생:", error);
      if (error.message.includes("index")) {
        console.warn("⚠️ 인덱스 생성이 필요합니다. 위 에러 메시지의 링크를 클릭하세요.");
      }
    });

    return () => unsub();
  }, [room]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textValue = newMessage;
    const currentMsgType = category === "전체" ? "일반" : category;

    setNewMessage(""); // 즉시 비우기 (딜레이 제거)

    try {
      // 🚀 3. 즉시 표시용 clientTime을 포함하여 전송
      await addDoc(collection(db, "chats"), {
        text: textValue,
        createdAt: serverTimestamp(), // 서버 정렬용
        clientTime: Date.now(),      // 즉시 표시용 (서버 확정 전 대용)
        uid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        room: room,
        displayName: user ? user.email.split('@')[0] : "즐거운 모험가",
        msgType: currentMsgType
      });
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    }
  };

  const filteredMessages = category === "전체" 
    ? messages 
    : messages.filter(m => m.msgType === category || m.msgType === "일반");

  return (
    <div className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-xl">
      {/* 카테고리 탭 메뉴 */}
      <div className="flex bg-[#FFF4E6] border-b-4 border-[#FFD8A8]">
        {["전체", "삽니다", "팝니다"].map((tab) => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            className={`flex-1 py-4 font-black text-sm transition-all ${
              category === tab ? "bg-[#E67E22] text-white shadow-inner" : "text-[#A64D13] hover:bg-[#FFE8CC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 채팅 목록 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {messages.length === 0 && (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">
            메시지가 없거나 인덱스 설정 중입니다...
          </div>
        )}
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

      {/* 입력창 */}
      <form onSubmit={sendMessage} className="p-5 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] flex gap-2">
        <input 
          className="flex-1 p-4 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22]" 
          placeholder={`[${category}] 거래 내용을 입력하세요!`} 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="bg-[#E67E22] text-white px-8 rounded-2xl font-black text-sm shadow-md active:scale-95">
          전송
        </button>
      </form>
    </div>
  )
}