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
  imageUrls?: string[]
  imageUrl?: string  // 하위 호환
  createdAt?: any
  date: string
  authorUid?: string
}

const CATEGORIES: Notice["category"][] = ["공지", "패치노트", "변경사항"]

const categoryStyle: Record<string, string> = {
  패치노트: "bg-blue-50 text-blue-600 border-blue-200",
  변경사항: "bg-purple-50 text-purple-600 border-purple-200",
  공지: "bg-amber-50 text-amber-600 border-amber-200",
}

const categoryIcon: Record<string, string> = {
  패치노트: "🔧",
  변경사항: "📝",
  공지: "📢",
}

const EMPTY_FORM = { title: "", content: "", category: "공지" as Notice["category"] }

function getImages(notice: Notice): string[] {
  if (notice.imageUrls && notice.imageUrls.length > 0) return notice.imageUrls
  if (notice.imageUrl) return [notice.imageUrl]
  return []
}

export default function NoticePage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [posting, setPosting] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])

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
    setImageFiles([])
    setExistingImageUrls([])
    setShowForm(false)
    setEditingId(null)
  }

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) { alert("제목과 내용을 입력해주세요"); return }
    setPosting(true)
    try {
      const uploadedUrls = await Promise.all(
        imageFiles.map(f => uploadImageFile(f, `notices/${Date.now()}_${f.name}`))
      )
      const imageUrls = [...existingImageUrls, ...uploadedUrls].filter(Boolean)

      if (editingId) {
        await updateDoc(doc(db, "notices", editingId), {
          title: form.title,
          content: form.content,
          category: form.category,
          imageUrls,
          imageUrl: null,
        })
      } else {
        await addDoc(collection(db, "notices"), {
          title: form.title,
          content: form.content,
          category: form.category,
          imageUrls,
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
    setExistingImageUrls(getImages(notice))
    setImageFiles([])
    setEditingId(notice.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("공지를 삭제할까요?")) return
    await deleteDoc(doc(db, "notices", id))
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#191F28]">공지사항</h1>
            <p className="text-[#8B95A1] text-sm mt-0.5">운영 공지 및 패치노트를 확인하세요</p>
          </div>
          {adminUser && (
            <button onClick={() => { if (showForm && !editingId) { resetForm() } else { resetForm(); setShowForm(true) } }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                showForm && !editingId
                  ? "bg-[#F2F4F6] text-[#8B95A1] hover:bg-[#E5E8EB]"
                  : "bg-[#3182F6] text-white hover:bg-[#1C6EE8]"
              }`}>
              {showForm && !editingId ? "취소" : "공지 작성"}
            </button>
          )}
        </div>

        {/* 관리자 작성/수정 폼 */}
        {adminUser && showForm && (
          <div className="bg-white border border-[#E5E8EB] rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-[#191F28] text-sm">
              {editingId ? "공지 수정" : "새 공지 작성"}
            </p>

            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Notice["category"] })}
              className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] bg-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{categoryIcon[c]} {c}</option>)}
            </select>

            <input value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목을 입력해주세요"
              className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] placeholder:text-[#B0B8C1]" />

            <textarea value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="공지 내용을 입력하세요" rows={6}
              className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] resize-none placeholder:text-[#B0B8C1]" />

            <div>
              <p className="text-xs text-[#8B95A1] mb-1.5">이미지 첨부 (선택 · 여러 장 가능)</p>
              <ImageUploader
                onFiles={setImageFiles}
                initialPreviews={existingImageUrls}
                onRemoveExisting={(url) => setExistingImageUrls(prev => prev.filter(u => u !== url))}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handlePost} disabled={posting}
                className="flex-1 py-3 bg-[#3182F6] disabled:bg-[#E5E8EB] hover:bg-[#1C6EE8] text-white disabled:text-[#8B95A1] rounded-xl font-semibold text-sm transition-colors">
                {posting ? "저장 중..." : (editingId ? "수정 완료" : "공지 등록")}
              </button>
              <button onClick={resetForm}
                className="px-6 py-3 bg-[#F2F4F6] hover:bg-[#E5E8EB] text-[#4E5968] rounded-xl font-semibold text-sm transition-colors">
                취소
              </button>
            </div>
          </div>
        )}

        {/* 공지 목록 */}
        {notices.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#8B95A1]">아직 공지사항이 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notices.map((notice) => {
              const images = getImages(notice)
              return (
                <Link key={notice.id} href={`/notice/${notice.id}`}
                  className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden hover:border-[#3182F6] transition-colors flex flex-col cursor-pointer">

                  {/* 카드 헤더 */}
                  <div className="px-4 py-3 border-b border-[#E5E8EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryStyle[notice.category]}`}>
                        {categoryIcon[notice.category]} {notice.category}
                      </span>
                      <span className="text-xs text-[#8B95A1]">{notice.date}</span>
                    </div>
                    {adminUser && (
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(notice) }}
                          className="text-xs text-[#8B95A1] hover:text-[#191F28] px-1.5 py-0.5 rounded transition-colors"
                          title="수정">✏️</button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notice.id) }}
                          className="text-xs text-[#8B95A1] hover:text-red-500 px-1.5 py-0.5 rounded transition-colors"
                          title="삭제">🗑️</button>
                      </div>
                    )}
                  </div>

                  {/* 썸네일 (첫 번째 이미지만) */}
                  {images.length > 0 && (
                    <div className="w-full aspect-video overflow-hidden bg-[#F9FAFB]">
                      <img
                        src={images[0]}
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
                    <h3 className="font-semibold text-[#191F28] text-sm leading-snug">{notice.title}</h3>
                    <p className="text-xs text-[#8B95A1] leading-relaxed whitespace-pre-wrap flex-1 line-clamp-4">
                      {notice.content}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[#3182F6] font-medium">자세히 보기 →</span>
                      {images.length > 1 && (
                        <span className="text-xs text-[#B0B8C1]">사진 {images.length}장</span>
                      )}
                    </div>
                  </div>

                </Link>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
