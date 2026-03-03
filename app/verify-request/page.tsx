"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, getDoc, updateDoc
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

interface VerifyRequest {
  id: string
  authorUid: string
  authorName: string
  type: "이메일" | "전화번호" | "손인증"
  description: string
  status: "대기중" | "승인" | "거절"
  createdAt?: any
  date: string
}

export default function VerifyRequestPage() {
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState("")
  const [adminUser, setAdminUser] = useState(false)
  const [requests, setRequests] = useState<VerifyRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: "이메일" as VerifyRequest["type"], description: "" })
  const [posting, setPosting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        setAdminUser(await isAdmin(u.uid))
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) setUserNickname(snap.data().nickname || u.email?.split("@")[0] || "모험가")
        } catch { setUserNickname(u.email?.split("@")[0] || "모험가") }
      }
    })
    return () => unsub()
  }, [])

  // 관리자만 목록 조회
  useEffect(() => {
    if (!adminUser) return
    const q = query(collection(db, "verify_requests"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => {
        const data = d.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR") || ""
        return { id: d.id, ...data, date } as VerifyRequest
      }))
    })
  }, [adminUser])

  const handleSubmit = async () => {
    if (!user) { alert("로그인 후 신청해주세요"); return }
    if (!form.description.trim()) { alert("내용을 입력해주세요"); return }
    setPosting(true)
    try {
      await addDoc(collection(db, "verify_requests"), {
        authorUid: user.uid,
        authorName: userNickname,
        type: form.type,
        description: form.description,
        status: "대기중",
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
      setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setPosting(false) }
  }

  const handleStatus = async (id: string, status: "승인" | "거절") => {
    await updateDoc(doc(db, "verify_requests", id), { status })
  }

  const statusStyle: Record<string, string> = {
    대기중: "bg-yellow-100 text-yellow-700 border-yellow-300",
    승인: "bg-green-100 text-green-700 border-green-300",
    거절: "bg-red-100 text-red-600 border-red-300",
  }

  // ── 일반 유저 화면 ──
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] p-4 md:p-10 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">

          <div className="text-center">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-black text-[#E67E22]">인증 신청</h1>
            <p className="text-sm text-[#A64D13] font-bold mt-2">인증을 신청하면 관리자가 검토 후 처리해요</p>
          </div>

          {/* 인증 종류 설명 */}
          <div className="bg-white border-2 border-[#FFD8A8] rounded-3xl p-5 space-y-3">
            <p className="font-black text-[#A64D13] text-sm mb-3">📋 인증 종류</p>
            {[
              { icon: "📧", label: "이메일 인증", desc: "이메일 주소를 통한 본인 확인" },
              { icon: "📱", label: "전화번호 인증", desc: "전화번호를 통한 본인 확인" },
              { icon: "🤝", label: "손 인증", desc: "실제 손 사진을 통한 본인 확인" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-[#FFF9F2] rounded-2xl">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-black text-sm text-[#5D4037]">{item.label}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 신청 완료 메시지 */}
          {submitted && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
              <p className="font-black text-green-700 text-sm">✅ 신청이 완료됐어요!</p>
              <p className="text-xs text-green-600 font-bold mt-1">관리자가 검토 후 처리할게요</p>
            </div>
          )}

          {/* 안내 박스 (비로그인) */}
          {!user && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
              <p className="font-black text-amber-700 text-sm">⚠️ 로그인이 필요해요</p>
              <a href="/login" className="text-xs text-amber-600 underline font-bold">로그인하러 가기</a>
            </div>
          )}

          {/* 신청 버튼 */}
          {user && !submitted && (
            <>
              <button onClick={() => setShowForm(!showForm)}
                className="w-full py-3.5 bg-[#E67E22] text-white rounded-2xl font-black shadow-md active:scale-95">
                {showForm ? "취소" : "✏️ 인증 신청하기"}
              </button>

              {showForm && (
                <div className="bg-white border-2 border-[#FFD8A8] rounded-3xl p-5 space-y-3">
                  <p className="font-black text-[#A64D13] text-sm">🍁 {userNickname} 님의 신청</p>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VerifyRequest["type"] })}
                    className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none bg-[#FFF9F2]">
                    <option value="이메일">📧 이메일 인증</option>
                    <option value="전화번호">📱 전화번호 인증</option>
                    <option value="손인증">🤝 손 인증</option>
                  </select>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="인증 관련 내용을 입력해주세요 (이메일 주소, 전화번호 등)" rows={4}
                    className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] resize-none" />
                  {/* 안내 문구 */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                    <span className="text-sm mt-0.5">🔒</span>
                    <p className="text-xs text-blue-700 font-bold">신청 내용은 관리자만 볼 수 있습니다</p>
                  </div>
                  <button onClick={handleSubmit} disabled={posting}
                    className="w-full py-3 bg-[#E67E22] disabled:bg-gray-300 text-white rounded-2xl font-black text-sm">
                    {posting ? "신청 중..." : "신청하기"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // ── 관리자 화면 ──
  return (
    <div className="min-h-screen bg-[#FFF9F2] p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="text-2xl font-black text-[#E67E22]">인증 신청 관리</h1>
            <p className="text-sm text-[#A64D13] font-bold">총 {requests.length}건</p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">신청 내역이 없어요</div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white border-2 border-[#FFD8A8] rounded-2xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#5D4037]">🍁 {req.authorName}</span>
                    <span className="text-[10px] bg-[#FFF4E6] text-[#E67E22] font-black px-2 py-0.5 rounded-full border border-[#FFD8A8]">
                      {req.type} 인증
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border-2 ${statusStyle[req.status]}`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{req.date}</span>
                  </div>
                </div>
                <p className="text-sm text-[#5D4037] font-bold bg-[#FFF9F2] p-3 rounded-xl whitespace-pre-wrap">
                  {req.description}
                </p>
                {req.status === "대기중" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleStatus(req.id, "승인")}
                      className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm transition-colors">
                      ✅ 승인
                    </button>
                    <button onClick={() => handleStatus(req.id, "거절")}
                      className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-colors">
                      ❌ 거절
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}