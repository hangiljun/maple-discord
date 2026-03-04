"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot, doc, getDoc, updateDoc, setDoc
} from "firebase/firestore"
import { uploadImageFile } from "@/lib/storage"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"
import ImageUploader from "@/app/components/ImageUploader"
import { getOrCreateDMRoom, sendDMMessage } from "@/lib/dm"
import DMChatWindow from "@/app/components/DMChatWindow"

type CertType = "이메일" | "전화번호" | "게임 인증"

interface VerifyRequest {
  id: string
  authorUid: string
  authorName: string
  type: CertType | "손인증"
  description: string
  imageUrl?: string
  status: "대기중" | "승인" | "거절"
  createdAt?: any
  date: string
}

const CERT_TYPES: { type: CertType; icon: string; label: string; placeholder: string; hint: string }[] = [
  {
    type: "이메일",
    icon: "📧",
    label: "이메일 인증",
    placeholder: "이메일 인증 관련 내용을 입력해주세요",
    hint: "네이버 이메일 창 캡쳐",
  },
  {
    type: "전화번호",
    icon: "📱",
    label: "전화번호 인증",
    placeholder: "전화번호를 남겨주세요",
    hint: "번호 남겨주시면 연락 드려요",
  },
  {
    type: "게임 인증",
    icon: "🎮",
    label: "게임 인증",
    placeholder: "인게임 닉네임 등을 입력해주세요",
    hint: "게임 내 스크린샷을 보내주세요",
  },
]

const statusStyle: Record<string, string> = {
  대기중: "bg-yellow-100 text-yellow-700 border-yellow-300",
  승인: "bg-green-100 text-green-700 border-green-300",
  거절: "bg-red-100 text-red-600 border-red-300",
}

function getVerifiedField(type: string) {
  if (type === "이메일") return "emailVerified"
  if (type === "전화번호") return "phoneVerified"
  return "handsVerified"
}

export default function VerifyRequestPage() {
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState("")
  const [adminUser, setAdminUser] = useState(false)
  const [requests, setRequests] = useState<VerifyRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [selectedType, setSelectedType] = useState<CertType>("이메일")
  const [form, setForm] = useState({ description: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [posting, setPosting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 15

  // 관리자 DM
  const [dmChatId, setDmChatId] = useState<string | null>(null)
  const [dmOtherName, setDmOtherName] = useState("")

  // 거절/취소 사유 모달
  const [rejectModal, setRejectModal] = useState<{ req: VerifyRequest; action: "거절" | "취소" } | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const activeCert = CERT_TYPES.find(c => c.type === selectedType)!

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
      let imageUrl: string | null = null
      if (imageFile) {
        imageUrl = await uploadImageFile(imageFile, `verify_requests/${user.uid}_${Date.now()}_${imageFile.name}`)
      }
      await addDoc(collection(db, "verify_requests"), {
        authorUid: user.uid,
        authorName: userNickname,
        type: selectedType,
        description: form.description,
        imageUrl,
        status: "대기중",
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
      setShowForm(false)
      setForm({ description: "" })
      setImageFile(null)
      setTimeout(() => setSubmitted(false), 4000)
    } catch (e: any) {
      console.error(e)
      alert("오류: " + (e?.message || String(e)))
    }
    finally { setPosting(false) }
  }

  // 승인 처리
  const handleApprove = async (req: VerifyRequest) => {
    try {
      await updateDoc(doc(db, "verify_requests", req.id), { status: "승인" })
      await setDoc(doc(db, "users", req.authorUid), {
        verified: true,
        [getVerifiedField(req.type)]: true,
      }, { merge: true })
      // 승인 DM 알림
      if (user) {
        const chatId = await getOrCreateDMRoom(user.uid, userNickname, req.authorUid, req.authorName)
        await sendDMMessage(chatId, user.uid, "🛡️ 시스템",
          `✅ ${req.authorName}님의 ${req.type} 인증이 승인되었습니다!`, req.authorUid)
      }
    } catch (e) {
      console.error("인증 처리 실패:", e)
      alert("처리 중 오류가 발생했어요")
    }
  }

  // 거절/취소 모달 열기
  const openRejectModal = (req: VerifyRequest, action: "거절" | "취소") => {
    setRejectModal({ req, action })
    setRejectReason("")
  }

  // 거절/취소 확정
  const confirmReject = async () => {
    if (!rejectModal || !user) return
    const { req, action } = rejectModal
    const reason = rejectReason.trim()
    setProcessing(true)
    try {
      if (action === "거절") {
        await updateDoc(doc(db, "verify_requests", req.id), { status: "거절" })
      } else {
        // 승인 취소
        await updateDoc(doc(db, "verify_requests", req.id), { status: "대기중" })
        const verifiedField = getVerifiedField(req.type)
        const userSnap = await getDoc(doc(db, "users", req.authorUid))
        if (userSnap.exists()) {
          const data = userSnap.data()
          const updates: Record<string, any> = { [verifiedField]: false }
          const hasOtherCert = ["emailVerified", "phoneVerified", "handsVerified"]
            .filter(f => f !== verifiedField)
            .some(f => !!data[f])
          if (!hasOtherCert) updates.verified = false
          await updateDoc(doc(db, "users", req.authorUid), updates)
        }
      }

      // 사유 DM 전송
      const chatId = await getOrCreateDMRoom(user.uid, userNickname, req.authorUid, req.authorName)
      const msg = action === "거절"
        ? `❌ ${req.authorName}님은 ${reason ? reason : "사유 미기재"} 사유로 인증이 거절되었습니다.`
        : `🔔 ${req.authorName}님의 인증 승인이 취소되었습니다.${reason ? ` 사유: ${reason}` : ""}`
      await sendDMMessage(chatId, user.uid, "🛡️ 시스템", msg, req.authorUid)

      setRejectModal(null)
    } catch (e: any) {
      alert("오류: " + e?.message)
    } finally {
      setProcessing(false)
    }
  }

  // 관리자 DM 열기
  const handleOpenDM = async (req: VerifyRequest) => {
    if (!user) return
    try {
      const chatId = await getOrCreateDMRoom(user.uid, userNickname, req.authorUid, req.authorName)
      setDmOtherName(req.authorName)
      setDmChatId(chatId)
    } catch (e: any) {
      alert("DM 열기 실패: " + e?.message)
    }
  }

  // ── 일반 유저 화면 ─────────────────────────────────────
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#D6EEFF] p-4 md:p-10">
        <div className="max-w-md mx-auto space-y-5">

          {/* 헤더 */}
          <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 text-center shadow-lg">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-2xl font-black text-white">인증 신청</h1>
            <p className="text-sm text-sky-200 font-bold mt-1">인증을 받으면 닉네임 변경 + 인증 뱃지가 생겨요!</p>
          </div>

          {/* 인증 종류 선택 카드 */}
          <div className="space-y-2">
            {CERT_TYPES.map((cert) => (
              <button key={cert.type}
                onClick={() => { setSelectedType(cert.type); setShowForm(false); setForm({ description: "" }); setImageFile(null) }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all shadow-sm
                  ${selectedType === cert.type
                    ? "border-[#1877D4] bg-white shadow-md ring-2 ring-[#1877D4]/20"
                    : "border-[#5BA8D8] bg-white hover:bg-[#EBF7FF]"}`}>
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl text-2xl flex-shrink-0 ${selectedType === cert.type ? "bg-[#1877D4]" : "bg-[#EBF7FF]"}`}>
                  {cert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-[#0A3D6B] text-sm">{cert.label}</p>
                  <p className="text-xs text-[#1877D4] font-bold mt-0.5">{cert.hint}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selectedType === cert.type ? "border-[#1877D4] bg-[#1877D4]" : "border-gray-300"}`}>
                  {selectedType === cert.type && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>

          {/* 신청 완료 메시지 */}
          {submitted && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
              <p className="font-black text-green-700 text-sm">✅ 신청이 완료됐어요!</p>
              <p className="text-xs text-green-600 font-bold mt-1">관리자가 검토 후 처리할게요</p>
            </div>
          )}

          {/* 로그인 필요 */}
          {!user && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
              <p className="font-black text-amber-700 text-sm">⚠️ 로그인이 필요해요</p>
              <a href="/login" className="text-xs text-amber-600 underline font-bold">로그인하러 가기</a>
            </div>
          )}

          {/* 신청 버튼 & 폼 */}
          {user && !submitted && (
            <>
              <button onClick={() => setShowForm(!showForm)}
                className="w-full py-3.5 bg-[#1877D4] hover:bg-[#0D47A1] text-white rounded-2xl font-black shadow-md active:scale-95 transition-colors">
                {showForm ? "✕ 취소" : `✏️ ${activeCert.label} 신청하기`}
              </button>

              {showForm && (
                <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-4 shadow-md">
                  <div className="flex items-center gap-3 p-3 bg-[#EBF7FF] rounded-xl border border-[#90C4E8]">
                    <span className="text-2xl">{activeCert.icon}</span>
                    <div>
                      <p className="font-black text-[#0A3D6B] text-sm">{activeCert.label}</p>
                      <p className="text-[11px] text-[#1877D4] font-bold">{activeCert.hint}</p>
                    </div>
                  </div>

                  <p className="font-black text-[#0A3D6B] text-xs">🍁 {userNickname} 님의 신청</p>

                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={activeCert.placeholder}
                    rows={4}
                    className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4] resize-none" />

                  <div className="space-y-1.5">
                    <p className="text-xs font-black text-[#0A3D6B]">📸 사진 첨부 (선택)</p>
                    <ImageUploader onFile={setImageFile} />
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-sky-50 border-2 border-sky-200 rounded-xl">
                    <span className="text-sm mt-0.5">🔒</span>
                    <p className="text-xs text-sky-700 font-bold">신청 내용은 관리자만 볼 수 있습니다</p>
                  </div>

                  <button onClick={handleSubmit} disabled={posting}
                    className="w-full py-3 bg-[#1877D4] disabled:bg-gray-300 hover:bg-[#0D47A1] text-white rounded-2xl font-black text-sm transition-colors">
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

  // ── 관리자 화면 ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#D6EEFF] p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 shadow-lg">
          <h1 className="text-2xl font-black text-white">🛡️ 인증 신청 관리</h1>
          <p className="text-sm text-sky-200 font-bold mt-1">총 {requests.length}건</p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 text-[#5BA8D8] font-bold">신청 내역이 없어요</div>
        ) : (
          <div className="space-y-4">
            {requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((req) => (
              <div key={req.id} className="bg-white border-2 border-[#5BA8D8] rounded-2xl overflow-hidden shadow-md">

                {/* 카드 헤더 */}
                <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-sm">🍁 {req.authorName}</span>
                    <span className="text-[10px] bg-white/20 text-white font-black px-2 py-0.5 rounded-full">
                      {req.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border-2 ${statusStyle[req.status]}`}>
                      {req.status}
                    </span>
                    <span className="text-[10px] text-sky-200 font-bold">{req.date}</span>
                  </div>
                </div>

                {/* 신청 내용 */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-[#0A3D6B] font-bold bg-[#EBF7FF] p-3 rounded-xl whitespace-pre-wrap">
                    {req.description}
                  </p>

                  {/* 첨부 이미지 */}
                  {req.imageUrl && (
                    <div className="rounded-xl overflow-hidden border-2 border-[#90C4E8] bg-[#EBF7FF]">
                      <img src={req.imageUrl} alt="첨부 이미지"
                        className="w-full max-h-64 object-contain"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          if (el.parentElement) el.parentElement.style.display = "none"
                        }} />
                    </div>
                  )}

                  {/* 처리 버튼 */}
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenDM(req)}
                      className="px-3 py-2.5 bg-[#EBF7FF] hover:bg-[#D0E8FF] text-[#1877D4] rounded-xl font-black text-sm transition-colors border-2 border-[#90C4E8]">
                      💬 대화
                    </button>
                    {req.status === "대기중" && (
                      <>
                        <button onClick={() => handleApprove(req)}
                          className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm transition-colors">
                          ✅ 승인
                        </button>
                        <button onClick={() => openRejectModal(req, "거절")}
                          className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black text-sm transition-colors">
                          ❌ 거절
                        </button>
                      </>
                    )}
                    {req.status === "승인" && (
                      <button onClick={() => openRejectModal(req, "취소")}
                        className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black text-sm transition-colors">
                        ❌ 승인 취소
                      </button>
                    )}
                    {req.status === "거절" && (
                      <button onClick={() => handleApprove(req)}
                        className="flex-1 py-2.5 bg-[#1877D4] hover:bg-[#0D47A1] text-white rounded-xl font-black text-sm transition-colors">
                        🔄 재처리 (승인)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 페이지네이션 */}
            {Math.ceil(requests.length / PAGE_SIZE) > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl font-black text-sm bg-white border-2 border-[#5BA8D8] text-[#1877D4] disabled:opacity-40 hover:bg-[#EBF7FF] transition-colors">
                  ← 이전
                </button>
                {Array.from({ length: Math.ceil(requests.length / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl font-black text-sm border-2 transition-colors ${p === currentPage ? "bg-[#1877D4] text-white border-[#1877D4]" : "bg-white text-[#1877D4] border-[#5BA8D8] hover:bg-[#EBF7FF]"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(requests.length / PAGE_SIZE), p + 1))}
                  disabled={currentPage === Math.ceil(requests.length / PAGE_SIZE)}
                  className="px-4 py-2 rounded-xl font-black text-sm bg-white border-2 border-[#5BA8D8] text-[#1877D4] disabled:opacity-40 hover:bg-[#EBF7FF] transition-colors">
                  다음 →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 거절/취소 사유 모달 */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-black text-[#0A3D6B] text-base">
              {rejectModal.action === "거절" ? "❌ 거절 사유 입력" : "❌ 승인 취소 사유 입력"}
            </h3>
            <p className="text-xs text-gray-500 font-bold">
              입력한 사유가 <span className="text-[#1877D4]">{rejectModal.req.authorName}</span>님 DM으로 자동 전달됩니다.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="예: 제출하신 사진이 불명확합니다"
              rows={3}
              className="w-full p-3 border-2 border-[#90C4E8] rounded-xl text-sm font-bold outline-none focus:border-[#1877D4] resize-none"
            />
            <div className="flex gap-2">
              <button onClick={confirmReject} disabled={processing}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl font-black text-sm transition-colors">
                {processing ? "처리 중..." : "확인"}
              </button>
              <button onClick={() => setRejectModal(null)} disabled={processing}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black text-sm transition-colors">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1:1 DM 오버레이 */}
      {dmChatId && user && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="w-full md:max-w-md h-[70vh] md:h-[600px] bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <DMChatWindow
              chatId={dmChatId}
              myUid={user.uid}
              myName={userNickname}
              otherName={dmOtherName}
              onBack={() => setDmChatId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
