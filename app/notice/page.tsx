"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { db, auth } from "@/lib/firebase"
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, updateDoc
} from "firebase/firestore"
import { uploadImageFile } from "@/lib/storage"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"
import ImageUploader from "@/app/components/ImageUploader"

interface Notice {
  id: string
  title: string
  content: string
  category: "패치노트" | "변경사항" | "공지"
  imageUrl?: string
  createdAt?: any
  date: string
  authorUid?: string
}

const CATEGORIES: Notice["category"][] = ["공지", "패치노트", "변경사항"]

const categoryStyle: Record<string, string> = {
  패치노트: "bg-blue-100 text-blue-700 border-blue-300",
  변경사항: "bg-purple-100 text-purple-700 border-purple-300",
  공지: "bg-amber-100 text-amber-700 border-amber-300",
}

const categoryIcon: Record<string, string> = {
  패치노트: "🔧",
  변경사항: "📝",
  공지: "📢",
}

const EMPTY_FORM = { title: "", content: "", category: "공지" as Notice["category"] }

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [posting, setPosting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string>("")

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

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setImageFile(null)
    setExistingImageUrl("")
    setShowForm(false)
    setEditingId(null)
  }

  const handleImageFile = (file: File | null) => {
    setImageFile(file)
    if (!file) setExistingImageUrl("")
  }

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) { alert("제목과 내용을 입력해주세요"); return }
    setPosting(true)
    try {
      let imageUrl: string | null = existingImageUrl || null
      if (imageFile) {
        imageUrl = await uploadImageFile(imageFile, `notices/${Date.now()}_${imageFile.name}`)
      }
      if (editingId) {
        await updateDoc(doc(db, "notices", editingId), {
          title: form.title,
          content: form.content,
          category: form.category,
          imageUrl,
        })
      } else {
        await addDoc(collection(db, "notices"), {
          title: form.title,
          content: form.content,
          category: form.category,
          imageUrl,
          createdAt: serverTimestamp(),
          authorUid: user?.uid,
        })
      }
      resetForm()
    } catch (e: any) {
      console.error(e)
      alert("오류: " + (e?.message || String(e)))
    }
    finally { setPosting(false) }
  }

  const handleEdit = (notice: Notice) => {
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
    })
    setExistingImageUrl(notice.imageUrl || "")
    setImageFile(null)
    setEditingId(notice.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("공지를 삭제할까요?")) return
    await deleteDoc(doc(db, "notices", id))
  }


  return (
    <div className="min-h-screen bg-[#D6EEFF] p-4 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white">📢 공지사항</h1>
            <p className="text-sm text-sky-200 font-bold mt-1">운영 공지 및 패치노트를 확인하세요</p>
          </div>
          {adminUser && (
            <button onClick={() => { if (showForm && !editingId) { resetForm() } else { resetForm(); setShowForm(true) } }}
              className="bg-white text-[#1877D4] px-5 py-2.5 rounded-xl font-black text-sm shadow-md active:scale-95 hover:bg-sky-50 transition-colors">
              {showForm && !editingId ? "✕ 취소" : "✏️ 공지 작성"}
            </button>
          )}
        </div>

        {/* 관리자 작성/수정 폼 */}
        {adminUser && showForm && (
          <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-3 shadow-md">
            <p className="font-black text-[#0A3D6B] text-sm">
              🛡️ {editingId ? "공지 수정" : "새 공지 작성"}
            </p>

            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Notice["category"] })}
              className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none bg-[#EBF7FF] focus:border-[#1877D4]">
              {CATEGORIES.map(c => <option key={c} value={c}>{categoryIcon[c]} {c}</option>)}
            </select>

            <input value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력해주세요"
              className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4]" />

            <div>
              <p className="text-xs font-black text-[#0A3D6B] mb-1.5">📸 이미지 첨부 (선택)</p>
              <ImageUploader onFile={handleImageFile} initialPreview={existingImageUrl} />
            </div>

            <textarea value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="공지 내용을 입력하세요" rows={6}
              className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4] resize-none" />

            <div className="flex gap-2">
              <button onClick={handlePost} disabled={posting}
                className="flex-1 py-3 bg-[#1877D4] disabled:bg-gray-300 hover:bg-[#0D47A1] text-white rounded-xl font-black text-sm transition-colors">
                {posting ? "저장 중..." : (editingId ? "✅ 수정 완료" : "📢 공지 등록")}
              </button>
              <button onClick={resetForm}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-black text-sm transition-colors">
                취소
              </button>
            </div>
          </div>
        )}

        {/* 공지 목록 — 카드 레이아웃 */}
        {notices.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-[#5BA8D8] font-bold">아직 공지사항이 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((notice) => (
              <Link key={notice.id} href={`/notice/${notice.id}`}
                className="bg-white border-2 border-[#5BA8D8] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow flex flex-col cursor-pointer">

                {/* 카드 헤더 */}
                <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${categoryStyle[notice.category]}`}>
                      {categoryIcon[notice.category]} {notice.category}
                    </span>
                    <span className="text-[10px] text-sky-200 font-bold">{notice.date}</span>
                  </div>
                  {adminUser && (
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(notice) }}
                        className="text-xs text-sky-300 hover:text-white px-1.5 py-0.5 rounded transition-colors font-black"
                        title="수정">✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(notice.id) }}
                        className="text-xs text-red-300 hover:text-red-400 px-1.5 py-0.5 rounded transition-colors font-black"
                        title="삭제">🗑️</button>
                    </div>
                  )}
                </div>

                {/* 이미지 */}
                {notice.imageUrl && (
                  <div className="w-full aspect-video overflow-hidden bg-[#EBF7FF]">
                    <img
                      src={notice.imageUrl}
                      alt={notice.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        if (el.parentElement) el.parentElement.style.display = "none"
                      }}
                    />
                  </div>
                )}

                {/* 본문 */}
                <div className="p-4 flex flex-col flex-1 space-y-2">
                  <h3 className="font-black text-[#0A3D6B] text-sm leading-snug">{notice.title}</h3>
                  <p className="text-xs text-[#5D4037] font-bold leading-relaxed whitespace-pre-wrap flex-1 line-clamp-4">
                    {notice.content}
                  </p>
                  <span className="text-[11px] text-[#1877D4] font-black mt-1">자세히 보기 →</span>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
