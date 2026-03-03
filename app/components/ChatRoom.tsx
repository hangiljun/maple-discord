"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, where, limit, doc, getDoc,
  updateDoc, arrayUnion, increment, deleteDoc
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { getOrCreateDMRoom, getOrCreateGuestUid } from "@/lib/dm"
import {
  isAdmin, deleteMessage, banUser, muteUser,
  sendWarning, getMuteStatus, isBanned
} from "@/lib/admin"

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
  isSystem?: boolean
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

// ── 별 표시 ──────────────────────────────────────────────
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

const profileCache = new Map<string, UserProfile>()

// ── 프로필 팝업 (모바일 대응) ──────────────────────────
function ProfilePopup({ uid, displayName, isGuest, anchorPos, onClose, currentUser }: {
  uid: string; displayName: string; isGuest: boolean
  anchorPos: { x: number; y: number }; onClose: () => void; currentUser: any
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
    const handleClick = (e: any) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("touchstart", handleClick)
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("touchstart", handleClick) }
  }, [onClose])

  const handleVote = async (type: "manner" | "badmanner") => {
    if (!currentUser || voteLoading) return
    const voters = profile?.mannerVoters || []
    if (voters.includes(currentUser.uid)) {
      setVoteMsg("이미 투표하셨어요!"); setTimeout(() => setVoteMsg(""), 2000); return
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
      setProfile(updated); profileCache.set(uid, updated)
      setVoteMsg(type === "manner" ? "👍 매너 투표 완료!" : "👎 비매너 투표 완료!")
      setTimeout(() => setVoteMsg(""), 2000)
    } catch (e) { console.error(e); setVoteMsg("오류가 발생했어요") }
    finally { setVoteLoading(false) }
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const left = isMobile ? "50%" : Math.min(anchorPos.x, window.innerWidth - 250)
  const top = isMobile ? "50%" : Math.min(anchorPos.y, window.innerHeight - 320)
  const score = profile?.mannerScore || 0
  const scoreColor = score > 0 ? "text-green-600" : score < 0 ? "text-red-500" : "text-gray-400"
  const certCount = profile ? [profile.emailVerified, profile.phoneVerified, profile.handsVerified].filter(Boolean).length : 0

  const Badge = ({ ok, label, icon }: { ok?: boolean; label: string; icon: string }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
      <span className="text-sm">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className={`font-black ${ok ? "text-green-600" : "text-gray-300"}`}>{ok ? "✓ 완료" : "미인증"}</span>
    </div>
  )

  return (
    <div className={isMobile ? "fixed inset-0 bg-black/40 z-[9998]" : ""}>
      <div ref={popupRef} style={isMobile ? { position: "fixed", top, left, transform: "translate(-50%, -50%)", zIndex: 9999 } : { position: "fixed", left, top, zIndex: 9999 }}
        className="w-60 bg-white border-2 border-[#FFD8A8] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#FFF4E6] px-4 py-3 flex justify-between items-center border-b-2 border-[#FFD8A8]">
          <span className="font-black text-[#A64D13] text-sm">유저 정보</span>
          <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded-full bg-[#FFD8A8] text-[#A64D13] text-xs font-black">✕</button>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" /></div>
          ) : isGuest ? (
            <div className="text-center py-3">
              <div className="text-4xl mb-2">👤</div>
              <p className="font-black text-sm text-[#5D4037]">{displayName}</p>
              <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full inline-block"><span className="text-xs text-gray-500 font-bold">비회원</span></div>
            </div>
          ) : profile ? (
            <div className="space-y-3">
              <div className="text-center pb-3 border-b border-[#FFE8CC]">
                <div className="text-3xl mb-1">🍁</div>
                <p className="font-black text-sm text-[#5D4037]">{profile.nickname || displayName}</p>
                {certCount > 0 && <div className="flex justify-center gap-0.5 mt-1">{"⭐".repeat(certCount)}</div>}
                {profile.server && <span className="text-[11px] text-[#E67E22] font-bold bg-[#FFF4E6] px-2 py-0.5 rounded-full mt-1.5 inline-block">🗺 {profile.server} 서버</span>}
              </div>
              <div className="space-y-1.5">
                <Badge ok={profile.emailVerified} label="이메일" icon="📧" />
                <Badge ok={profile.phoneVerified} label="전화번호" icon="📱" />
                <Badge ok={profile.handsVerified} label="손 인증" icon="🤝" />
              </div>
              <div className="border-t border-[#FFE8CC] pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase">매너 점수</p>
                  <span className={`text-lg font-black ${scoreColor}`}>{score > 0 ? `+${score}` : score}점</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleVote("manner")} disabled={!currentUser || voteLoading} className="flex-1 py-2 rounded-xl text-xs font-black border-2 bg-green-50 text-green-700 border-green-300 active:scale-95 disabled:opacity-50">👍 매너</button>
                  <button onClick={() => handleVote("badmanner")} disabled={!currentUser || voteLoading} className="flex-1 py-2 rounded-xl text-xs font-black border-2 bg-red-50 text-red-600 border-red-300 active:scale-95 disabled:opacity-50">👎 비매너</button>
                </div>
                {voteMsg && <p className="text-[11px] font-bold text-center text-[#E67E22]">{voteMsg}</p>}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── 관리자 액션 모달 ─────────────────────────────────────
function AdminModal({ targetMsg, adminUid, room, onClose }: {
  targetMsg: Message; adminUid: string; room: string; onClose: () => void
}) {
  const [step, setStep] = useState<"menu" | "mute" | "ban" | "warn">("menu")
  const [reason, setReason] = useState("")
  const [muteHours, setMuteHours] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: any) => { if (modalRef.current && !modalRef.current.contains(e.target)) onClose() }
    document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick)
  }, [onClose])

  const handleDeleteMessage = async () => {
    setLoading(true); try { await deleteMessage(targetMsg.id); setDone("✅ 삭제됨"); setTimeout(onClose, 1000) } catch { setDone("❌ 실패") } finally { setLoading(false) }
  }
  const handleMute = async () => {
    if (!reason.trim()) return alert("사유 입력"); setLoading(true)
    try { await muteUser(targetMsg.uid, adminUid, muteHours, reason); setDone("✅ 추방됨"); setTimeout(onClose, 1000) } catch { setDone("❌ 실패") } finally { setLoading(false) }
  }
  const handleBan = async () => {
    if (!reason.trim()) return alert("사유 입력"); setLoading(true)
    try { await banUser(targetMsg.uid, adminUid, reason); setDone("✅ 차단됨"); setTimeout(onClose, 1000) } catch { setDone("❌ 실패") } finally { setLoading(false) }
  }
  const handleWarn = async () => {
    if (!reason.trim()) return alert("내용 입력"); setLoading(true)
    try { await sendWarning(targetMsg.uid, targetMsg.displayName, adminUid, reason, room); setDone("✅ 경고됨"); setTimeout(onClose, 1000) } catch { setDone("❌ 실패") } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div ref={modalRef} className="w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-red-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-red-50 px-4 py-3 border-b-2 border-red-200 flex justify-between items-center">
          <span className="font-black text-red-700 text-sm">🛡️ 관리자 메뉴</span>
          <button onClick={onClose} className="text-red-500 font-black">✕</button>
        </div>
        <div className="p-4">
          {done ? <p className="text-center font-black text-sm py-4">{done}</p> : loading ? <p className="text-center py-4">처리 중...</p> : 
            step === "menu" ? (
              <div className="space-y-2">
                <button onClick={handleDeleteMessage} className="w-full text-left p-3 rounded-xl bg-gray-50 border-2 text-sm font-bold">🗑️ 메시지 삭제</button>
                <button onClick={() => setStep("warn")} className="w-full text-left p-3 rounded-xl bg-yellow-50 border-2 text-sm font-bold">⚠️ 경고 전송</button>
                <button onClick={() => setStep("mute")} className="w-full text-left p-3 rounded-xl bg-orange-50 border-2 text-sm font-bold">🔇 일시 추방</button>
                <button onClick={() => setStep("ban")} className="w-full text-left p-3 rounded-xl bg-red-50 border-2 text-sm font-bold text-red-700">🚫 영구 차단</button>
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={() => setStep("menu")} className="text-xs text-gray-400">← 뒤로</button>
                <textarea className="w-full p-3 border-2 rounded-xl text-sm" placeholder="사유를 입력하세요" rows={3} value={reason} onChange={e => setReason(e.target.value)} />
                {step === "mute" && (
                  <div className="flex gap-2">
                    {[1, 6, 24].map(h => <button key={h} onClick={() => setMuteHours(h)} className={`flex-1 p-2 border-2 rounded-lg text-xs font-bold ${muteHours === h ? "bg-orange-500 text-white" : ""}`}>{h}H</button>)}
                  </div>
                )}
                <button onClick={step === "warn" ? handleWarn : step === "mute" ? handleMute : handleBan} className="w-full py-2.5 bg-red-500 text-white rounded-xl font-black">실행</button>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

// ── 우클릭/터치 메뉴 ─────────────────────────────────────
function ContextMenu({ pos, targetMsg, currentUid, isAdminUser, onClose, onViewProfile, onStartDM, onAdminAction }: {
  pos: { x: number; y: number }; targetMsg: Message; currentUid: string | null
  isAdminUser: boolean; onClose: () => void; onViewProfile: () => void
  onStartDM: () => void; onAdminAction: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  useEffect(() => {
    const handleClose = () => onClose()
    document.addEventListener("mousedown", handleClose)
    document.addEventListener("touchstart", handleClose)
    return () => { document.removeEventListener("mousedown", handleClose); document.removeEventListener("touchstart", handleClose) }
  }, [onClose])

  const style: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: "20px", left: "5%", right: "5%", zIndex: 9999 }
    : { position: "fixed", left: Math.min(pos.x, window.innerWidth - 180), top: Math.min(pos.y, window.innerHeight - 150), zIndex: 9999 }

  return (
    <div ref={menuRef} style={style} className="bg-white border-2 border-[#FFD8A8] rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5" onClick={e => e.stopPropagation()}>
      <button onClick={() => { onViewProfile(); onClose() }} className="w-full text-left px-4 py-3 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] flex items-center gap-2">🔍 정보 보기</button>
      <button onClick={() => { onStartDM(); onClose() }} className="w-full text-left px-4 py-3 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] border-t border-[#FFD8A8] flex items-center gap-2">💬 1:1 대화하기</button>
      {isAdminUser && !targetMsg.isSystem && (
        <button onClick={() => { onAdminAction(); onClose() }} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 border-t-2 border-red-100 flex items-center gap-2">🛡️ 관리자 메뉴</button>
      )}
    </div>
  )
}

// ── 메인 ChatRoom ─────────────────────────────────────────
export default function ChatRoom({ room = "mapleland_trade" }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendType, setSendType] = useState<"일반" | "삽니다" | "팝니다">("일반")
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState("")
  const [guestName, setGuestName] = useState("")
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [blocked, setBlocked] = useState<{ banned: boolean; muted: boolean; until?: Date } | null>(null)
  const [dmLoading, setDmLoading] = useState(false)
  const [profilePopup, setProfilePopup] = useState<any>(null)
  const [contextMenu, setContextMenu] = useState<any>(null)
  const [adminModal, setAdminModal] = useState<Message | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        getDoc(doc(db, "users", u.uid)).then(snap => {
          if (snap.exists()) setUserNickname(snap.data().nickname || u.email?.split("@")[0] || "모험가")
        })
        isAdmin(u.uid).then(setIsAdminUser)
        isBanned(u.uid).then(b => b && setBlocked({ banned: true, muted: false }))
        getMuteStatus(u.uid).then(m => m.muted && setBlocked({ banned: false, muted: true, until: m.until }))
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "chats"), where("room", "==", room), orderBy("createdAt", "asc"), limit(100))
    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => {
        const data = d.data(); const date = data.createdAt?.toDate() || new Date(data.clientTime)
        return { id: d.id, ...data, time: date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) } as Message
      })
      setMessages(msgs)
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    })
  }, [room])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || blocked) return
    if (!user && !guestName.trim()) return alert("닉네임 입력!")
    const text = newMessage; setNewMessage("")
    try {
      await addDoc(collection(db, "chats"), {
        text, createdAt: serverTimestamp(), clientTime: Date.now(), room, msgType: sendType,
        isGuest: !user, uid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        displayName: user ? userNickname : guestName.trim()
      })
    } catch (err) { console.error(err) }
  }

  // 모바일 대응 통합 핸들러
  const handleUserClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    if (msg.uid === user?.uid || msg.isSystem) return
    setContextMenu({ msg, pos: { x: e.clientX, y: e.clientY } })
  }

  const handleStartDM = async (targetMsg: Message) => {
    setDmLoading(true); const myUid = user?.uid || getOrCreateGuestUid()
    try { await getOrCreateDMRoom(myUid, user ? userNickname : (guestName || "비회원"), targetMsg.uid, targetMsg.displayName); router.push("/messages") }
    catch { alert("실패") } finally { setDmLoading(false) }
  }

  return (
    <div className="flex flex-col h-[85vh] md:h-[650px] w-full max-w-2xl mx-auto bg-white border-4 border-[#FFD8A8] rounded-[30px] md:rounded-[35px] overflow-hidden shadow-xl relative" onClick={() => { setProfilePopup(null); setContextMenu(null) }}>
      
      {/* 타이틀 바 */}
      <div className="bg-[#FFF4E6] border-b-4 border-[#FFD8A8] px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-black text-[#A64D13] text-sm md:text-base">
          <span>🍁</span> 메이플랜드 거래 채팅
          {isAdminUser && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">🛡️ 관리자</span>}
        </div>
        <span className="text-[10px] md:text-xs text-[#FFB347] font-bold">{messages.length} Active</span>
      </div>

      {/* 차단 안내 */}
      {blocked && (
        <div className={`p-2 text-center text-[10px] font-black border-b-2 ${blocked.banned ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
          {blocked.banned ? "🚫 영구 차단된 계정입니다." : `🔇 ${blocked.until?.toLocaleString()}까지 채팅 금지`}
        </div>
      )}

      {/* 채팅창 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFFEFA]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSystem ? "items-center" : msg.uid === user?.uid ? "items-end" : "items-start"}`} onContextMenu={e => handleUserClick(e, msg)}>
            {!msg.isSystem && (
              <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#A64D13]">
                <span className="cursor-pointer bg-[#FFF4E6] px-2 py-0.5 rounded-lg active:scale-95 transition-transform" onClick={e => handleUserClick(e, msg)}>
                  {msg.isGuest ? "👤" : "🍁"} {msg.displayName}
                </span>
                {!msg.isGuest && profileCache.has(msg.uid) && <StarBadge profile={profileCache.get(msg.uid)!} />}
                <span className="text-[#FFB347] font-normal">{msg.time}</span>
              </div>
            )}
            <div className={`p-3 rounded-2xl text-sm font-bold border-2 max-w-[85%] ${
              msg.isSystem ? "bg-yellow-50 border-yellow-200 text-yellow-800 text-xs" :
              msg.msgType === "삽니다" ? "border-blue-200 bg-blue-50 text-blue-800" :
              msg.msgType === "팝니다" ? "border-orange-200 bg-orange-50 text-orange-800" :
              "border-[#FFD8A8] bg-white text-[#5D4037]"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={sendMessage} className="p-3 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] shrink-0" onClick={e => e.stopPropagation()}>
        {!user && <input className="w-full p-2.5 mb-2 rounded-xl border-2 border-[#FFD8A8] text-xs font-bold" placeholder="닉네임 입력 (비회원)" value={guestName} onChange={e => setGuestName(e.target.value)} />}
        <div className="flex gap-2">
          <select value={sendType} onChange={e => setSendType(e.target.value as any)} className="p-2.5 rounded-xl border-2 border-[#FFD8A8] text-xs font-black bg-white">
            <option value="일반">💬</option>
            <option value="삽니다">🔵 사요</option>
            <option value="팝니다">🟠 팔아요</option>
          </select>
          <input className="flex-1 p-2.5 rounded-xl border-2 border-[#FFD8A8] text-sm font-bold outline-none" placeholder="메시지 입력..." value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={!!blocked} />
          <button className="bg-[#E67E22] text-white px-5 rounded-xl font-black text-sm active:scale-90 disabled:bg-gray-300" disabled={!!blocked}>전송</button>
        </div>
      </form>

      {/* 팝업 레이어들 */}
      {contextMenu && (
        <ContextMenu pos={contextMenu.pos} targetMsg={contextMenu.msg} currentUid={user?.uid} isAdminUser={isAdminUser} onClose={() => setContextMenu(null)}
          onViewProfile={() => setProfilePopup({ uid: contextMenu.msg.uid, displayName: contextMenu.msg.displayName, isGuest: contextMenu.msg.isGuest, pos: contextMenu.pos })}
          onStartDM={() => handleStartDM(contextMenu.msg)}
          onAdminAction={() => setAdminModal(contextMenu.msg)} />
      )}
      {profilePopup && <ProfilePopup {...profilePopup} currentUser={user} onClose={() => setProfilePopup(null)} />}
      {adminModal && <AdminModal targetMsg={adminModal} adminUid={user?.uid} room={room} onClose={() => setAdminModal(null)} />}
      {dmLoading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[100] backdrop-blur-sm"><div className="bg-white p-4 rounded-2xl font-black shadow-xl">이동 중...</div></div>}
    </div>
  )
}