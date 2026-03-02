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

  useEffect(() => {
    onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) setUserData(snap.data());
      }
    });

    const q = query(collection(db, "chats"), where("room", "==", room), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
        time: doc.data().createdAt?.toDate().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
  }, [room]);

  const sendMessage = async (type = "일반") => {
    if (!newMessage.trim() && type === "일반") return;

    // ✨ 전송 즉시 비우기 (딜레이 해결)
    const textToSend = newMessage;
    setNewMessage("");

    await addDoc(collection(db, "chats"), {
      text: textToSend,
      createdAt: serverTimestamp(),
      uid: user?.uid || "guest",
      room,
      displayName: userData?.nickname || (user ? user.email.split('@')[0] : "즐거운 모험가"),
      isVerified: userData?.verified || false,
      badge: userData?.badge || (user ? "B" : "G"),
      msgType: type 
    });
  };

  return (
    <div className="flex flex-col h-[700px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-xl">
      <div className="bg-[#FFF4E6] p-4 border-b-4 border-[#FFD8A8] flex justify-between items-center">
        <h2 className="font-black text-[#E67E22] flex items-center gap-2">🍁 실시간 거래 광장</h2>
        <span className="text-[10px] font-bold text-[#A64D13] bg-white px-3 py-1 rounded-full border border-[#FFD8A8]">비회원 채팅 가능</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-extrabold text-[#A64D13]">{msg.displayName}</span>
              <span className="text-[9px] text-[#FFB347]">{msg.time}</span>
            </div>
            <div className={`p-3.5 rounded-2xl text-sm font-bold border-2 shadow-sm ${
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

      <div className="p-5 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] space-y-4">
        {/* 삽니다/팝니다 전용 버튼 */}
        <div className="flex gap-3">
          <button onClick={() => sendMessage("삽니다")} className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60] text-white py-3 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95">
            [삽니다] 초록색 전송
          </button>
          <button onClick={() => sendMessage("팝니다")} className="flex-1 bg-[#E67E22] hover:bg-[#D35400] text-white py-3 rounded-2xl font-black text-sm shadow-md transition-all active:scale-95">
            [팝니다] 주황색 전송
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 p-4 rounded-2xl border-2 border-[#FFD8A8] text-sm font-bold outline-none focus:border-[#E67E22] transition-all" 
            placeholder="내용을 입력하고 위 버튼을 누르거나 엔터를 치세요!" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage("일반")}
          />
        </div>
      </div>
    </div>
  )
}