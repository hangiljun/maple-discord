"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, where } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function ChatRoom({ room = "main_trade" }) {
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

  const sendMessage = async (prefix = "") => {
    const text = prefix ? `[${prefix}] ${newMessage}` : newMessage;
    if (!text.trim()) return;

    const chatData = {
      text,
      createdAt: serverTimestamp(),
      uid: user?.uid || "guest",
      room,
      displayName: userData?.nickname || (user ? user.email.split('@')[0] : "즐거운 손님"),
      isVerified: userData?.verified || false,
      badge: userData?.badge || (user ? "B" : "G"),
      type: prefix // 삽니다/팝니다 구분
    };

    setNewMessage("");
    await addDoc(collection(db, "chats"), chatData);
  };

  return (
    <div className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[30px] overflow-hidden shadow-lg">
      <div className="bg-[#FFF4E6] p-4 border-b-4 border-[#FFD8A8] flex justify-between items-center">
        <h2 className="font-black text-[#E67E22]">🍁 실시간 거래 광장</h2>
        <span className="text-[10px] font-bold text-[#A64D13] bg-white px-3 py-1 rounded-full border border-[#FFD8A8]">비회원 채팅 가능</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-[10px] font-bold text-[#A64D13]">{msg.displayName}</span>
              <span className="text-[9px] text-gray-400">{msg.time}</span>
            </div>
            <div className={`p-3 rounded-2xl text-sm font-bold border-2 shadow-sm ${
              msg.type === "삽니다" ? "border-green-200 bg-green-50 text-green-700" :
              msg.type === "팝니다" ? "border-orange-200 bg-orange-50 text-orange-700" :
              "border-[#FFD8A8] bg-white text-[#5D4037]"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] space-y-3">
        <div className="flex gap-2">
          <button onClick={() => sendMessage("삽니다")} className="flex-1 bg-green-500 text-white py-2 rounded-xl font-black text-xs shadow-md">삽니다 [Green]</button>
          <button onClick={() => sendMessage("팝니다")} className="flex-1 bg-[#E67E22] text-white py-2 rounded-xl font-black text-xs shadow-md">팝니다 [Orange]</button>
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 p-3 rounded-full border-2 border-[#FFD8A8] text-sm outline-none font-bold" 
            placeholder="메시지를 입력하세요..." 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={() => sendMessage()} className="bg-[#A64D13] text-white px-6 rounded-full font-bold text-xs">전송</button>
        </div>
      </div>
    </div>
  )
}