"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

export default function ReportPage() {
  const [reports, setReports] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState({ name: "", bank: "", account: "" })
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) setAdminUser(await isAdmin(u.uid))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.bank || !form.account) return alert("모든 항목을 입력해주세요.")
    if (form.account.length > 6) return alert("계좌번호는 앞 6자리만 입력 가능합니다.")
    await addDoc(collection(db, "reports"), {
      ...form,
      reporterUid: user?.uid || "guest",
      createdAt: serverTimestamp()
    })
    setForm({ name: "", bank: "", account: "" })
    alert("제보가 등록되었습니다.")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("이 제보를 삭제할까요?")) return
    await deleteDoc(doc(db, "reports", id))
  }

  const filteredReports = reports.filter(r =>
    r.name?.includes(searchTerm) || r.account?.includes(searchTerm)
  )

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-5 py-4">
          <h1 className="text-xl font-bold text-[#191F28]">사기꾼 제보</h1>
          <p className="text-[#8B95A1] text-sm mt-0.5">사기 피해를 공유해 다른 유저를 보호해요</p>
        </div>

        {/* 제보 등록 폼 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl p-5">
          <p className="font-semibold text-[#191F28] text-sm mb-4">신규 제보하기</p>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input placeholder="이름 (닉네임)"
                className="p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] placeholder:text-[#B0B8C1]"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input placeholder="은행명"
                className="p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] placeholder:text-[#B0B8C1]"
                value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} />
              <input placeholder="계좌 앞 6자리" maxLength={6}
                className="p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] placeholder:text-[#B0B8C1]"
                value={form.account} onChange={e => setForm({ ...form, account: e.target.value })} />
            </div>
            <button className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors">
              제보 등록하기
            </button>
          </form>
        </div>

        {/* 검색 */}
        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-[#E5E8EB]">
          <span className="text-[#8B95A1] text-sm">🔍</span>
          <input placeholder="이름 또는 계좌번호 앞자리 검색"
            className="bg-transparent w-full outline-none text-sm text-[#191F28] placeholder:text-[#B0B8C1]"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* 목록 */}
        <div className="space-y-2">
          {filteredReports.length === 0 ? (
            <div className="text-center py-16 text-[#8B95A1]">검색 결과가 없어요</div>
          ) : (
            filteredReports.map((r) => (
              <div key={r.id}
                className="bg-white border border-[#E5E8EB] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-red-200 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🚨</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#191F28] truncate">{r.name}</p>
                    <p className="text-xs text-[#8B95A1]">{r.bank} · {r.account}******</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-[#8B95A1] hidden md:block">
                    {r.createdAt?.toDate()?.toLocaleDateString("ko-KR")}
                  </span>
                  {adminUser && (
                    <button onClick={() => handleDelete(r.id)}
                      className="text-xs font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors">
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
