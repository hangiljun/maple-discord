"use client"
import { useEffect, useState, useRef } from "react"
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ChatRoom({ room }: { room: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [nickname, setNickname] = useState("")
  const [text, setText] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. 실시간 메시지 데이터 로드
  useEffect(() => {
    const q = query(collection(db, room), orderBy("createdAt", "asc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
    return () => unsubscribe()
  }, [room])

  // 2. 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  // 3. 메시지 전송 로직
  const onSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname.trim() || !text.trim()) {
      alert("닉네임과 내용을 모두 입력해주세요.")
      return
    }
    
    try {
      await addDoc(collection(db, room), { 
        nickname, 
        text, 
        createdAt: serverTimestamp() 
      })
      setText("") // 전송 후 내용창 비우기
    } catch (error) {
      console.error("Firebase 전송 에러:", error)
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-[#BACEE0] rounded-lg overflow-hidden border border-gray-400 shadow-xl">
      {/* 채팅 내역 영역 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 mt-10 text-sm">첫 메시지를 남겨보세요!</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col items-start">
            <span className="text-[11px] font-bold text-gray-700 mb-1 ml-1">{m.nickname}</span>
            <div className="flex items-end gap-1">
              <div 
                className="bg-[#FEE500] p-2 rounded-lg rounded-tl-none text-sm text-black max-w-[250px] shadow-sm cursor-pointer"
                onContextMenu={(e) => {
                  e.preventDefault();
                  if(confirm(`${m.nickname}님과 1:1 대화를 하시겠습니까?`)) alert("1:1 채팅 기능은 준비 중입니다!");
                }}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-gray-600 mb-0.5">
                {m.createdAt?.toDate() ? m.createdAt.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "..."}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* 입력 영역 (이 부분이 화면에 명확히 보여야 합니다) */}
      <form onSubmit={onSend} className="p-4 bg-white border-t border-gray-300 flex flex-col gap-2">
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="닉네임" 
            value={nickname} 
            onChange={e => setNickname(e.target.value)} 
            className="w-1/4 border border-gray-300 p-2 text-sm rounded text-black bg-gray-50 focus:border-yellow-500 outline-none" 
          />
          <input 
            type="text"
            placeholder="거래 내용을 입력하세요 (우클릭 시 1:1)" 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="flex-1 border border-gray-300 p-2 text-sm rounded text-black bg-gray-50 focus:border-yellow-500 outline-none" 
          />
          <button 
            type="submit"
            className="bg-[#FEE500] hover:bg-[#F7E600] text-black px-6 py-2 text-sm font-bold rounded shadow-sm border border-yellow-500 transition-all active:scale-95"
          >
            전송
          </button>
        </div>
        <p className="text-[10px] text-gray-400 font-medium">* 닉네임을 적고 내용을 입력한 뒤 전송을 누르세요.</p>
      </form>
    </div>
  )
}