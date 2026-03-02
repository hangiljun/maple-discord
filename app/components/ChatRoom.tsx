"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, limit, doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

// ─── 미니 프로필 팝업 ─────────────────────────────────────────────────
function UserProfilePopup({ uid, displayName, onClose }: { uid: string; displayName: string; onClose: () => void }) {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (!uid || uid.startsWith("guest_")) {
      setProfile({ displayName, isGuest: true })
      return
    }
    getDoc(doc(db, "users", uid)).then((snap) => {
      if (snap.exists()) setProfile({ ...snap.data(), isGuest: false })
      else setProfile({ displayName, isGuest: true })
    })
  }, [uid, displayName])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl border-4 border-[#FFD8A8] shadow-2xl p-6 w-72 relative animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-red-400 font-black text-lg transition-colors">✕</button>
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-[#FFF4E6] border-2 border-[#FFD8A8] flex items-center justify-center text-3xl shadow-inner">🍁</div>
          <div className="text-center">
            <p className="font-black text-[#E67E22] text-lg">{profile?.nickname || displayName}</p>
            <div className="flex gap-1 justify-center mt-1">
              {profile?.verified && <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-200">✓ 인증 유저</span>}
              {profile?.isGuest && <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full border border-gray-200">비회원</span>}
            </div>
          </div>
          {!profile?.isGuest && (
            <div className="w-full bg-[#FFF4E6] rounded-2xl p-4 space-y-2 text-sm border border-[#FFE8CC]">
              <div className="flex justify-between items-center">
                <span className="text-[#A64D13] font-bold text-xs">가입일</span>
                <span className="font-bold text-[#5D4037]">{profile?.createdAt?.seconds ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString("ko-KR") : "기록 없음"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A64D13] font-bold text-xs">거래 횟수</span>
                <span className="font-bold text-[#5D4037]">{profile?.tradeCount ?? 0}회</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#A64D13] font-bold text-xs">신뢰도</span>
                <span className="font-bold text-green-600">{profile?.trustScore ?? "NEW"}</span>
              </div>
            </div>
          )}
          {profile?.isGuest && <p className="text-xs text-gray-400 mt-2 font-medium">비회원은 인증 정보가 제공되지 않습니다.</p>}
        </div>
      </div>
    </div>
  )
}

// ─── 우클릭 컨텍스트 메뉴 ─────────────────────────────────────────────
function ContextMenu({ x, y, onProfile, onPrivateChat, onClose }: {
  x: number; y: number; onProfile: () => void; onPrivateChat: () => void; onClose: () => void
}) {
  useEffect(() => {
    const handleOutsideClick = () => onClose();
    window.addEventListener("click", handleOutsideClick);
    window.addEventListener("contextmenu", handleOutsideClick); // 다른 곳 우클릭 시에도 닫기
    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("contextmenu", handleOutsideClick);
    }
  }, [onClose])

  return (
    <div className="fixed z-[70] bg-white border-2 border-[#FFD8A8] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150" 
         style={{ top: y, left: x, minWidth: 160 }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => { onPrivateChat(); onClose() }} className="w-full px-4 py-3 text-left text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] flex items-center gap-2 transition-colors">
        💬 1:1 대화하기
      </button>
      <div className="border-t border-[#FFF4E6]" />
      <button onClick={() => { onProfile(); onClose() }} className="w-full px-4 py-3 text-left text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] flex items-center gap-2 transition-colors">
        👤 정보 보기
      </button>
    </div>
  )
}

// ─── 메인 ChatRoom ────────────────────────────────────────────────────
export default function ChatRoom({ room = "main_trade" }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [msgType, setMsgType] = useState<"삽니다" | "팝니다">("삽니다")
  const [filterType, setFilterType] = useState<"전체" | "삽니다" | "팝니다">("전체")
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [guestName, setGuestName] = useState("")
  const [profileTarget, setProfileTarget] = useState<{ uid: string; displayName: string } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; uid: string; displayName: string } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid))
        if (snap.exists()) setUserData(snap.data())
      } else {
        setUserData(null)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "chats"), where("room", "==", room), orderBy("createdAt", "asc"), limit(100))
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        const date = data.createdAt?.toDate() || new Date(data.clientTime)
        return { 
          id: docSnap.id, 
          ...data, 
          time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) 
        }
      })
      setMessages(msgs)
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }, (err) => console.error("Firestore 에러:", err))
    return () => unsub()
  }, [room])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    
    // 비회원일 때 닉네임 검증
    if (!user && !guestName.trim()) {
      alert("비회원은 닉네임을 입력해야 합니다.");
      return;
    }

    const senderName = user ? (userData?.nickname || user.email.split("@")[0]) : (guestName.trim() || "익명 모험가")
    const text = newMessage
    setNewMessage("")

    try {
      await addDoc(collection(db, "chats"), {
        text, 
        createdAt: serverTimestamp(), 
        clientTime: Date.now(),
        uid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        room, 
        displayName: senderName, 
        msgType, 
        isGuest: !user, 
        verified: userData?.verified || false,
      })
    } catch (err) { 
      console.error("전송 실패:", err) 
    }
  }

  const filtered = filterType === "전체" ? messages : messages.filter((m) => m.msgType === filterType)

  const handleRightClick = (e: React.MouseEvent, msg: any) => {
    if (msg.uid === user?.uid) return
    e.preventDefault()
    // 뷰포트 경계 체크 로직 (선택사항)
    setContextMenu({ x: e.clientX, y: e.clientY, uid: msg.uid, displayName: msg.displayName })
  }

  return (
    <>
      {profileTarget && <UserProfilePopup uid={profileTarget.uid} displayName={profileTarget.displayName} onClose={() => setProfileTarget(null)} />}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y}
          onProfile={() => setProfileTarget({ uid: contextMenu.uid, displayName: contextMenu.displayName })}
          onPrivateChat={() => alert(`${contextMenu.displayName}님과의 1:1 대화 기능은 현재 개발 중입니다!`)}
          onClose={() => setContextMenu(null)}
        />
      )}

      <div className="flex flex-col h-[700px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-2xl transition-all">
        {/* 필터 탭 - 시인성 강화 */}
        <div className="flex bg-[#FFF4E6] border-b-4 border-[#FFD8A8]">
          {(["전체", "삽니다", "팝니다"] as const).map((tab) => (
            <button key={tab} onClick={() => setFilterType(tab)}
              className={`flex-1 py-4 font-black text-sm transition-all relative ${
                filterType === tab
                  ? tab === "삽니다" ? "bg-green-500 text-white" : tab === "팝니다" ? "bg-orange-500 text-white" : "bg-[#E67E22] text-white"
                  : "text-[#A64D13] hover:bg-[#FFE8CC]"
              }`}>
              {tab === "삽니다" ? "🟢 삽니다" : tab === "팝니다" ? "🟠 팝니다" : "📋 전체보기"}
              {filterType === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10" />}
            </button>
          ))}
        </div>

        {/* 채팅 목록 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[#FFD8A8] gap-2">
              <span className="text-4xl">💬</span>
              <p className="font-bold">아직 대화가 없습니다.</p>
            </div>
          )}
          {filtered.map((msg) => {
            const isMe = msg.uid === user?.uid
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group`} onContextMenu={(e) => handleRightClick(e, msg)}>
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-black text-[#A64D13]">
                  <span
                    className={`${!isMe ? "cursor-pointer hover:text-[#E67E22] transition-colors" : ""}`}
                    onClick={() => !isMe && setProfileTarget({ uid: msg.uid, displayName: msg.displayName })}
                  >
                    {msg.displayName}
                    {msg.isGuest && <span className="ml-1 text-gray-400 font-bold text-[9px] underline decoration-dotted">(비회원)</span>}
                    {msg.verified && <span className="ml-1 text-blue-500" title="인증된 유저">✓</span>}
                  </span>
                  <span className="text-[#FFB347] font-medium text-[9px]">{msg.time}</span>
                </div>
                <div className={`p-3.5 rounded-2xl text-sm font-bold border-2 max-w-[85%] shadow-sm relative ${
                  msg.msgType === "삽니다" ? "border-green-200 bg-green-50 text-green-900" : "border-orange-200 bg-orange-50 text-orange-900"
                }`}>
                  <span className={`inline-block mr-2 text-[10px] px-2 py-0.5 rounded-full font-black vertical-middle ${
                    msg.msgType === "삽니다" ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  }`}>
                    {msg.msgType === "삽니다" ? "구매" : "판매"}
                  </span>
                  <span className="align-middle">{msg.text}</span>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* 입력 섹션 */}
        <form onSubmit={sendMessage} className="p-4 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] space-y-3 shadow-inner">
          {!user && (
            <div className="relative">
              <input 
                className="w-full p-3 pl-10 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white transition-all shadow-sm"
                placeholder="비회원용 닉네임 설정 (최대 10자)" 
                value={guestName} 
                onChange={(e) => setGuestName(e.target.value)} 
                maxLength={10} 
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-2 text-xs font-black text-[#E67E22] px-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {userData?.nickname || user.email.split("@")[0]} 님 접속 중
            </div>
          )}
          <div className="flex gap-2">
            <select 
              value={msgType} 
              onChange={(e) => setMsgType(e.target.value as "삽니다" | "팝니다")}
              className={`px-3 py-3 rounded-2xl border-2 font-black text-sm outline-none cursor-pointer transition-all shadow-sm ${
                msgType === "삽니다" ? "border-green-400 bg-white text-green-600 focus:ring-2 ring-green-200" : "border-orange-400 bg-white text-orange-600 focus:ring-2 ring-orange-200"
              }`}
            >
              <option value="삽니다">🟢 구매</option>
              <option value="팝니다">🟠 판매</option>
            </select>
            <input 
              className="flex-1 p-3 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white transition-all shadow-sm"
              placeholder="거래할 아이템과 가격을 적어주세요!" 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)} 
            />
            <button 
              type="submit" 
              className="bg-[#E67E22] hover:bg-[#D35400] text-white px-8 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-all"
            >
              전송
            </button>
          </div>
        </form>
      </div>
    </>
  )
}