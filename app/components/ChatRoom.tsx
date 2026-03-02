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

  const left = Math.min(anchorPos.x, window.innerWidth - 230)
  const top = Math.min(anchorPos.y, window.innerHeight - 220)

  const Badge = ({ ok, label }: { ok?: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 font-bold text-xs ${
      ok ? "bg-green-50 text-green-700 border-green-300" : "bg-gray-50 text-gray-400 border-gray-200"
    }`}>
      <span className="text-base">{ok ? "✅" : "❌"}</span>
      {label} {ok ? "인증완료" : "미인증"}
    </div>
  )

  return (
    <div ref={popupRef}
      style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-56 bg-white border-2 border-[#FFD8A8] rounded-2xl shadow-2xl p-4 animate-in fade-in duration-150">
      
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-3">
        <span className="font-black text-[#A64D13] text-sm">👤 유저 정보</span>
        <button onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-bold transition-colors">
          ✕
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isGuest ? (
        /* 비회원 */
        <div className="text-center py-2">
          <div className="text-3xl mb-2">👤</div>
          <p className="font-black text-sm text-[#5D4037]">{displayName}</p>
          <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full inline-block">
            <span className="text-xs text-gray-500 font-bold">비회원 유저</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">인증 정보가 없어요</p>
        </div>
      ) : profile ? (
        /* 회원 */
        <div>
          <div className="text-center mb-3 pb-3 border-b border-[#FFE8CC]">
            <div className="text-3xl mb-1">🍁</div>
            <p className="font-black text-sm text-[#5D4037]">{profile.nickname || displayName}</p>
            {profile.server && (
              <span className="text-[11px] text-[#E67E22] font-bold bg-[#FFF4E6] px-2 py-0.5 rounded-full mt-1 inline-block">
                🗺 {profile.server} 서버
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Badge ok={profile.emailVerified} label="이메일" />
            <Badge ok={profile.phoneVerified} label="전화번호" />
            <Badge ok={profile.handsVerified} label="손 인증" />
          </div>
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 py-3">정보를 찾을 수 없어요</p>
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
  const top = Math.min(pos.y, window.innerHeight - 110)

  // 본인 메시지엔 메뉴 표시 안 함
  if (targetMsg.uid === currentUid) return null

  return (
    <div ref={menuRef}
      style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-44 bg-white border-2 border-[#FFD8A8] rounded-xl shadow-2xl overflow-hidden">
      <button
        onClick={() => { onViewProfile(); onClose() }}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] transition-colors flex items-center gap-2">
        🔍 정보 보기
      </button>
      <button
        onClick={() => { onStartDM(); onClose() }}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] transition-colors border-t border-[#FFD8A8] flex items-center gap-2">
        💬 1:1 대화하기
      </button>
    </div>
  )
}

// ── 메인 ChatRoom ────────────────────────────────────────
export default function ChatRoom({ room = "main_trade" }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendType, setSendType] = useState<"일반" | "삽니다" | "팝니다">("일반")
  const [user, setUser] = useState<any>(null)
  const [guestName, setGuestName] = useState("")
  const [profilePopup, setProfilePopup] = useState<{
    uid: string; displayName: string; isGuest: boolean; pos: { x: number; y: number }
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    msg: Message; pos: { x: number; y: number }
  } | null>(null)
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
    const q = query(
      collection(db, "chats"),
      where("room", "==", room),
      orderBy("createdAt", "asc"),
      limit(100)
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((d) => {
        const data = d.data()
        const date = data.createdAt?.toDate() || new Date(data.clientTime)
        return {
          id: d.id, ...data,
          time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        } as Message
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

  const handleNameClick = (e: React.MouseEvent, msg: Message) => {
    e.stopPropagation()
    if (msg.uid === user?.uid) return // 본인은 팝업 없음
    setContextMenu(null)
    setProfilePopup({ uid: msg.uid, displayName: msg.displayName, isGuest: msg.isGuest, pos: { x: e.clientX, y: e.clientY } })
  }

  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    if (msg.uid === user?.uid) return // 본인은 메뉴 없음
    setProfilePopup(null)
    setContextMenu({ msg, pos: { x: e.clientX, y: e.clientY } })
  }

  const handleStartDM = (targetMsg: Message) => {
    // 누구나 1:1 대화 가능 - 추후 DM 채팅방 연결
    alert(`${targetMsg.displayName}님과 1:1 대화 기능 연결 예정!`)
    // TODO: router.push(`/chat/dm?target=${targetMsg.uid}`) 등으로 연결
  }

  const typeStyle = {
    일반: "bg-[#FFF4E6] text-[#A64D13] border-[#FFD8A8]",
    삽니다: "bg-blue-50 text-blue-700 border-blue-300",
    팝니다: "bg-orange-50 text-orange-700 border-orange-300",
  }

  return (
    <div
      className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-xl"
      onClick={() => { setProfilePopup(null); setContextMenu(null) }}
    >
      {/* 상단 타이틀 - 필터탭 제거, 심플하게 */}
      <div className="bg-[#FFF4E6] border-b-4 border-[#FFD8A8] px-5 py-3 flex items-center gap-2">
        <span className="text-lg">🍁</span>
        <span className="font-black text-[#A64D13] text-sm">메이플랜드 거래 채팅</span>
        <span className="ml-auto text-[11px] text-[#FFB347] font-bold">{messages.length}개의 메시지</span>
      </div>

      {/* 채팅 목록 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFEFA]">
        {messages.length === 0 && (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">아직 메시지가 없어요!</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id}
            className={`flex flex-col ${msg.uid === user?.uid ? "items-end" : "items-start"}`}
            onContextMenu={(e) => handleContextMenu(e, msg)}>
            
            {/* 닉네임 + 시간 */}
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#A64D13]">
              <span
                className={`select-none ${msg.uid !== user?.uid ? "cursor-pointer hover:underline" : ""}`}
                onClick={(e) => handleNameClick(e, msg)}>
                {msg.isGuest ? `👤 ${msg.displayName}` : `🍁 ${msg.displayName}`}
              </span>
              <span className="text-[#FFB347] font-normal">{msg.time}</span>
            </div>

            {/* 메시지 버블 */}
            <div className={`p-3.5 rounded-2xl text-sm font-bold border-2 max-w-[80%] ${
              msg.msgType === "삽니다" ? "border-blue-300 bg-blue-50 text-blue-700" :
              msg.msgType === "팝니다" ? "border-orange-300 bg-orange-50 text-orange-700" :
              "border-[#FFD8A8] bg-white text-[#5D4037]"
            }`}>
              {msg.msgType !== "일반" && (
                <span className={`mr-1.5 px-1.5 py-0.5 rounded-md text-xs font-black ${
                  msg.msgType === "삽니다" ? "bg-blue-200 text-blue-800" : "bg-orange-200 text-orange-800"
                }`}>
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

        {/* 비회원 닉네임 입력 */}
        {!user && (
          <input
            className="w-full p-2.5 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white"
            placeholder="닉네임을 입력하세요 (비회원)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={20} />
        )}

        {/* 회원 표시 */}
        {user && (
          <div className="text-xs font-bold text-[#A64D13] px-1">
            🍁 {user.displayName || user.email.split("@")[0]} 으로 채팅 중
          </div>
        )}

        <div className="flex gap-2 items-center">
          {/* 타입 드롭박스 */}
          <select
            value={sendType}
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
          onViewProfile={() => {
            setProfilePopup({
              uid: contextMenu.msg.uid,
              displayName: contextMenu.msg.displayName,
              isGuest: contextMenu.msg.isGuest,
              pos: contextMenu.pos
            })
          }}
          onStartDM={() => handleStartDM(contextMenu.msg)} />
      )}
    </div>
  )
}