"use client"
import { useState, useEffect, useRef } from "react"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, where, limit, doc, getDoc
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

// ── 타입 정의 ──────────────────────────────────────────
interface Message {
  id: string
  text: string
  msgType: "일반" | "삽니다" | "팝니다"
  createdAt?: any
  clientTime?: number
  time: string
  uid: string
  displayName: string
  isGuest: boolean
  room: string
}

interface UserProfile {
  nickname?: string
  server?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  handsVerified?: boolean
}

// ── 미니 프로필 팝업 ────────────────────────────────────
function ProfilePopup({ uid, displayName, isGuest, anchorPos, onClose }: {
  uid: string; displayName: string; isGuest: boolean
  anchorPos: { x: number; y: number }; onClose: () => void
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  useEffect(() => {
    if (isGuest) { setLoading(false); return }
    getDoc(doc(db, "users", uid))
      .then(snap => { if (snap.exists()) setProfile(snap.data() as UserProfile) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [uid, isGuest])

  const left = Math.min(anchorPos.x, window.innerWidth - 220)
  const top = Math.min(anchorPos.y, window.innerHeight - 200)

  const Badge = ({ ok, label }: { ok?: boolean; label: string }) => (
    <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${ok ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
      {ok ? "✓" : "✗"} {label}
    </span>
  )

  return (
    <div ref={popupRef} style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-52 bg-white border-2 border-[#FFD8A8] rounded-2xl shadow-2xl p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-black text-[#A64D13] text-sm">유저 정보</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
      </div>
      {loading ? (
        <p className="text-xs text-center text-gray-400 py-2">로딩 중...</p>
      ) : isGuest ? (
        <div className="text-center">
          <div className="text-2xl mb-1">👤</div>
          <p className="font-bold text-sm text-[#5D4037]">{displayName}</p>
          <p className="text-xs text-gray-400 mt-1">비회원 유저</p>
        </div>
      ) : profile ? (
        <div>
          <div className="text-center mb-3">
            <div className="text-2xl mb-1">🍁</div>
            <p className="font-black text-sm text-[#5D4037]">{profile.nickname || displayName}</p>
            {profile.server && <p className="text-xs text-[#E67E22] mt-0.5">🗺 {profile.server} 서버</p>}
          </div>
          <div className="flex flex-wrap gap-1 justify-center">
            <Badge ok={profile.emailVerified} label="이메일" />
            <Badge ok={profile.phoneVerified} label="전화번호" />
            <Badge ok={profile.handsVerified} label="손인증" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 py-2">정보를 찾을 수 없어요</p>
      )}
    </div>
  )
}

// ── 우클릭 컨텍스트 메뉴 ────────────────────────────────
function ContextMenu({ pos, targetMsg, currentUid, onClose, onViewProfile, onStartDM }: {
  pos: { x: number; y: number }; targetMsg: Message; currentUid: string | null
  onClose: () => void; onViewProfile: () => void; onStartDM: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  const left = Math.min(pos.x, window.innerWidth - 160)
  const top = Math.min(pos.y, window.innerHeight - 100)

  return (
    <div ref={menuRef} style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-40 bg-white border-2 border-[#FFD8A8] rounded-xl shadow-2xl overflow-hidden">
      <button onClick={() => { onViewProfile(); onClose() }}
        className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] transition-colors">
        🔍 정보 보기
      </button>
      {!targetMsg.isGuest && targetMsg.uid !== currentUid && (
        <button onClick={() => { onStartDM(); onClose() }}
          className="w-full text-left px-4 py-2.5 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] transition-colors border-t border-[#FFD8A8]">
          💬 1:1 대화하기
        </button>
      )}
    </div>
  )
}

// ── 메인 ChatRoom ────────────────────────────────────────
export default function ChatRoom({ room = "main_trade" }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [filterCategory, setFilterCategory] = useState("전체")
  const [sendType, setSendType] = useState<"일반" | "삽니다" | "팝니다">("일반")
  const [user, setUser] = useState<any>(null)
  const [guestName, setGuestName] = useState("")
  const [profilePopup, setProfilePopup] = useState<{ uid: string; displayName: string; isGuest: boolean; pos: { x: number; y: number } } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ msg: Message; pos: { x: number; y: number } } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("maple_guest_name")
    if (saved) setGuestName(saved)
  }, [])

  useEffect(() => {
    const q = query(collection(db, "chats"), where("room", "==", room), orderBy("createdAt", "asc"), limit(100))
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => {
        const data = d.data()
        const date = data.createdAt?.toDate() || new Date(data.clientTime)
        return { id: d.id, ...data, time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) } as Message
      })
      setMessages(msgs)
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    }, console.error)
    return () => unsub()
  }, [room])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    if (!user && !guestName.trim()) { alert("닉네임을 입력해주세요!"); return }
    const textValue = newMessage
    setNewMessage("")
    if (!user && guestName.trim()) localStorage.setItem("maple_guest_name", guestName.trim())
    try {
      await addDoc(collection(db, "chats"), {
        text: textValue,
        createdAt: serverTimestamp(),
        clientTime: Date.now(),
        room,
        msgType: sendType,
        isGuest: !user,
        uid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        displayName: user ? (user.displayName || user.email.split("@")[0]) : guestName.trim(),
      })
    } catch (err) { console.error("전송 실패:", err) }
  }

  const filteredMessages = filterCategory === "전체" ? messages : messages.filter((m) => m.msgType === filterCategory)

  const handleNameClick = (e: React.MouseEvent, msg: Message) => {
    e.stopPropagation()
    setContextMenu(null)
    setProfilePopup({ uid: msg.uid, displayName: msg.displayName, isGuest: msg.isGuest, pos: { x: e.clientX, y: e.clientY } })
  }

  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    setProfilePopup(null)
    setContextMenu({ msg, pos: { x: e.clientX, y: e.clientY } })
  }

  const handleStartDM = (targetMsg: Message) => {
    if (!user) { alert("1:1 대화는 회원만 가능해요!"); return }
    // TODO: DM 기능 연결
    alert(`${targetMsg.displayName}님과의 1:1 대화 준비 중!`)
  }

  const typeStyle = {
    일반: "bg-[#FFF4E6] text-[#A64D13] border-[#FFD8A8]",
    삽니다: "bg-blue-50 text-blue-700 border-blue-300",
    팝니다: "bg-orange-50 text-orange-700 border-orange-300",
  }

  return (
    <div className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-xl"
      onClick={() => { setProfilePopup(null); setContextMenu(null) }}>

      {/* 필터 탭 */}
      <div className="flex bg-[#FFF4E6] border-b-4 border-[#FFD8A8]">
        {["전체", "삽니다", "팝니다"].map((tab) => (
          <button key={tab} onClick={() => setFilterCategory(tab)}
            className={`flex-1 py-4 font-black text-sm transition-all ${filterCategory === tab ? "bg-[#E67E22] text-white shadow-inner" : "text-[#A64D13] hover:bg-[#FFE8CC]"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* 채팅 목록 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {filteredMessages.length === 0 && (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">아직 메시지가 없어요!</div>
        )}
        {filteredMessages.map((msg) => (
          <div key={msg.id}
            className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}
            onContextMenu={(e) => handleContextMenu(e, msg)}>
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#A64D13]">
              <span className="cursor-pointer hover:underline select-none"
                onClick={(e) => handleNameClick(e, msg)}>
                {msg.isGuest ? `👤 ${msg.displayName}` : `🍁 ${msg.displayName}`}
              </span>
              <span className="text-[#FFB347] font-normal">{msg.time}</span>
            </div>
            <div className={`p-3.5 rounded-2xl text-sm font-bold border-2 max-w-[80%] ${
              msg.msgType === "삽니다" ? "border-blue-300 bg-blue-50 text-blue-700" :
              msg.msgType === "팝니다" ? "border-orange-300 bg-orange-50 text-orange-700" :
              "border-[#FFD8A8] bg-white text-[#5D4037]"}`}>
              {msg.msgType !== "일반" && (
                <span className={`mr-1.5 px-1.5 py-0.5 rounded-md text-xs font-black ${
                  msg.msgType === "삽니다" ? "bg-blue-200 text-blue-800" : "bg-orange-200 text-orange-800"}`}>
                  [{msg.msgType}]
                </span>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={sendMessage}
        className="p-4 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}>

        {/* 비회원: 닉네임 입력 */}
        {!user && (
          <input
            className="w-full p-2.5 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white"
            placeholder="닉네임을 입력하세요 (비회원)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={20} />
        )}

        {/* 회원: 현재 닉네임 표시 */}
        {user && (
          <div className="text-xs font-bold text-[#A64D13] px-1">
            🍁 {user.displayName || user.email.split("@")[0]} 으로 채팅 중
          </div>
        )}

        <div className="flex gap-2 items-center">
          {/* 타입 드롭박스 */}
          <select value={sendType}
            onChange={(e) => setSendType(e.target.value as "일반" | "삽니다" | "팝니다")}
            className={`p-3 rounded-xl border-2 font-black text-sm outline-none cursor-pointer transition-colors ${typeStyle[sendType]}`}>
            <option value="일반">일반</option>
            <option value="삽니다">🔵 삽니다</option>
            <option value="팝니다">🟠 팝니다</option>
          </select>

          <input
            className="flex-1 p-3 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22]"
            placeholder="거래 내용을 입력하세요!"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)} />

          <button className="bg-[#E67E22] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md active:scale-95 whitespace-nowrap">
            전송
          </button>
        </div>
      </form>

      {/* 프로필 팝업 */}
      {profilePopup && (
        <ProfilePopup
          uid={profilePopup.uid}
          displayName={profilePopup.displayName}
          isGuest={profilePopup.isGuest}
          anchorPos={profilePopup.pos}
          onClose={() => setProfilePopup(null)} />
      )}

      {/* 우클릭 메뉴 */}
      {contextMenu && (
        <ContextMenu
          pos={contextMenu.pos}
          targetMsg={contextMenu.msg}
          currentUid={user?.uid || null}
          onClose={() => setContextMenu(null)}
          onViewProfile={() => setProfilePopup({
            uid: contextMenu.msg.uid,
            displayName: contextMenu.msg.displayName,
            isGuest: contextMenu.msg.isGuest,
            pos: contextMenu.pos
          })}
          onStartDM={() => handleStartDM(contextMenu.msg)} />
      )}
    </div>
  )
}