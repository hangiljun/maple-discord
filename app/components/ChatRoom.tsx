"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, where, limit, doc, getDoc, getDocs,
  updateDoc, arrayUnion, increment
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
  msgType: "일반" | "삽니다" | "팝니다" | "경고"
  createdAt?: any
  clientTime?: number
  time: string
  uid: string
  displayName: string
  isGuest: boolean
  isSystem?: boolean
  isAdminMessage?: boolean
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
  isAdmin?: boolean
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

function renderTextWithLinks(text: string) {
  const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+/g
  const parts = text.split(urlRegex)
  const matches = text.match(urlRegex) || []
  return parts.flatMap((part, i) => {
    const result: React.ReactNode[] = [part]
    if (matches[i]) {
      const href = matches[i].startsWith("http") ? matches[i] : `https://${matches[i]}`
      result.push(
        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
          className="underline text-blue-500 break-all hover:text-blue-700"
          onClick={(e) => e.stopPropagation()}>
          {matches[i]}
        </a>
      )
    }
    return result
  })
}

function getSafePos(x: number, y: number, w = 240, h = 320) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 400
  const vh = typeof window !== "undefined" ? window.innerHeight : 700
  return {
    left: Math.min(Math.max(x, 8), vw - w - 8),
    top: Math.min(Math.max(y, 8), vh - h - 8),
  }
}

// ── 프로필 팝업 ──────────────────────────────────────────
function ProfilePopup({ uid, displayName, isGuest, anchorPos, onClose, currentUser, isTargetAdmin, isCurrentUserAdmin, onStartDM }: {
  uid: string; displayName: string; isGuest: boolean
  anchorPos: { x: number; y: number }; onClose: () => void
  currentUser: any; isTargetAdmin?: boolean; isCurrentUserAdmin?: boolean
  onStartDM?: () => void
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(!isGuest)
  const [voteLoading, setVoteLoading] = useState(false)
  const [voteMsg, setVoteMsg] = useState("")
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isGuest) return
    setLoading(true)
    const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserProfile
        profileCache.set(uid, data)
        setProfile(data)
      }
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return () => unsub()
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
      setVoteMsg(type === "manner" ? "👍 매너 투표 완료!" : "👎 비매너 투표 완료!")
      setTimeout(() => setVoteMsg(""), 2000)
    } catch (e) { console.error(e); setVoteMsg("오류가 발생했어요") }
    finally { setVoteLoading(false) }
  }

  const handleRevokeCert = async (certField: "emailVerified" | "phoneVerified" | "handsVerified") => {
    if (!isCurrentUserAdmin) return
    // Map certField → possible type names (including legacy "손인증")
    const typeNames: Record<string, string[]> = {
      emailVerified: ["이메일"],
      phoneVerified: ["전화번호"],
      handsVerified: ["손인증", "게임 인증"],
    }
    if (!confirm("이 인증을 취소할까요?")) return
    try {
      const userSnap = await getDoc(doc(db, "users", uid))
      if (userSnap.exists()) {
        const data = userSnap.data()
        const updates: Record<string, any> = { [certField]: false }
        const hasOtherCert = ["emailVerified", "phoneVerified", "handsVerified"]
          .filter(f => f !== certField)
          .some(f => !!data[f])
        if (!hasOtherCert) updates.verified = false
        await updateDoc(doc(db, "users", uid), updates)
      }
      await Promise.all(
        typeNames[certField].map(async (typeName) => {
          const q = query(
            collection(db, "verify_requests"),
            where("authorUid", "==", uid),
            where("type", "==", typeName),
            where("status", "==", "승인")
          )
          const snap = await getDocs(q)
          await Promise.all(snap.docs.map(d => updateDoc(d.ref, { status: "대기중" })))
        })
      )
    } catch (e) {
      console.error(e)
      alert("취소 중 오류가 발생했어요")
    }
  }

  const { left, top } = getSafePos(anchorPos.x, anchorPos.y, 240, 360)
  const alreadyVoted = currentUser && profile?.mannerVoters?.includes(currentUser.uid)
  const score = profile?.mannerScore || 0
  const scoreColor = score > 0 ? "text-green-600" : score < 0 ? "text-red-500" : "text-gray-400"
  const certCount = profile ? [profile.emailVerified, profile.phoneVerified, profile.handsVerified].filter(Boolean).length : 0
  const certItems = [
    { field: "emailVerified" as const, label: "이메일", icon: "📧", ok: profile?.emailVerified },
    { field: "phoneVerified" as const, label: "전화번호", icon: "📱", ok: profile?.phoneVerified },
    { field: "handsVerified" as const, label: "게임 인증", icon: "🎮", ok: profile?.handsVerified },
  ]

  return (
    <div ref={popupRef} style={{ position: "fixed", left, top, zIndex: 9999 }}
      className="w-60 bg-white border-2 border-[#5BA8D8] rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh]"
      onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] px-4 py-3 flex justify-between items-center">
        <span className="font-black text-white text-sm">유저 정보</span>
        <button onClick={onClose}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white text-xs font-black">✕</button>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-[#1877D4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isGuest ? (
          <div className="text-center py-3">
            <div className="text-4xl mb-2">👤</div>
            <p className="font-black text-sm text-[#0A3D6B]">{displayName}</p>
            <div className="mt-2 px-3 py-1 bg-gray-100 rounded-full inline-block">
              <span className="text-xs text-gray-500 font-bold">비회원</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">인증 정보가 없어요</p>
          </div>
        ) : isTargetAdmin ? (
          <div className="text-center py-3 space-y-3">
            <div className="text-4xl mb-1">🛡️</div>
            <p className="font-black text-sm text-red-700">운영자</p>
            <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-full inline-block">
              <span className="text-xs text-red-600 font-black">🛡️ 공식 운영자</span>
            </div>
            <p className="text-[10px] text-gray-400">매너 투표 대상이 아니에요</p>
          </div>
        ) : profile ? (
          <div className="space-y-3">
            <div className="text-center pb-3 border-b border-[#D0E8FF]">
              <div className="text-3xl mb-1">🍁</div>
              <p className="font-black text-sm text-[#0A3D6B]">{profile.nickname || displayName}</p>
              {certCount > 0 && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: certCount }).map((_, i) => <span key={i} className="text-base">⭐</span>)}
                </div>
              )}
              {profile.server && (
                <span className="text-[11px] text-[#1877D4] font-bold bg-[#EBF7FF] px-2 py-0.5 rounded-full mt-1.5 inline-block">
                  🗺 {profile.server} 서버
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">인증 내역</p>
              {certItems.map(({ field, label, icon, ok }) => (
                <div key={field}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold ${ok ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                  <span className="text-sm">{icon}</span>
                  <span className="flex-1">{label}</span>
                  <span className={`font-black ${ok ? "text-green-600" : "text-gray-300"}`}>{ok ? "✓ 완료" : "미인증"}</span>
                  {ok && isCurrentUserAdmin && (
                    <button onClick={() => handleRevokeCert(field)}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-500 text-[10px] font-black ml-1"
                      title="인증 취소">✕</button>
                  )}
                </div>
              ))}
            </div>
            <div className="border-t border-[#D0E8FF] pt-3 space-y-2">
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
              {voteMsg && <p className="text-[11px] font-bold text-center text-[#1877D4]">{voteMsg}</p>}
            </div>
          </div>
        ) : (
          <p className="text-xs text-center text-gray-400 py-4">정보를 찾을 수 없어요</p>
        )}
        {onStartDM && uid !== currentUser?.uid && (
          <button onClick={() => { onStartDM(); onClose() }}
            className="w-full mt-3 py-2.5 rounded-xl text-xs font-black bg-[#1e3a5f] text-white hover:bg-[#16304f] active:scale-95 transition-all flex items-center justify-center gap-1.5">
            💬 1:1 대화하기
          </button>
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

// ── 액션 시트 (모바일) ────────────────────────────────────
function ActionSheet({ targetMsg, isAdminUser, isTargetAdmin, onClose, onViewProfile, onStartDM, onAdminAction }: {
  targetMsg: Message; isAdminUser: boolean; isTargetAdmin: boolean
  onClose: () => void; onViewProfile: () => void; onStartDM: () => void; onAdminAction: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-end" onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        <div className="px-5 py-2 border-b border-gray-100">
          <p className="text-xs font-black text-gray-400 text-center">
            {isTargetAdmin ? `🛡️ ${targetMsg.displayName} (운영자)` : targetMsg.isGuest ? `👤 ${targetMsg.displayName}` : `🍁 ${targetMsg.displayName}`}
          </p>
        </div>
        <div className="p-3 space-y-1 pb-8">
          <button onClick={() => { onViewProfile(); onClose() }}
            className="w-full text-left px-4 py-4 rounded-2xl text-sm font-bold text-[#0A3D6B] hover:bg-[#EBF7FF] active:bg-[#D0E8FF] transition-colors flex items-center gap-3">
            <span className="text-xl">🔍</span> 정보 보기
          </button>
          <button onClick={() => { onStartDM(); onClose() }}
            className="w-full text-left px-4 py-4 rounded-2xl text-sm font-bold text-[#0A3D6B] hover:bg-[#EBF7FF] active:bg-[#D0E8FF] transition-colors flex items-center gap-3">
            <span className="text-xl">💬</span> 1:1 대화하기
          </button>
          {isAdminUser && !targetMsg.isSystem && !isTargetAdmin && (
            <button onClick={() => { onAdminAction(); onClose() }}
              className="w-full text-left px-4 py-4 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-3">
              <span className="text-xl">🛡️</span> 관리자 메뉴
            </button>
          )}
          <button onClick={onClose} className="w-full py-4 rounded-2xl text-sm font-black text-gray-400 bg-gray-50 mt-2">취소</button>
        </div>
      </div>
    </div>
  )
}

// ── 데스크탑 우클릭 메뉴 ────────────────────────────────
function ContextMenu({ pos, targetMsg, currentUid, isAdminUser, isTargetAdmin, onClose, onViewProfile, onStartDM, onAdminAction }: {
  pos: { x: number; y: number }; targetMsg: Message; currentUid: string | null
  isAdminUser: boolean; isTargetAdmin: boolean; onClose: () => void
  onViewProfile: () => void; onStartDM: () => void; onAdminAction: () => void
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
      className="w-48 bg-white border-2 border-[#5BA8D8] rounded-xl shadow-2xl overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}>
      <button onClick={() => { onViewProfile(); onClose() }}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#0A3D6B] hover:bg-[#EBF7FF] transition-colors flex items-center gap-2">
        🔍 정보 보기
      </button>
      <button onClick={() => { onStartDM(); onClose() }}
        className="w-full text-left px-4 py-3 text-sm font-bold text-[#0A3D6B] hover:bg-[#EBF7FF] transition-colors border-t border-[#D0E8FF] flex items-center gap-2">
        💬 1:1 대화하기
      </button>
      {isAdminUser && !targetMsg.isSystem && !isTargetAdmin && (
        <button onClick={() => { onAdminAction(); onClose() }}
          className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-t-2 border-red-100 flex items-center gap-2">
          🛡️ 관리자 메뉴
        </button>
      )}
    </div>
  )
}

// ── 메인 ChatRoom ─────────────────────────────────────────
export default function ChatRoom({ room = "mapleland_trade" }) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendType, setSendType] = useState<"일반" | "삽니다" | "팝니다" | "경고">("일반")
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState<string>("")
  const [guestName, setGuestName] = useState("")
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [blocked, setBlocked] = useState<{ banned: boolean; muted: boolean; until?: Date } | null>(null)
  const [dmLoading, setDmLoading] = useState(false)
  const [profilePopup, setProfilePopup] = useState<{
    uid: string; displayName: string; isGuest: boolean
    pos: { x: number; y: number }; isTargetAdmin: boolean
  } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ msg: Message; pos: { x: number; y: number } } | null>(null)
  const [actionSheet, setActionSheet] = useState<Message | null>(null)
  const [adminModal, setAdminModal] = useState<Message | null>(null)

  const adminUidCache = useRef<Map<string, boolean>>(new Map())
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const userScrolledUpRef = useRef(false)
  const initialScrollDone = useRef(false)

  // 유저가 위로 스크롤했는지 추적
  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const onScroll = () => {
      userScrolledUpRef.current = el.scrollHeight - el.scrollTop - el.clientHeight > 120
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const scrollToBottom = (force = false) => {
    if (!force && userScrolledUpRef.current) return
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const [snap, adminCheck, banned, muteStatus] = await Promise.all([
          getDoc(doc(db, "users", u.uid)),
          isAdmin(u.uid),
          isBanned(u.uid),
          getMuteStatus(u.uid),
        ])
        setIsAdminUser(adminCheck)
        if (adminCheck) {
          setUserNickname("운영자")
          setIsVerified(true)
        } else if (snap.exists()) {
          const data = snap.data()
          setUserNickname(data.nickname || "모험가")
          setIsVerified(!!data.verified)
        } else {
          setUserNickname("모험가")
          setIsVerified(false)
        }
        if (banned) { setBlocked({ banned: true, muted: false }); return }
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
    }, console.error)
    return () => unsub()
  }, [room])

  // 새로고침 시 최신 메시지로 스크롤, 이후엔 스마트 스크롤
  useEffect(() => {
    if (messages.length === 0) return
    const el = scrollContainerRef.current
    if (!el) return
    if (!initialScrollDone.current) {
      initialScrollDone.current = true
      el.scrollTop = el.scrollHeight
      return
    }
    scrollToBottom()
  }, [messages])

  const checkIsAdminUid = useCallback(async (uid: string): Promise<boolean> => {
    if (adminUidCache.current.has(uid)) return adminUidCache.current.get(uid)!
    const result = await isAdmin(uid)
    adminUidCache.current.set(uid, result)
    return result
  }, [])

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
        room, msgType: sendType, isGuest: !user, isAdminMessage: isAdminUser,
        uid: user?.uid || getOrCreateGuestUid(),
        displayName: isAdminUser ? "🛡️ 운영자" : user ? (isVerified ? userNickname : "승인 대기중 유저") : guestName.trim(),
      })
      scrollToBottom(true)
    } catch (err) { console.error("전송 실패:", err) }
  }

  const handleNameClick = async (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    if (msg.uid === user?.uid || msg.isSystem) return
    const targetIsAdmin = await checkIsAdminUid(msg.uid)
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setActionSheet(msg)
    } else {
      setContextMenu(null)
      setProfilePopup({ uid: msg.uid, displayName: msg.displayName, isGuest: msg.isGuest, pos: { x: e.clientX, y: e.clientY }, isTargetAdmin: targetIsAdmin })
    }
  }

  const handleContextMenu = async (e: React.MouseEvent, msg: Message) => {
    e.preventDefault(); e.stopPropagation()
    if (msg.uid === user?.uid || msg.isSystem) return
    setProfilePopup(null)
    setContextMenu({ msg, pos: { x: e.clientX, y: e.clientY } })
  }

  const handleViewProfile = useCallback(async (msg: Message, pos?: { x: number; y: number }) => {
    setContextMenu(null); setActionSheet(null)
    const safePos = pos || { x: window.innerWidth / 2 - 120, y: window.innerHeight / 2 - 160 }
    const targetIsAdmin = await checkIsAdminUid(msg.uid)
    requestAnimationFrame(() => setProfilePopup({ uid: msg.uid, displayName: msg.displayName, isGuest: msg.isGuest, pos: safePos, isTargetAdmin: targetIsAdmin }))
  }, [checkIsAdminUid])

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
  }, [user, userNickname, guestName, router])

  const typeStyle = {
    일반: "bg-gray-100 text-gray-700 border-gray-300",
    삽니다: "bg-blue-50 text-blue-700 border-blue-300",
    팝니다: "bg-orange-50 text-orange-700 border-orange-300",
    경고: "bg-red-50 text-red-700 border-red-300",
  }

  return (
    <div className="flex flex-col h-[650px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md"
      onClick={() => { setProfilePopup(null); setContextMenu(null) }}>

      {/* 채팅 헤더 */}
      <div className="bg-[#1e3a5f] px-5 py-3 flex items-center gap-2 rounded-t-2xl">
        <span className="text-lg">🍁</span>
        <span className="font-black text-white text-sm">메이플랜드 거래 채팅</span>
        {isAdminUser && (
          <span className="text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-full">🛡️ 관리자</span>
        )}
        <span className="ml-auto text-[11px] text-blue-300 font-bold">{messages.length}개</span>
      </div>

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

      {/* 메시지 영역 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ddeeff]">
        {messages.length === 0 && (
          <div className="text-center py-20 text-[#90C4E8] font-bold">아직 메시지가 없어요!</div>
        )}
        {messages.map((msg) => {
          const isMsgFromAdmin = !!msg.isAdminMessage

          return (
            <div key={msg.id}
              className={`flex flex-col ${msg.isSystem ? "items-center" : msg.uid === user?.uid ? "items-end" : "items-start"}`}
              onContextMenu={(e) => handleContextMenu(e, msg)}>
              {msg.isSystem ? (
                <div className="mx-auto px-4 py-1.5 bg-yellow-100 border border-yellow-400 rounded-full text-xs font-bold text-yellow-800 max-w-[90%] text-center">
                  {msg.text}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-gray-600">
                    <span
                      className={`select-none ${msg.uid !== user?.uid ? "cursor-pointer hover:underline active:opacity-60" : ""}`}
                      onClick={(e) => handleNameClick(e, msg)}>
                      {isMsgFromAdmin ? msg.displayName : msg.isGuest ? `👤 ${msg.displayName}` : `🍁 ${msg.displayName}`}
                    </span>
                    {!msg.isGuest && !isMsgFromAdmin && profileCache.has(msg.uid) && <StarBadge profile={profileCache.get(msg.uid)!} />}
                    <span className="text-gray-400 font-normal">{msg.time}</span>
                    {(isAdminUser || msg.uid === user?.uid) && !msg.isSystem && (
                      <button onClick={() => deleteMessage(msg.id)}
                        className="ml-1 text-red-300 hover:text-red-500 text-[10px]" title="삭제">✕</button>
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl text-sm font-bold border max-w-[80%] break-words ${
                    msg.msgType === "경고" ? "border-red-400 bg-red-50 text-red-800" :
                    isMsgFromAdmin ? "border-red-200 bg-red-50 text-red-800" :
                    msg.msgType === "삽니다" ? "border-blue-200 bg-blue-50 text-blue-700" :
                    msg.msgType === "팝니다" ? "border-orange-200 bg-orange-50 text-orange-700" :
                    msg.uid === user?.uid ? "border-orange-200 bg-orange-100 text-gray-800" :
                    "border-gray-200 bg-white text-gray-800"}`}>
                    {msg.msgType === "경고" && (
                      <span className="mr-1.5 px-1.5 py-0.5 rounded-md text-xs font-black bg-red-200 text-red-800">
                        🚨 경고
                      </span>
                    )}
                    {msg.msgType !== "일반" && msg.msgType !== "경고" && !isMsgFromAdmin && (
                      <span className={`mr-1.5 px-1.5 py-0.5 rounded-md text-xs font-black ${msg.msgType === "삽니다" ? "bg-blue-200 text-blue-800" : "bg-orange-200 text-orange-800"}`}>
                        [{msg.msgType}]
                      </span>
                    )}
                    {renderTextWithLinks(msg.text)}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* 입력 폼 */}
      <form onSubmit={sendMessage}
        className="p-3 bg-white border-t border-gray-200 flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}>
        {!user && (
          <input className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-sm outline-none focus:border-orange-400 bg-white"
            placeholder="닉네임 입력 (비회원)" value={guestName}
            onChange={(e) => setGuestName(e.target.value)} maxLength={20} />
        )}
        {user && (
          <div className="text-xs font-bold px-1 flex items-center gap-1">
            {isAdminUser
              ? <><span className="text-red-500">🛡️ 운영자</span><span className="text-gray-400">로 채팅 중</span></>
              : !isVerified
              ? <><span className="text-yellow-600">⏳ 승인 대기중 유저</span><span className="text-gray-400">로 채팅 중</span></>
              : <><span className="text-[#0A3D6B] font-black">🍁 {userNickname}</span><span className="text-gray-400"> 으로 채팅 중</span></>
            }
          </div>
        )}
        <div className="flex gap-1.5 items-center">
          <select value={sendType} onChange={(e) => setSendType(e.target.value as "일반" | "삽니다" | "팝니다" | "경고")}
            className={`p-2.5 rounded-xl border-2 font-black text-xs outline-none cursor-pointer transition-colors flex-shrink-0 ${typeStyle[sendType]}`}>
            <option value="일반">일반</option>
            <option value="삽니다">🔵 삽니다</option>
            <option value="팝니다">🟠 팝니다</option>
            {isAdminUser && <option value="경고">🚨 경고</option>}
          </select>
          <input className="flex-1 p-2.5 rounded-2xl border border-gray-300 font-bold text-sm outline-none focus:border-orange-400 min-w-0 bg-white"
            placeholder={blocked?.banned ? "채팅 차단됨" : blocked?.muted ? "채팅 금지됨" : "거래 내용 입력"}
            value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            disabled={!!blocked?.banned || !!blocked?.muted} />
          <button disabled={!!blocked?.banned || !!blocked?.muted}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-2xl font-black text-sm shadow-md active:scale-95 whitespace-nowrap flex-shrink-0 transition-colors">
            전송
          </button>
        </div>
      </form>

      {dmLoading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-[28px] z-50">
          <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-xl border border-gray-200">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="font-black text-sm text-gray-700">대화방 연결 중...</span>
          </div>
        </div>
      )}

      {profilePopup && (
        <ProfilePopup uid={profilePopup.uid} displayName={profilePopup.displayName}
          isGuest={profilePopup.isGuest} anchorPos={profilePopup.pos}
          onClose={() => setProfilePopup(null)} currentUser={user}
          isTargetAdmin={profilePopup.isTargetAdmin} isCurrentUserAdmin={isAdminUser}
          onStartDM={() => handleStartDM({ uid: profilePopup.uid, displayName: profilePopup.displayName, isGuest: profilePopup.isGuest } as Message)} />
      )}

      {contextMenu && (
        <ContextMenu pos={contextMenu.pos} targetMsg={contextMenu.msg}
          currentUid={user?.uid || null} isAdminUser={isAdminUser}
          isTargetAdmin={adminUidCache.current.get(contextMenu.msg.uid) === true}
          onClose={() => setContextMenu(null)}
          onViewProfile={() => handleViewProfile(contextMenu.msg, contextMenu.pos)}
          onStartDM={() => handleStartDM(contextMenu.msg)}
          onAdminAction={() => setAdminModal(contextMenu.msg)} />
      )}

      {actionSheet && (
        <ActionSheet targetMsg={actionSheet}
          isAdminUser={isAdminUser}
          isTargetAdmin={adminUidCache.current.get(actionSheet.uid) === true}
          onClose={() => setActionSheet(null)}
          onViewProfile={() => handleViewProfile(actionSheet)}
          onStartDM={() => handleStartDM(actionSheet)}
          onAdminAction={() => { setAdminModal(actionSheet); setActionSheet(null) }} />
      )}

      {adminModal && (
        <AdminModal targetMsg={adminModal} adminUid={user?.uid || ""}
          room={room} onClose={() => setAdminModal(null)} />
      )}
    </div>
  )
}
