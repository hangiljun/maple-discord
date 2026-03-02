"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, where, limit, doc, getDoc, updateDoc, arrayUnion, increment
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getOrCreateDMRoom } from "@/lib/dm"

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
  mannerScore?: number
  mannerVoters?: string[]
}

// ── 별 표시 헬퍼 ─────────────────────────────────────────
function StarBadge({ profile }: { profile: UserProfile | null }) {
  if (!profile) return null
  const count = [profile.emailVerified, profile.phoneVerified, profile.handsVerified].filter(Boolean).length
  if (count === 0) return null
  return (
    <span className="text-yellow-400 text-[10px] leading-none" title={`인증 ${count}개`}>
      {"⭐".repeat(count)}
    </span>
  )
}

// ── 프로필 캐시 ───────────────────────────────────────────
const profileCache = new Map<string, UserProfile>()

// ── 프로필 팝업 ──────────────────────────────────────────
function ProfilePopup({ uid, displayName, isGuest, anchorPos, onClose, currentUser }: {
  uid: string
  displayName: string
  isGuest: boolean
  anchorPos: { x: number; y: number }
  onClose: () => void
  currentUser: any
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(!isGuest)
  const [voteLoading, setVoteLoading] = useState(false)
  const [voteMsg, setVoteMsg] = useState("")
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isGuest) return
    if (profileCache.has(uid)) {
      setProfile(profileCache.get(uid)!)
      setLoading(false)
      return
    }
    getDoc(doc(db, "users", uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile
          profileCache.set(uid, data)
          setProfile(data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [uid, isGuest])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 100)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClick)
    }
  }, [onClose])

  const handleVote = async (type: "manner" | "badmanner") => {
    if (!currentUser || voteLoading) return
    const voters = profile?.mannerVoters || []
    if (voters.includes(currentUser.uid)) {
      setVoteMsg("이미 투표하셨어요!")
      setTimeout(() => setVoteMsg(""), 2000)
      return
    }
    setVoteLoading(true)
    try {
      await updateDoc(doc(db, "users", uid), {
        mannerScore: increment(type === "manner" ? 1 : -1),
        mannerVoters: arrayUnion(currentUser.uid)
      })
      const updated = {
        ...profile,
        mannerScore: (profile?.mannerScore || 0) + (type === "manner" ? 1 : -1),
        mannerVoters: [...(profile?.mannerVoters || []), currentUser.uid]
      }
      setProfile(updated)
      profileCache.set(uid, updated)
      setVoteMsg(type === "manner" ? "👍 매너 투표 완료!" : "👎 비매너 투표 완료!")
      setTimeout(() => setVoteMsg(""), 2000)
    } catch (e) {
      console.error(e)
      setVoteMsg("오류가 발생했어요")
    } finally {
      setVoteLoading(false)
    }
  }

  const left = Math.min(anchorPos.x, window.innerWidth - 250)
  const top = Math.min(anchorPos.y, window.innerHeight - 320)
  const alreadyVoted = currentUser && profile?.mannerVoters?.includes(currentUser.uid)
  const score = profile?.mannerScore || 0
  const scoreColor = score > 0 ? "text-green-600" : score < 0 ? "text-red-500" : "text-gray-400"
  const certCount = profile
    ? [profile.emailVerified, profile.phoneVerified, profile.handsVerified].filter(Boolean).length
    : 0

  const Badge = ({ ok, label, icon }: { ok?: boolean; label: string; icon: string }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold ${
      ok ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"
    }`}>
      <span className="text-sm">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className={`font-black ${ok ? "text-green-600" : "text-gray-300"}`}>
        {ok ? "✓ 완료" : "미인증"}
      </span>
    </div>
  )

  return (
    <div
      ref={popupRef}
      style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-60 bg-white border-2 border-[#FFD8A8] rounded-2xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-[#FFF4E6] px-4 py-3 flex justify-between items-center border-b-2 border-[#FFD8A8]">
        <span className="font-black text-[#A64D13] text-sm">유저 정보</span>
        <button onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-[#FFD8A8] hover:bg-[#FFB347] text-[#A64D13] text-xs font-black transition-colors">
          ✕
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isGuest ? (
          <div className="text-center py-3">
            <div className="text-4xl mb-2">👤</div>
            <p className="font-black text-sm text-[#5D4037]">{displayName}</p>
            <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full inline-block">
              <span className="text-xs text-gray-500 font-bold">비회원</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">인증 정보가 없어요</p>
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="text-center pb-3 border-b border-[#FFE8CC]">
              <div className="text-3xl mb-1">🍁</div>
              <p className="font-black text-sm text-[#5D4037]">{profile.nickname || displayName}</p>
              {certCount > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: certCount }).map((_, i) => (
                    <span key={i} className="text-base">⭐</span>
                  ))}
                </div>
              )}
              {profile.server && (
                <span className="text-[11px] text-[#E67E22] font-bold bg-[#FFF4E6] px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  🗺 {profile.server} 서버
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">인증 내역</p>
              <Badge ok={profile.emailVerified} label="이메일" icon="📧" />
              <Badge ok={profile.phoneVerified} label="전화번호" icon="📱" />
              <Badge ok={profile.handsVerified} label="손 인증" icon="🤝" />
            </div>

            <div className="border-t border-[#FFE8CC] pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">매너 점수</p>
                <span className={`text-lg font-black ${scoreColor}`}>
                  {score > 0 ? `+${score}` : score}점
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVote("manner")}
                  disabled={!currentUser || !!alreadyVoted || voteLoading}
                  title={!currentUser ? "회원만 투표 가능" : alreadyVoted ? "이미 투표함" : ""}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1 ${
                    !currentUser || alreadyVoted
                      ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                      : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 active:scale-95 cursor-pointer"
                  }`}>
                  👍 매너
                </button>
                <button
                  onClick={() => handleVote("badmanner")}
                  disabled={!currentUser || !!alreadyVoted || voteLoading}
                  title={!currentUser ? "회원만 투표 가능" : alreadyVoted ? "이미 투표함" : ""}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1 ${
                    !currentUser || alreadyVoted
                      ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                      : "bg-red-50 text-red-600 border-red-300 hover:bg-red-100 active:scale-95 cursor-pointer"
                  }`}>
                  👎 비매너
                </button>
              </div>
              {!currentUser && (
                <p className="text-[10px] text-gray-400 text-center">로그인 후 투표할 수 있어요</p>
              )}
              {alreadyVoted && (
                <p className="text-[10px] text-gray-400 text-center">이미 투표한 유저예요</p>
              )}
              {voteMsg && (
                <p className="text-[11px] font-bold text-center text-[#E67E22]">{voteMsg}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-400 py-4">정보를 찾을 수 없어요</p>
        )}
      </div>
    </div>
  )
}

// ── 우클릭 컨텍스트 메뉴 ─────────────────────────────────
function ContextMenu({ pos, targetMsg, currentUid, onClose, onViewProfile, onStartDM }: {
  pos: { x: number; y: number }
  targetMsg: Message
  currentUid: string | null
  onClose: () => void
  onViewProfile: () => void
  onStartDM: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", handleClick)
    }
  }, [onClose])

  if (targetMsg.uid === currentUid) return null

  const left = Math.min(pos.x, window.innerWidth - 170)
  const top = Math.min(pos.y, window.innerHeight - 110)

  return (
    <div
      ref={menuRef}
      style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-44 bg-white border-2 border-[#FFD8A8] rounded-xl shadow-2xl overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
    >
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

// ── 메인 ChatRoom ─────────────────────────────────────────
export default function ChatRoom({ room = "main_trade" }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendType, setSendType] = useState<"일반" | "삽니다" | "팝니다">("일반")
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState<string>("")
  const [guestName, setGuestName] = useState("")
  const [dmLoading, setDmLoading] = useState(false)
  const [profilePopup, setProfilePopup] = useState<{
    uid: string; displayName: string; isGuest: boolean; pos: { x: number; y: number }
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    msg: Message; pos: { x: number; y: number }
  } | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ── 로그인 + 닉네임 로드 ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) {
            const data = snap.data()
            setUserNickname(data.nickname || u.email?.split("@")[0] || "모험가")
          }
        } catch {
          setUserNickname(u.email?.split("@")[0] || "모험가")
        }
      } else {
        setUserNickname("")
      }
    })
    return () => unsub()
  }, [])

  // ── 비회원 닉네임 복원 ──
  useEffect(() => {
    const saved = localStorage.getItem("maple_guest_name")
    if (saved) setGuestName(saved)
  }, [])

  // ── Firestore 실시간 리스너 ──
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

  // ── 메시지 전송 ──
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
        displayName: user ? userNickname : guestName.trim(),
      })
    } catch (err) { console.error("전송 실패:", err) }
  }

  // ── 닉네임 클릭 → 프로필 팝업 ──
  const handleNameClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault()
    e.stopPropagation()
    if (msg.uid === user?.uid) return
    setContextMenu(null)
    setProfilePopup({
      uid: msg.uid,
      displayName: msg.displayName,
      isGuest: msg.isGuest,
      pos: { x: e.clientX, y: e.clientY }
    })
  }

  // ── 우클릭 → 컨텍스트 메뉴 ──
  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault()
    e.stopPropagation()
    if (msg.uid === user?.uid) return
    setProfilePopup(null)
    setContextMenu({ msg, pos: { x: e.clientX, y: e.clientY } })
  }

  // ── 정보 보기 ──
  const handleViewProfile = useCallback((msg: Message, pos: { x: number; y: number }) => {
    setContextMenu(null)
    requestAnimationFrame(() => {
      setProfilePopup({
        uid: msg.uid,
        displayName: msg.displayName,
        isGuest: msg.isGuest,
        pos
      })
    })
  }, [])

  // ── 1:1 대화 시작 → DM 방 생성 후 /messages 이동 ──
  const handleStartDM = useCallback(async (targetMsg: Message) => {
    if (dmLoading) return
    setDmLoading(true)

    // 내 uid/이름 결정 (비회원도 임시 uid 사용)
    const myUid = user?.uid || (() => {
      const saved = localStorage.getItem("maple_guest_uid")
      if (saved) return saved
      const newUid = "guest_" + Math.random().toString(36).substring(7)
      localStorage.setItem("maple_guest_uid", newUid)
      return newUid
    })()
    const myName = user ? userNickname : (guestName || "비회원")

    try {
      await getOrCreateDMRoom(myUid, myName, targetMsg.uid, targetMsg.displayName)
      router.push("/messages")
    } catch (err) {
      console.error("DM 시작 실패:", err)
      alert("DM 시작에 실패했어요. 다시 시도해주세요.")
    } finally {
      setDmLoading(false)
    }
  }, [user, userNickname, guestName, dmLoading, router])

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
      {/* 타이틀 */}
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

            {/* 닉네임 + 별 + 시간 */}
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#A64D13]">
              <span
                className={`select-none ${msg.uid !== user?.uid ? "cursor-pointer hover:underline" : ""}`}
                onClick={(e) => handleNameClick(e, msg)}>
                {msg.isGuest ? `👤 ${msg.displayName}` : `🍁 ${msg.displayName}`}
              </span>
              {!msg.isGuest && profileCache.has(msg.uid) && (
                <StarBadge profile={profileCache.get(msg.uid)!} />
              )}
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
        {!user && (
          <input
            className="w-full p-2.5 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white"
            placeholder="닉네임을 입력하세요 (비회원)"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            maxLength={20} />
        )}
        {user && (
          <div className="text-xs font-bold text-[#A64D13] px-1">
            🍁 {userNickname} 으로 채팅 중
          </div>
        )}
        <div className="flex gap-2 items-center">
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

      {/* DM 로딩 오버레이 */}
      {dmLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-[35px] z-50">
          <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl border-2 border-[#FFD8A8]">
            <div className="w-5 h-5 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" />
            <span className="font-black text-sm text-[#A64D13]">대화방 연결 중...</span>
          </div>
        </div>
      )}

      {/* 프로필 팝업 */}
      {profilePopup && (
        <ProfilePopup
          uid={profilePopup.uid}
          displayName={profilePopup.displayName}
          isGuest={profilePopup.isGuest}
          anchorPos={profilePopup.pos}
          onClose={() => setProfilePopup(null)}
          currentUser={user} />
      )}

      {/* 우클릭 메뉴 */}
      {contextMenu && (
        <ContextMenu
          pos={contextMenu.pos}
          targetMsg={contextMenu.msg}
          currentUid={user?.uid || null}
          onClose={() => setContextMenu(null)}
          onViewProfile={() => handleViewProfile(contextMenu.msg, contextMenu.pos)}
          onStartDM={() => handleStartDM(contextMenu.msg)} />
      )}
    </div>
  )
}