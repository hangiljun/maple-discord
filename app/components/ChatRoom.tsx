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

// ── 모바일 safe 위치 계산 ─────────────────────────────────
function getSafePos(x: number, y: number, w = 240, h = 320) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400
  const vh = typeof window !== "undefined" ? window.innerHeight : 700
  return {
    left: Math.min(Math.max(x, 8), vw - w - 8),
    top: Math.min(Math.max(y, 8), vh - h - 8),
  }
}

// ── 프로필 팝업 ──────────────────────────────────────────
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
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 100)
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handleClick) }
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

  // ✅ 모바일 safe 위치
  const { left, top } = getSafePos(anchorPos.x, anchorPos.y, 240, 340)
  const alreadyVoted = currentUser && profile?.mannerVoters?.includes(currentUser.uid)
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
    <div ref={popupRef} style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-60 bg-white border-2 border-[#FFD8A8] rounded-2xl shadow-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="bg-[#FFF4E6] px-4 py-3 flex justify-between items-center border-b-2 border-[#FFD8A8]">
        <span className="font-black text-[#A64D13] text-sm">유저 정보</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded-full bg-[#FFD8A8] hover:bg-[#FFB347] text-[#A64D13] text-xs font-black">✕</button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-[#E67E22] border-t-transparent rounded-full animate-spin" /></div>
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
                  {Array.from({ length: certCount }).map((_, i) => <span key={i} className="text-base">⭐</span>)}
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
                <p className="text-[10px] font-black text-gray-400 uppercase">매너 점수</p>
                <span className={`text-lg font-black ${scoreColor}`}>{score > 0 ? `+${score}` : score}점</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleVote("manner")} disabled={!currentUser || !!alreadyVoted || voteLoading}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1 ${!currentUser || alreadyVoted ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" : "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 active:scale-95"}`}>
                  👍 매너
                </button>
                <button onClick={() => handleVote("badmanner")} disabled={!currentUser || !!alreadyVoted || voteLoading}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1 ${!currentUser || alreadyVoted ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" : "bg-red-50 text-red-600 border-red-300 hover:bg-red-100 active:scale-95"}`}>
                  👎 비매너
                </button>
              </div>
              {!currentUser && <p className="text-[10px] text-gray-400 text-center">로그인 후 투표할 수 있어요</p>}
              {alreadyVoted && <p className="text-[10px] text-gray-400 text-center">이미 투표한 유저예요</p>}
              {voteMsg && <p className="text-[11px] font-bold text-center text-[#E67E22]">{voteMsg}</p>}
            </div>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-400 py-4">정보를 찾을 수 없어요</p>
        )}
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

  const handleDeleteMessage = async () => {
    setLoading(true)
    try { await deleteMessage(targetMsg.id); setDone("✅ 메시지가 삭제됐어요"); setTimeout(onClose, 1200) }
    catch { setDone("❌ 삭제 실패") } finally { setLoading(false) }
  }
  const handleMute = async () => {
    if (!reason.trim()) { alert("사유를 입력해주세요"); return }
    setLoading(true)
    try { await muteUser(targetMsg.uid, adminUid, muteHours, reason); setDone(`✅ ${targetMsg.displayName}님을 ${muteHours}시간 추방했어요`); setTimeout(onClose, 1500) }
    catch { setDone("❌ 추방 실패") } finally { setLoading(false) }
  }
  const handleBan = async () => {
    if (!reason.trim()) { alert("사유를 입력해주세요"); return }
    if (!confirm(`정말 ${targetMsg.displayName}님을 영구 차단할까요?`)) return
    setLoading(true)
    try { await banUser(targetMsg.uid, adminUid, reason); setDone(`✅ ${targetMsg.displayName}님을 영구 차단했어요`); setTimeout(onClose, 1500) }
    catch { setDone("❌ 차단 실패") } finally { setLoading(false) }
  }
  const handleWarn = async () => {
    if (!reason.trim()) { alert("경고 내용을 입력해주세요"); return }
    setLoading(true)
    try { await sendWarning(targetMsg.uid, targetMsg.displayName, adminUid, reason, room); setDone("✅ 경고 메시지를 전송했어요"); setTimeout(onClose, 1200) }
    catch { setDone("❌ 경고 전송 실패") } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] px-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-red-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-red-50 px-4 py-3 border-b-2 border-red-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>🛡️</span>
            <span className="font-black text-red-700 text-sm">관리자 메뉴</span>
            <span className="text-xs text-red-400 font-bold truncate max-w-[100px]">— {targetMsg.displayName}</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-red-100 text-red-500 font-black">✕</button>
        </div>
        <div className="p-4">
          {done ? <p className="text-center font-black text-sm py-4">{done}</p>
          : loading ? <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
          : step === "menu" ? (
            <div className="space-y-2">
              <button onClick={handleDeleteMessage} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2">🗑️ 이 메시지 삭제</button>
              <button onClick={() => setStep("warn")} className="w-full text-left px-4 py-3 rounded-xl bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 text-sm font-bold text-yellow-700 flex items-center gap-2">⚠️ 경고 메시지 전송</button>
              <button onClick={() => setStep("mute")} className="w-full text-left px-4 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 text-sm font-bold text-orange-700 flex items-center gap-2">🔇 일시 추방 (채팅 금지)</button>
              <button onClick={() => setStep("ban")} className="w-full text-left px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border-2 border-red-200 text-sm font-bold text-red-700 flex items-center gap-2">🚫 영구 차단</button>
            </div>
          ) : step === "warn" ? (
            <div className="space-y-3">
              <button onClick={() => setStep("menu")} className="text-xs text-gray-400 flex items-center gap-1">← 뒤로</button>
              <p className="font-black text-sm text-yellow-700">⚠️ 경고 메시지 전송</p>
              <textarea className="w-full p-3 rounded-xl border-2 border-yellow-200 text-sm font-bold outline-none focus:border-yellow-400 resize-none bg-yellow-50" placeholder="경고 내용" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
              <button onClick={handleWarn} className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-black text-sm">전송하기</button>
            </div>
          ) : step === "mute" ? (
            <div className="space-y-3">
              <button onClick={() => setStep("menu")} className="text-xs text-gray-400 flex items-center gap-1">← 뒤로</button>
              <p className="font-black text-sm text-orange-700">🔇 일시 추방</p>
              <div className="flex gap-2">
                {[1, 3, 6, 24].map(h => (
                  <button key={h} onClick={() => setMuteHours(h)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black border-2 transition-colors ${muteHours === h ? "bg-orange-500 text-white border-orange-500" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                    {h}시간
                  </button>
                ))}
              </div>
              <textarea className="w-full p-3 rounded-xl border-2 border-orange-200 text-sm font-bold outline-none focus:border-orange-400 resize-none bg-orange-50" placeholder="추방 사유" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
              <button onClick={handleMute} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm">{muteHours}시간 추방하기</button>
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setStep("menu")} className="text-xs text-gray-400 flex items-center gap-1">← 뒤로</button>
              <p className="font-black text-sm text-red-700">🚫 영구 차단</p>
              <div className="p-3 bg-red-50 rounded-xl border-2 border-red-200"><p className="text-xs font-bold text-red-600">⚠️ 신중하게 결정해주세요</p></div>
              <textarea className="w-full p-3 rounded-xl border-2 border-red-200 text-sm font-bold outline-none focus:border-red-400 resize-none bg-red-50" placeholder="차단 사유" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
              <button onClick={handleBan} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm">영구 차단하기</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 액션 시트 (모바일 전용 바텀 시트) ────────────────────
function ActionSheet({ targetMsg, currentUid, isAdminUser, onClose, onViewProfile, onStartDM, onAdminAction }: {
  targetMsg: Message; currentUid: string | null; isAdminUser: boolean
  onClose: () => void; onViewProfile: () => void; onStartDM: () => void; onAdminAction: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        {/* 대상 이름 */}
        <div className="px-5 py-2 border-b border-gray-100">
          <p className="text-xs font-black text-gray-400 text-center">
            {targetMsg.isGuest ? `👤 ${targetMsg.displayName}` : `🍁 ${targetMsg.displayName}`}
          </p>
        </div>
        <div className="p-3 space-y-1 pb-8">
          <button onClick={() => { onViewProfile(); onClose() }}
            className="w-full text-left px-4 py-4 rounded-2xl text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] active:bg-[#FFE8CC] transition-colors flex items-center gap-3">
            <span className="text-xl">🔍</span> 정보 보기
          </button>
          <button onClick={() => { onStartDM(); onClose() }}
            className="w-full text-left px-4 py-4 rounded-2xl text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] active:bg-[#FFE8CC] transition-colors flex items-center gap-3">
            <span className="text-xl">💬</span> 1:1 대화하기
          </button>
          {isAdminUser && !targetMsg.isSystem && (
            <button onClick={() => { onAdminAction(); onClose() }}
              className="w-full text-left px-4 py-4 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-3">
              <span className="text-xl">🛡️</span> 관리자 메뉴
            </button>
          )}
          <button onClick={onClose}
            className="w-full py-4 rounded-2xl text-sm font-black text-gray-400 bg-gray-50 mt-2">
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 데스크탑 우클릭 메뉴 ────────────────────────────────
function ContextMenu({ pos, targetMsg, currentUid, isAdminUser, onClose, onViewProfile, onStartDM, onAdminAction }: {
  pos: { x: number; y: number }; targetMsg: Message; currentUid: string | null
  isAdminUser: boolean; onClose: () => void; onViewProfile: () => void
  onStartDM: () => void; onAdminAction: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 50)
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handleClick) }
  }, [onClose])

  if (targetMsg.uid === currentUid) return null
  const { left, top } = getSafePos(pos.x, pos.y, 192, 130)

  return (
    <div ref={menuRef} style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-48 bg-white border-2 border-[#FFD8A8] rounded-xl shadow-2xl overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}>
      <button onClick={() => { onViewProfile(); onClose() }}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] transition-colors flex items-center gap-2">
        🔍 정보 보기
      </button>
      <button onClick={() => { onStartDM(); onClose() }}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#5D4037] hover:bg-[#FFF4E6] transition-colors border-t border-[#FFD8A8] flex items-center gap-2">
        💬 1:1 대화하기
      </button>
      {isAdminUser && !targetMsg.isSystem && (
        <button onClick={() => { onAdminAction(); onClose() }}
          className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-t-2 border-red-100 flex items-center gap-2">
          🛡️ 관리자 메뉴
        </button>
      )}
    </div>
  )
}

// ── Long Press 훅 (모바일 길게 누르기) ───────────────────
function useLongPress(callback: (e: React.TouchEvent) => void, ms = 500) {
  const timer = useRef<NodeJS.Timeout | null>(null)
  const triggered = useRef(false)

  const start = (e: React.TouchEvent) => {
    triggered.current = false
    timer.current = setTimeout(() => {
      triggered.current = true
      callback(e)
    }, ms)
  }
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current)
  }
  return { onTouchStart: start, onTouchEnd: cancel, onTouchMove: cancel }
}

// ── 메인 ChatRoom ─────────────────────────────────────────
export default function ChatRoom({ room = "mapleland_trade" }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendType, setSendType] = useState<"일반" | "삽니다" | "팝니다">("일반")
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState<string>("")
  const [guestName, setGuestName] = useState("")
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [blocked, setBlocked] = useState<{ banned: boolean; muted: boolean; until?: Date } | null>(null)
  const [dmLoading, setDmLoading] = useState(false)
  const [profilePopup, setProfilePopup] = useState<{ uid: string; displayName: string; isGuest: boolean; pos: { x: number; y: number } } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ msg: Message; pos: { x: number; y: number } } | null>(null)
  // ✅ 모바일 액션시트 상태
  const [actionSheet, setActionSheet] = useState<Message | null>(null)
  const [adminModal, setAdminModal] = useState<Message | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) setUserNickname(snap.data().nickname || u.email?.split("@")[0] || "모험가")
        } catch { setUserNickname(u.email?.split("@")[0] || "모험가") }
        const adminCheck = await isAdmin(u.uid)
        setIsAdminUser(adminCheck)
        const banned = await isBanned(u.uid)
        if (banned) { setBlocked({ banned: true, muted: false }); return }
        const muteStatus = await getMuteStatus(u.uid)
        if (muteStatus.muted) setBlocked({ banned: false, muted: true, until: muteStatus.until })
      } else {
        setUserNickname(""); setIsAdminUser(false)
      }
    })
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
    if (blocked?.banned) { alert("채팅이 영구 차단된 계정이에요."); return }
    if (blocked?.muted) { alert(`${blocked.until?.toLocaleString("ko-KR")}까지 채팅이 금지됐어요.`); return }
    if (!user && !guestName.trim()) { alert("닉네임을 입력해주세요!"); return }
    const textValue = newMessage
    setNewMessage("")
    if (!user && guestName.trim()) localStorage.setItem("maple_guest_name", guestName.trim())
    try {
      await addDoc(collection(db, "chats"), {
        text: textValue, createdAt: serverTimestamp(), clientTime: Date.now(),
        room, msgType: sendType, isGuest: !user,
        uid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        displayName: user ? userNickname : guestName.trim(),
      })
    } catch (err) { console.error("전송 실패:", err) }
  }

  // ✅ 닉네임 클릭 → 모바일/데스크탑 분기
  const handleNameClick = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    if (msg.uid === user?.uid || msg.isSystem) return
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setActionSheet(msg)
    } else {
      setContextMenu(null)
      setProfilePopup({ uid: msg.uid, displayName: msg.displayName, isGuest: msg.isGuest, pos: { x: e.clientX, y: e.clientY } })
    }
  }

  // ✅ 데스크탑 우클릭
  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    if (msg.uid === user?.uid || msg.isSystem) return
    setProfilePopup(null)
    setContextMenu({ msg, pos: { x: e.clientX, y: e.clientY } })
  }

  // ✅ 모바일 길게 누르기 → 액션시트
  const getLongPressHandlers = (msg: Message) => {
    if (msg.uid === user?.uid || msg.isSystem) return {}
    return useLongPress(() => setActionSheet(msg))
  }

  const handleViewProfile = useCallback((msg: Message, pos?: { x: number; y: number }) => {
    setContextMenu(null); setActionSheet(null)
    const safePos = pos || { x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 160 }
    requestAnimationFrame(() => setProfilePopup({ uid: msg.uid, displayName: msg.displayName, isGuest: msg.isGuest, pos: safePos }))
  }, [])

  const handleStartDM = useCallback(async (targetMsg: Message) => {
    if (dmLoading) return
    setDmLoading(true)
    const myUid = user?.uid || getOrCreateGuestUid()
    const myName = user ? userNickname : (guestName || "비회원")
    try {
      await getOrCreateDMRoom(myUid, myName, targetMsg.uid, targetMsg.displayName)
      router.push("/messages")
    } catch (err) { console.error("DM 시작 실패:", err); alert("DM 시작에 실패했어요.") }
    finally { setDmLoading(false) }
  }, [user, userNickname, guestName, dmLoading, router])

  const typeStyle = {
    일반: "bg-[#FFF4E6] text-[#A64D13] border-[#FFD8A8]",
    삽니다: "bg-blue-50 text-blue-700 border-blue-300",
    팝니다: "bg-orange-50 text-orange-700 border-orange-300",
  }

  return (
    <div className="flex flex-col h-[650px] bg-white border-4 border-[#FFD8A8] rounded-[35px] overflow-hidden shadow-xl"
      onClick={() => { setProfilePopup(null); setContextMenu(null) }}>

      {/* 타이틀 */}
      <div className="bg-[#FFF4E6] border-b-4 border-[#FFD8A8] px-5 py-3 flex items-center gap-2">
        <span className="text-lg">🍁</span>
        <span className="font-black text-[#A64D13] text-sm">메이플랜드 거래 채팅</span>
        {isAdminUser && (
          <span className="text-[10px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full border border-red-200">🛡️ 관리자</span>
        )}
        <span className="ml-auto text-[11px] text-[#FFB347] font-bold">{messages.length}개</span>
      </div>

      {/* 차단/추방 배너 */}
      {blocked?.banned && (
        <div className="bg-red-100 border-b-2 border-red-300 px-4 py-2 text-xs font-black text-red-700 text-center">
          🚫 이 계정은 채팅이 영구 차단됐어요
        </div>
      )}
      {blocked?.muted && (
        <div className="bg-orange-100 border-b-2 border-orange-300 px-4 py-2 text-xs font-black text-orange-700 text-center">
          🔇 {blocked.until?.toLocaleString("ko-KR")}까지 채팅 금지
        </div>
      )}

      {/* 채팅 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFEFA]">
        {messages.length === 0 && (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">아직 메시지가 없어요!</div>
        )}
        {messages.map((msg) => {
          // ✅ 각 메시지마다 long press 핸들러
          const longPress = (msg.uid !== user?.uid && !msg.isSystem)
            ? { onTouchStart: (e: React.TouchEvent) => {
                const timer = setTimeout(() => setActionSheet(msg), 500)
                const cancel = () => clearTimeout(timer)
                e.currentTarget.addEventListener("touchend", cancel, { once: true })
                e.currentTarget.addEventListener("touchmove", cancel, { once: true })
              }}
            : {}

          return (
            <div key={msg.id}
              className={`flex flex-col ${msg.isSystem ? "items-center" : msg.uid === user?.uid ? "items-end" : "items-start"}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}
              {...longPress}
            >
              {msg.isSystem ? (
                <div className="px-4 py-2 bg-yellow-50 border-2 border-yellow-300 rounded-2xl text-xs font-bold text-yellow-800 max-w-[90%] text-center">
                  {msg.text}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-[#A64D13]">
                    {/* ✅ 모바일: 탭으로 액션시트, 데스크탑: 클릭으로 팝업 */}
                    <span
                      className={`select-none ${msg.uid !== user?.uid ? "cursor-pointer hover:underline active:opacity-60" : ""}`}
                      onClick={(e) => handleNameClick(e, msg)}>
                      {msg.isGuest ? `👤 ${msg.displayName}` : `🍁 ${msg.displayName}`}
                    </span>
                    {!msg.isGuest && profileCache.has(msg.uid) && <StarBadge profile={profileCache.get(msg.uid)!} />}
                    <span className="text-[#FFB347] font-normal">{msg.time}</span>
                    {isAdminUser && (
                      <button onClick={() => deleteMessage(msg.id)}
                        className="ml-1 text-red-300 hover:text-red-500 text-[10px]" title="삭제">✕</button>
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm font-bold border-2 max-w-[80%] break-words ${
                    msg.msgType === "삽니다" ? "border-blue-300 bg-blue-50 text-blue-700" :
                    msg.msgType === "팝니다" ? "border-orange-300 bg-orange-50 text-orange-700" :
                    "border-[#FFD8A8] bg-white text-[#5D4037]"}`}>
                    {msg.msgType !== "일반" && (
                      <span className={`mr-1.5 px-1.5 py-0.5 rounded-md text-xs font-black ${msg.msgType === "삽니다" ? "bg-blue-200 text-blue-800" : "bg-orange-200 text-orange-800"}`}>
                        [{msg.msgType}]
                      </span>
                    )}
                    {msg.text}
                  </div>
                </>
              )}
            </div>
          )
        })}
        <div ref={scrollRef} />
      </div>

      {/* ✅ 입력창 - 모바일 최적화 */}
      <form onSubmit={sendMessage}
        className="p-3 bg-[#FFF4E6] border-t-4 border-[#FFD8A8] flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}>
        {!user && (
          <input className="w-full p-2.5 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] bg-white"
            placeholder="닉네임 입력 (비회원)" value={guestName}
            onChange={(e) => setGuestName(e.target.value)} maxLength={20} />
        )}
        {user && <div className="text-xs font-bold text-[#A64D13] px-1">🍁 {userNickname} 으로 채팅 중</div>}
        <div className="flex gap-1.5 items-center">
          {/* ✅ 모바일에서 드롭박스 축소 */}
          <select value={sendType} onChange={(e) => setSendType(e.target.value as "일반" | "삽니다" | "팝니다")}
            className={`p-2.5 rounded-xl border-2 font-black text-xs outline-none cursor-pointer transition-colors flex-shrink-0 ${typeStyle[sendType]}`}>
            <option value="일반">일반</option>
            <option value="삽니다">🔵 삽니다</option>
            <option value="팝니다">🟠 팝니다</option>
          </select>
          <input className="flex-1 p-2.5 rounded-2xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] min-w-0"
            placeholder={blocked?.banned ? "채팅 차단됨" : blocked?.muted ? "채팅 금지됨" : "거래 내용 입력"}
            value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            disabled={!!blocked?.banned || !!blocked?.muted} />
          <button disabled={!!blocked?.banned || !!blocked?.muted}
            className="bg-[#E67E22] disabled:bg-gray-300 text-white px-4 py-2.5 rounded-2xl font-black text-sm shadow-md active:scale-95 whitespace-nowrap flex-shrink-0">
            전송
          </button>
        </div>
      </form>

      {/* DM 로딩 */}
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
        <ProfilePopup uid={profilePopup.uid} displayName={profilePopup.displayName}
          isGuest={profilePopup.isGuest} anchorPos={profilePopup.pos}
          onClose={() => setProfilePopup(null)} currentUser={user} />
      )}

      {/* 데스크탑 우클릭 메뉴 */}
      {contextMenu && (
        <ContextMenu pos={contextMenu.pos} targetMsg={contextMenu.msg}
          currentUid={user?.uid || null} isAdminUser={isAdminUser}
          onClose={() => setContextMenu(null)}
          onViewProfile={() => handleViewProfile(contextMenu.msg, contextMenu.pos)}
          onStartDM={() => handleStartDM(contextMenu.msg)}
          onAdminAction={() => setAdminModal(contextMenu.msg)} />
      )}

      {/* ✅ 모바일 액션시트 */}
      {actionSheet && (
        <ActionSheet
          targetMsg={actionSheet}
          currentUid={user?.uid || null}
          isAdminUser={isAdminUser}
          onClose={() => setActionSheet(null)}
          onViewProfile={() => handleViewProfile(actionSheet)}
          onStartDM={() => handleStartDM(actionSheet)}
          onAdminAction={() => { setAdminModal(actionSheet); setActionSheet(null) }} />
      )}

      {/* 관리자 모달 */}
      {adminModal && (
        <AdminModal targetMsg={adminModal} adminUid={user?.uid || ""}
          room={room} onClose={() => setAdminModal(null)} />
      )}
    </div>
  )
}