"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

interface Notice {
  id: string
  title: string
  content: string
  category: "패치노트" | "변경사항" | "공지"
  createdAt?: any
  date: string
}

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState(false)
  // 관리자 작성 폼
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", content: "", category: "공지" as Notice["category"] })
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) setAdminUser(await isAdmin(u.uid))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => {
      setNotices(snap.docs.map(d => {
        const data = d.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR") || ""
        return { id: d.id, ...data, date } as Notice
      }))
    })
  }, [])

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) { alert("제목과 내용을 입력해주세요"); return }
    setPosting(true)
    try {
      await addDoc(collection(db, "notices"), {
        ...form,
        createdAt: serverTimestamp(),
        authorUid: user.uid,
      })
      setForm({ title: "", content: "", category: "공지" })
      setShowForm(false)
    } catch (e) { console.error(e) }
    finally { setPosting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("공지를 삭제할까요?")) return
    await deleteDoc(doc(db, "notices", id))
  }

  const categoryStyle: Record<string, string> = {
    패치노트: "bg-blue-100 text-blue-700 border-blue-300",
    변경사항: "bg-purple-100 text-purple-700 border-purple-300",
    공지: "bg-[#FFF4E6] text-[#E67E22] border-[#FFD8A8]",
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#E67E22]">📢 공지사항</h1>
            <p className="text-sm text-[#A64D13] font-bold mt-1">패치노트 및 변경사항을 확인하세요</p>
          </div>
          {adminUser && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-[#E67E22] text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-md active:scale-95">
              {showForm ? "취소" : "✏️ 공지 작성"}
            </button>
          )}
        </div>

        {/* 관리자 작성 폼 */}
        {adminUser && showForm && (
          <div className="bg-white border-2 border-[#FFD8A8] rounded-3xl p-5 space-y-3 shadow-sm">
            <p className="font-black text-[#A64D13] text-sm">🛡️ 공지 작성</p>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Notice["category"] })}
              className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none bg-[#FFF9F2]">
              <option value="공지">공지</option>
              <option value="패치노트">패치노트</option>
              <option value="변경사항">변경사항</option>
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목" className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22]" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요" rows={5}
              className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] resize-none" />
            <button onClick={handlePost} disabled={posting}
              className="w-full py-3 bg-[#E67E22] disabled:bg-gray-300 text-white rounded-2xl font-black text-sm">
              {posting ? "작성 중..." : "공지 등록"}
            </button>
          </div>
        )}

        {/* 공지 목록 */}
        {notices.length === 0 ? (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">아직 공지사항이 없어요</div>
        ) : (
          <div className="space-y-3">
            {notices.map((notice) => (
              <div key={notice.id} className="bg-white border-2 border-[#FFD8A8] rounded-2xl overflow-hidden shadow-sm">
                {/* 제목 행 */}
                <button onClick={() => setExpanded(expanded === notice.id ? null : notice.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#FFF9F2] transition-colors">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border-2 flex-shrink-0 ${categoryStyle[notice.category]}`}>
                    {notice.category}
                  </span>
                  <span className="flex-1 font-black text-sm text-[#5D4037] truncate">{notice.title}</span>
                  <span className="text-[10px] text-gray-400 font-bold flex-shrink-0">{notice.date}</span>
                  <span className={`text-gray-400 text-xs transition-transform ${expanded === notice.id ? "rotate-180" : ""}`}>▼</span>
                  {adminUser && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(notice.id) }}
                      className="text-red-300 hover:text-red-500 text-xs font-black ml-1 flex-shrink-0">✕</button>
                  )}
                </button>
                {/* 본문 */}
                {expanded === notice.id && (
                  <div className="px-5 pb-5 pt-2 border-t-2 border-[#FFE8CC]">
                    <p className="text-sm text-[#5D4037] font-bold whitespace-pre-wrap leading-relaxed">{notice.content}</p>
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