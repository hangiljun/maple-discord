"use client"
import { useState, useEffect } from "react"
import { db } from "@/lib/firebase"
import { collection, addDoc, query, getDocs, orderBy, serverTimestamp, where } from "firebase/firestore"

export default function ReportPage() {
  const [reports, setReports] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState({ name: "", bank: "", account: "" })

  // 데이터 불러오기 (최신순 20개)
  const fetchReports = async () => {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  }

  useEffect(() => { fetchReports() }, [])

  // 제보 등록하기
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.bank || !form.account) return alert("모든 항목을 입력해주세요.")
    if (form.account.length > 6) return alert("계좌번호는 앞 6자리만 입력 가능합니다.")
    
    await addDoc(collection(db, "reports"), {
      ...form,
      createdAt: serverTimestamp()
    })
    setForm({ name: "", bank: "", account: "" })
    alert("제보가 등록되었습니다.")
    fetchReports()
  }

  // 검색 필터링
  const filteredReports = reports.filter(r => 
    r.name.includes(searchTerm) || r.account.includes(searchTerm)
  )

  return (
    <main className="max-w-4xl mx-auto p-6 text-white space-y-8">
      <h1 className="text-3xl font-bold text-red-500">사기꾼 제보 시스템</h1>

      {/* 제보 등록 폼 */}
      <section className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg font-bold mb-4">신규 제보하기</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input placeholder="이름(닉네임)" className="bg-gray-900 p-2 rounded border border-gray-600 outline-none focus:border-red-500"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <input placeholder="은행명" className="bg-gray-900 p-2 rounded border border-gray-600 outline-none focus:border-red-500"
            value={form.bank} onChange={e => setForm({...form, bank: e.target.value})} />
          <input placeholder="계좌 앞 6자리" maxLength={6} className="bg-gray-900 p-2 rounded border border-gray-600 outline-none focus:border-red-500"
            value={form.account} onChange={e => setForm({...form, account: e.target.value})} />
          <button className="bg-red-600 hover:bg-red-700 font-bold rounded p-2 transition">제보 등록</button>
        </form>
      </section>

      {/* 검색창 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg border border-orange-500">
          <span className="text-xl">🔍</span>
          <input 
            placeholder="사기꾼 이름 또는 계좌번호 앞자리를 검색하세요" 
            className="bg-transparent w-full outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 결과 리스트 */}
        <div className="space-y-2">
          {filteredReports.map((r) => (
            <div key={r.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center hover:bg-gray-700 transition">
              <div>
                <span className="font-bold text-lg mr-4">{r.name}</span>
                <span className="text-gray-400 text-sm">{r.bank} | {r.account}******</span>
              </div>
              <span className="text-xs text-gray-500">
                {r.createdAt?.toDate()?.toLocaleDateString()}
              </span>
            </div>
          ))}
          {filteredReports.length === 0 && <p className="text-center text-gray-500 py-10">검색 결과가 없습니다.</p>}
        </div>
      </section>
    </main>
  )
}