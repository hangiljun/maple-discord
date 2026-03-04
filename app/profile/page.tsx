"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

interface UserProfile {
  nickname?: string
  server?: string
  verified?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
  handsVerified?: boolean
  mannerScore?: number
}

const SERVER_OPTIONS = ["메이플스토리", "메이플랜드"]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [adminUser, setAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newNickname, setNewNickname] = useState("")
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [editingServer, setEditingServer] = useState(false)
  const [newServer, setNewServer] = useState("")
  const [savingServer, setSavingServer] = useState(false)

  useEffect(() => {
    let profileUnsub: (() => void) | undefined
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      profileUnsub?.()
      profileUnsub = undefined
      if (u) {
        const adminCheck = await isAdmin(u.uid)
        setAdminUser(adminCheck)
        profileUnsub = onSnapshot(doc(db, "users", u.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile
            setProfile(data)
            setNewNickname(prev => prev || data.nickname || "")
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
    return () => { unsub(); profileUnsub?.() }
  }, [])

  const handleSaveNickname = async () => {
    if (!user || !newNickname.trim()) return
    if (newNickname.trim().length < 2) { setSaveMsg("닉네임은 2글자 이상이어야 해요"); return }
    setSaving(true)
    try {
      await updateDoc(doc(db, "users", user.uid), { nickname: newNickname.trim() })
      setProfile(prev => prev ? { ...prev, nickname: newNickname.trim() } : prev)
      setSaveMsg("✅ 닉네임이 변경됐어요!")
      setEditing(false)
    } catch { setSaveMsg("❌ 저장에 실패했어요") }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000) }
  }

  const handleSaveServer = async () => {
    if (!user) return
    setSavingServer(true)
    try {
      await setDoc(doc(db, "users", user.uid), { server: newServer || null }, { merge: true })
      setProfile(prev => prev ? { ...prev, server: newServer || undefined } : prev)
      setEditingServer(false)
    } catch { alert("저장에 실패했어요") }
    finally { setSavingServer(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D6EEFF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1877D4] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#D6EEFF] p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl">🔐</div>
          <p className="font-black text-[#0A3D6B] text-lg">로그인이 필요해요</p>
          <a href="/login" className="inline-block bg-[#1877D4] text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md">로그인하러 가기</a>
        </div>
      </div>
    )
  }

  const canEditNickname = adminUser || !!profile?.verified ||
    !!(profile?.emailVerified || profile?.phoneVerified || profile?.handsVerified)
  const certCount = profile ? [profile.emailVerified, profile.phoneVerified, profile.handsVerified].filter(Boolean).length : 0
  const score = profile?.mannerScore || 0

  return (
    <div className="min-h-screen bg-[#D6EEFF] p-4 md:p-10">
      <div className="max-w-md mx-auto space-y-5">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 text-center shadow-lg">
          <div className="text-5xl mb-2">🍁</div>
          <h1 className="text-2xl font-black text-white">내 프로필</h1>
          <p className="text-sm text-sky-200 font-bold mt-1">{user.email}</p>
        </div>

        {/* 닉네임 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-[#0A3D6B] uppercase tracking-wide">닉네임</p>
            {canEditNickname && !editing && !adminUser && (
              <button onClick={() => setEditing(true)}
                className="text-xs font-black text-[#1877D4] bg-[#EBF7FF] px-3 py-1 rounded-full border border-[#90C4E8] hover:bg-[#D0E8FF] transition-colors">
                ✏️ 수정
              </button>
            )}
          </div>

          {editing ? (
            <div className="flex gap-2">
              <input value={newNickname} onChange={(e) => setNewNickname(e.target.value)}
                maxLength={20} placeholder="새 닉네임"
                className="flex-1 p-2.5 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4]" />
              <button onClick={handleSaveNickname} disabled={saving}
                className="px-4 py-2.5 bg-[#1877D4] disabled:bg-gray-300 text-white rounded-xl font-black text-sm">
                저장
              </button>
              <button onClick={() => { setEditing(false); setNewNickname(profile?.nickname || "") }}
                className="px-3 py-2.5 bg-gray-100 rounded-xl font-black text-sm text-gray-500">
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-black text-[#0A3D6B] text-base">
                {adminUser ? "🛡️ 운영자" : profile?.nickname || "모험가"}
              </p>
              {certCount > 0 && <span className="text-sm">{"⭐".repeat(certCount)}</span>}
            </div>
          )}

          {saveMsg && <p className="text-xs font-bold text-[#1877D4]">{saveMsg}</p>}

          {!canEditNickname && (
            <p className="text-[11px] text-gray-400 font-bold bg-[#EBF7FF] px-3 py-2 rounded-xl">
              💡 인증을 받으면 닉네임을 변경할 수 있어요 →{" "}
              <a href="/verify-request" className="text-[#1877D4] underline font-black">인증 신청하기</a>
            </p>
          )}
        </div>

        {/* 게임 서버 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-[#0A3D6B] uppercase tracking-wide">게임 서버</p>
            {!editingServer && (
              <button
                onClick={() => { setEditingServer(true); setNewServer(profile?.server || "") }}
                className="text-xs font-black text-[#1877D4] bg-[#EBF7FF] px-3 py-1 rounded-full border border-[#90C4E8] hover:bg-[#D0E8FF] transition-colors">
                ✏️ 변경
              </button>
            )}
          </div>

          {editingServer ? (
            <div className="flex gap-2">
              <select value={newServer} onChange={(e) => setNewServer(e.target.value)}
                className="flex-1 p-2.5 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4] bg-[#EBF7FF]">
                <option value="">선택 안함</option>
                {SERVER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleSaveServer} disabled={savingServer}
                className="px-4 py-2.5 bg-[#1877D4] disabled:bg-gray-300 text-white rounded-xl font-black text-sm">
                저장
              </button>
              <button onClick={() => setEditingServer(false)}
                className="px-3 py-2.5 bg-gray-100 rounded-xl font-black text-sm text-gray-500">
                취소
              </button>
            </div>
          ) : (
            <p className="font-black text-[#0A3D6B] text-base">
              {profile?.server ? `🗺 ${profile.server}` : "미설정"}
            </p>
          )}
        </div>

        {/* 인증 현황 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-3 shadow-md">
          <p className="text-xs font-black text-[#0A3D6B] uppercase tracking-wide">인증 현황</p>
          {[
            { ok: profile?.emailVerified, label: "이메일 인증", icon: "📧" },
            { ok: profile?.phoneVerified, label: "전화번호 인증", icon: "📱" },
            { ok: profile?.handsVerified, label: "게임 인증", icon: "🎮" },
          ].map(({ ok, label, icon }) => (
            <div key={label}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 ${ok ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
              <span className="text-lg">{icon}</span>
              <span className={`flex-1 font-bold text-sm ${ok ? "text-green-700" : "text-gray-400"}`}>{label}</span>
              <span className={`text-xs font-black ${ok ? "text-green-600" : "text-gray-300"}`}>{ok ? "✓ 완료" : "미인증"}</span>
            </div>
          ))}
          <a href="/verify-request"
            className="block w-full text-center py-3 bg-[#EBF7FF] border-2 border-[#5BA8D8] text-[#1877D4] rounded-2xl font-black text-sm hover:bg-[#D0E8FF] transition-colors">
            ✏️ 인증 신청하기
          </a>
        </div>

        {/* 매너 점수 */}
        <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-[#0A3D6B] uppercase tracking-wide">매너 점수</p>
            <span className={`text-xl font-black ${score > 0 ? "text-green-600" : score < 0 ? "text-red-500" : "text-gray-400"}`}>
              {score > 0 ? `+${score}` : score}점
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
