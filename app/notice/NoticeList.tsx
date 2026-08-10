"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useLang } from "../contexts/LanguageContext"
import { db, auth } from "@/lib/firebase"
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, updateDoc
} from "firebase/firestore"
import { uploadImageFile } from "@/lib/storage"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

type SavedBlock = { type: "text"; value: string } | { type: "image"; url: string }
type EditorBlock = { type: "text"; value: string } | { type: "image"; url: string; file?: File }

interface Notice {
  id: string
  title: string
  category: "패치노트" | "변경사항" | "공지"
  thumbnailUrl?: string
  blocks?: SavedBlock[]
  content?: string       // 하위 호환
  imageUrls?: string[]   // 하위 호환
  imageUrl?: string      // 하위 호환
  createdAt?: any
  date: string
  authorUid?: string
  pinned?: boolean
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

const noticeT = {
  ko: {
    title: "공지사항", subtitle: "운영 공지 및 패치노트를 확인하세요",
    writeBtn: "공지 작성", cancel: "취소", editTitle: "공지 수정", newTitle: "새 공지 작성",
    catLabels: { "패치노트": "패치노트", "변경사항": "변경사항", "공지": "공지" } as Record<string,string>,
    pinned: "📌 고정", empty: "아직 공지사항이 없어요",
    readMore: "자세히 보기 →", photos: (n: number) => `사진 ${n}장`,
    saving: "저장 중...", update: "수정 완료", post: "공지 등록",
  },
  en: {
    title: "Notices", subtitle: "Check server notices and patch notes",
    writeBtn: "Write Notice", cancel: "Cancel", editTitle: "Edit Notice", newTitle: "New Notice",
    catLabels: { "패치노트": "Patch Notes", "변경사항": "Updates", "공지": "Notice" } as Record<string,string>,
    pinned: "📌 Pinned", empty: "No notices yet",
    readMore: "Read more →", photos: (n: number) => `${n} photos`,
    saving: "Saving...", update: "Update", post: "Post Notice",
  },
}

function getLegacyImages(notice: Notice): string[] {
  if (notice.imageUrls && notice.imageUrls.length > 0) return notice.imageUrls
  if (notice.imageUrl) return [notice.imageUrl]
  return []
}

function getFirstImage(notice: Notice): string | null {
  if (notice.thumbnailUrl) return notice.thumbnailUrl
  if (notice.blocks) {
    const b = notice.blocks.find(b => b.type === "image")
    return b ? b.url : null
  }
  return getLegacyImages(notice)[0] || null
}

function getPreviewText(notice: Notice): string {
  if (notice.blocks) {
    const b = notice.blocks.find(b => b.type === "text")
    return b ? b.value : ""
  }
  return notice.content || ""
}

function getImageCount(notice: Notice): number {
  if (notice.blocks) return notice.blocks.filter(b => b.type === "image").length
  return getLegacyImages(notice).length
}

function noticeToBlocks(notice: Notice): EditorBlock[] {
  if (notice.blocks && notice.blocks.length > 0) return notice.blocks as EditorBlock[]
  const result: EditorBlock[] = []
  if (notice.content) result.push({ type: "text", value: notice.content })
  getLegacyImages(notice).forEach(url => result.push({ type: "image", url }))
  return result.length > 0 ? result : [{ type: "text", value: "" }]
}

const EMPTY_FORM = { title: "", category: "공지" as Notice["category"] }

export default function NoticeList({ initialNotices }: { initialNotices: Notice[] }) {
  const { lang } = useLang()
  const nt = noticeT[lang]
  const [notices, setNotices] = useState<Notice[]>(initialNotices)  // ← 서버에서 받은 초기값
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [blocks, setBlocks] = useState<EditorBlock[]>([{ type: "text", value: "" }])
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string>("")
  const [posting, setPosting] = useState(false)
  const [editPending, setEditPending] = useState<string | null>(null)

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

  // URL 파라미터로 edit ID 받기
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const editId = params.get('edit')
    if (editId && adminUser && notices.length > 0) {
      const notice = notices.find(n => n.id === editId)
      if (notice && !editingId) {
        handleEdit(notice)
        // URL에서 파라미터 제거
        window.history.replaceState({}, '', '/notice')
      }
    }
  }, [notices, adminUser])

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setBlocks([{ type: "text", value: "" }])
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview("")
    setExistingThumbnailUrl("")
    setShowForm(false)
    setEditingId(null)
  }

  const handleThumbnailFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setExistingThumbnailUrl("")
    e.target.value = ""
  }

  const removeThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
    setThumbnailFile(null)
    setThumbnailPreview("")
    setExistingThumbnailUrl("")
  }

  // 블록 조작
  const addTextBlock = () => setBlocks(prev => [...prev, { type: "text", value: "" }])

  const addImageBlocks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith("image/"))
    const newBlocks: EditorBlock[] = files.map(file => ({
      type: "image" as const,
      url: URL.createObjectURL(file),
      file,
    }))
    setBlocks(prev => [...prev, ...newBlocks])
    e.target.value = ""
  }

  const handleImageBlockFile = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setBlocks(prev => prev.map((b, idx) => idx === i ? { type: "image" as const, url, file } : b))
    e.target.value = ""
  }

  const updateTextBlock = (i: number, value: string) => {
    setBlocks(prev => prev.map((b, idx) => idx === i ? { ...b, value } : b))
  }

  const handleBlockPaste = (i: number, e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items).filter(item => item.type.startsWith("image/"))
    if (items.length === 0) return
    e.preventDefault()
    const newBlocks: EditorBlock[] = items
      .map(item => item.getAsFile())
      .filter(Boolean)
      .map(file => ({ type: "image" as const, url: URL.createObjectURL(file!), file: file! }))
    setBlocks(prev => [
      ...prev.slice(0, i + 1),
      ...newBlocks,
      ...prev.slice(i + 1),
    ])
  }

  const moveBlock = (i: number, dir: -1 | 1) => {
    setBlocks(prev => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const arr = [...prev]
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  const removeBlock = (i: number) => {
    setBlocks(prev => {
      const block = prev[i]
      if (block.type === "image" && block.file) URL.revokeObjectURL(block.url)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const handlePost = async () => {
    if (!form.title.trim()) { alert("제목을 입력해주세요"); return }
    setPosting(true)
    try {
      const savedBlocks: SavedBlock[] = await Promise.all(
        blocks.map(async (block) => {
          if (block.type === "text") return { type: "text" as const, value: block.value }
          if (block.file) {
            const url = await uploadImageFile(block.file, `notices/${Date.now()}_${block.file.name}`)
            return { type: "image" as const, url }
          }
          return { type: "image" as const, url: block.url }
        })
      )

      let thumbnailUrl: string | null = existingThumbnailUrl || null
      if (thumbnailFile) {
        thumbnailUrl = await uploadImageFile(thumbnailFile, `notices/thumb_${Date.now()}_${thumbnailFile.name}`)
      }

      if (editingId) {
        await updateDoc(doc(db, "notices", editingId), {
          title: form.title,
          category: form.category,
          thumbnailUrl,
          blocks: savedBlocks,
          content: null,
          imageUrls: null,
          imageUrl: null,
        })
      } else {
        await addDoc(collection(db, "notices"), {
          title: form.title,
          category: form.category,
          thumbnailUrl,
          blocks: savedBlocks,
          createdAt: serverTimestamp(),
          authorUid: user?.uid,
        })
      }
      resetForm()
    } catch (e: any) {
      console.error(e)
      alert("오류: " + (e?.message || String(e)))
    } finally {
      setPosting(false)
    }
  }

  const handleEdit = (notice: Notice) => {
    setForm({ title: notice.title, category: notice.category })
    setBlocks(noticeToBlocks(notice))
    setThumbnailFile(null)
    setThumbnailPreview("")
    setExistingThumbnailUrl(notice.thumbnailUrl || "")
    setEditingId(notice.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("공지를 삭제할까요?")) return
    await deleteDoc(doc(db, "notices", id))
  }

  const handlePin = async (notice: Notice) => {
    await updateDoc(doc(db, "notices", notice.id), { pinned: !notice.pinned })
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#191F28]">{nt.title}</h1>
            <p className="text-[#8B95A1] text-sm mt-0.5">{nt.subtitle}</p>
          </div>
          {adminUser && (
            <button
              onClick={() => { if (showForm && !editingId) { resetForm() } else { resetForm(); setShowForm(true) } }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                showForm && !editingId
                  ? "bg-[#F2F4F6] text-[#8B95A1] hover:bg-[#E5E8EB]"
                  : "bg-[#3182F6] text-white hover:bg-[#1C6EE8]"
              }`}>
              {showForm && !editingId ? nt.cancel : nt.writeBtn}
            </button>
          )}
        </div>

        {/* 관리자 작성/수정 폼 */}
        {adminUser && showForm && (
          <div className="bg-white border border-[#E5E8EB] rounded-2xl p-5 space-y-3">
            <p className="font-semibold text-[#191F28] text-sm">
              {editingId ? nt.editTitle : nt.newTitle}
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

            {/* 썸네일 */}
            <div className="border border-[#E5E8EB] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border-b border-[#E5E8EB]">
                <div>
                  <span className="text-xs text-[#8B95A1] font-medium">썸네일 이미지</span>
                  <span className="text-xs text-[#B0B8C1] ml-2">· 없으면 본문 첫 이미지로 자동 대체</span>
                </div>
                <span className="text-xs text-[#B0B8C1]">권장 1280×720 (16:9) · JPG/PNG · 2MB 이하</span>
              </div>
              <div className="p-3">
                {thumbnailPreview || existingThumbnailUrl ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview || existingThumbnailUrl}
                      alt="썸네일 미리보기"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <label htmlFor="thumbnail-replace"
                        className="bg-white border border-[#E5E8EB] text-xs px-2.5 py-1 rounded-lg text-[#4E5968] hover:bg-[#F9FAFB] cursor-pointer shadow-sm transition-colors">
                        교체
                      </label>
                      <button type="button" onClick={removeThumbnail}
                        className="bg-white border border-[#E5E8EB] text-xs px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 shadow-sm transition-colors">
                        삭제
                      </button>
                    </div>
                    <input id="thumbnail-replace" type="file" accept="image/*" className="hidden" onChange={handleThumbnailFile} />
                  </div>
                ) : (
                  <label htmlFor="thumbnail-upload"
                    className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-[#E5E8EB] rounded-xl cursor-pointer hover:bg-[#F9FAFB] hover:border-[#3182F6] transition-colors">
                    <span className="text-sm text-[#8B95A1]">클릭하여 썸네일 선택</span>
                    <span className="text-xs text-[#B0B8C1] mt-1">미설정 시 본문 첫 이미지 자동 사용</span>
                    <input id="thumbnail-upload" type="file" accept="image/*" className="hidden" onChange={handleThumbnailFile} />
                  </label>
                )}
              </div>
            </div>

            {/* 블록 에디터 */}
            <div className="space-y-2">
              {blocks.map((block, i) => (
                <div key={i} className="border border-[#E5E8EB] rounded-xl overflow-hidden">
                  {/* 블록 헤더 */}
                  <div className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border-b border-[#E5E8EB]">
                    <span className="text-xs text-[#8B95A1] font-medium">
                      {block.type === "text" ? "텍스트" : "이미지"}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button type="button" onClick={() => moveBlock(i, -1)} disabled={i === 0}
                        className="w-7 h-7 flex items-center justify-center text-[#8B95A1] hover:text-[#191F28] disabled:opacity-25 text-sm rounded-lg hover:bg-[#E5E8EB] transition-colors">↑</button>
                      <button type="button" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}
                        className="w-7 h-7 flex items-center justify-center text-[#8B95A1] hover:text-[#191F28] disabled:opacity-25 text-sm rounded-lg hover:bg-[#E5E8EB] transition-colors">↓</button>
                      <button type="button" onClick={() => removeBlock(i)}
                        className="w-7 h-7 flex items-center justify-center text-[#B0B8C1] hover:text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors">✕</button>
                    </div>
                  </div>

                  {/* 블록 내용 */}
                  {block.type === "text" ? (
                    <textarea
                      value={block.value}
                      onChange={(e) => updateTextBlock(i, e.target.value)}
                      onPaste={(e) => handleBlockPaste(i, e)}
                      rows={4}
                      placeholder="텍스트를 입력하세요 (이미지 Ctrl+V 붙여넣기 가능)"
                      className="w-full p-3 text-sm text-[#191F28] outline-none resize-none placeholder:text-[#B0B8C1]"
                    />
                  ) : (
                    <div className="p-3">
                      {block.url ? (
                        <div className="relative">
                          <img src={block.url} alt="이미지 블록" className="w-full h-auto rounded-lg" />
                          <label htmlFor={`img-replace-${i}`}
                            className="absolute top-2 right-2 bg-white border border-[#E5E8EB] text-xs px-2.5 py-1 rounded-lg text-[#4E5968] hover:bg-[#F9FAFB] cursor-pointer shadow-sm transition-colors">
                            교체
                          </label>
                          <input id={`img-replace-${i}`} type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleImageBlockFile(i, e)} />
                        </div>
                      ) : (
                        <label htmlFor={`img-empty-${i}`}
                          className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-[#E5E8EB] rounded-xl cursor-pointer hover:bg-[#F9FAFB] transition-colors">
                          <span className="text-sm text-[#8B95A1]">클릭하여 이미지 선택</span>
                          <input id={`img-empty-${i}`} type="file" accept="image/*" className="hidden"
                            onChange={(e) => handleImageBlockFile(i, e)} />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 블록 추가 버튼 */}
            <div className="flex gap-2">
              <button type="button" onClick={addTextBlock}
                className="flex-1 py-2.5 border border-dashed border-[#E5E8EB] rounded-xl text-sm text-[#8B95A1] hover:border-[#3182F6] hover:text-[#3182F6] transition-colors">
                + 텍스트 추가
              </button>
              <label className="flex-1 py-2.5 border border-dashed border-[#E5E8EB] rounded-xl text-sm text-[#8B95A1] hover:border-[#3182F6] hover:text-[#3182F6] transition-colors cursor-pointer text-center">
                + 이미지 추가
                <input type="file" accept="image/*" multiple className="hidden" onChange={addImageBlocks} />
              </label>
            </div>

            <div className="flex gap-2">
              <button onClick={handlePost} disabled={posting}
                className="flex-1 py-3 bg-[#3182F6] disabled:bg-[#E5E8EB] hover:bg-[#1C6EE8] text-white disabled:text-[#8B95A1] rounded-xl font-semibold text-sm transition-colors">
                {posting ? nt.saving : (editingId ? nt.update : nt.post)}
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
            <p className="text-[#8B95A1]">{nt.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...notices].sort((a, b) => {
              if (a.pinned && !b.pinned) return -1
              if (!a.pinned && b.pinned) return 1
              return 0
            }).map((notice) => {
              const thumb = getFirstImage(notice)
              const preview = getPreviewText(notice)
              const imgCount = getImageCount(notice)
              return (
                <Link key={notice.id} href={`/notice/${notice.id}`}
                  className={`bg-white rounded-2xl overflow-hidden hover:border-[#3182F6] transition-colors flex flex-col cursor-pointer border ${notice.pinned ? "border-red-300" : "border-[#E5E8EB]"}`}>

                  {/* 카드 헤더 */}
                  <div className="px-4 py-3 border-b border-[#E5E8EB] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {notice.pinned && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-500 border-red-200">
                          {nt.pinned}
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryStyle[notice.category]}`}>
                        {categoryIcon[notice.category]} {nt.catLabels[notice.category] ?? notice.category}
                      </span>
                      <span className="text-xs text-[#8B95A1]">{notice.date}</span>
                    </div>
                    {adminUser && (
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePin(notice) }}
                          className={`text-xs px-1.5 py-0.5 rounded transition-colors ${notice.pinned ? "text-red-500 hover:text-red-700" : "text-[#8B95A1] hover:text-red-500"}`}
                          title={notice.pinned ? "고정 해제" : "고정"}>📌</button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(notice) }}
                          className="text-xs text-[#8B95A1] hover:text-[#191F28] px-1.5 py-0.5 rounded transition-colors"
                          title="수정">✏️</button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notice.id) }}
                          className="text-xs text-[#8B95A1] hover:text-red-500 px-1.5 py-0.5 rounded transition-colors"
                          title="삭제">🗑️</button>
                      </div>
                    )}
                  </div>

                  {/* 썸네일 */}
                  {thumb && (
                    <div className="w-full aspect-video overflow-hidden bg-[#F9FAFB]">
                      <img src={thumb} alt={notice.title} className="w-full h-full object-cover"
                        loading="lazy" decoding="async"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          if (el.parentElement) el.parentElement.style.display = "none"
                        }} />
                    </div>
                  )}

                  {/* 본문 */}
                  <div className="p-4 flex flex-col flex-1 space-y-2">
                    <h3 className="font-semibold text-[#191F28] text-sm leading-snug">{notice.title}</h3>
                    {preview && (
                      <p className="text-xs text-[#8B95A1] leading-relaxed whitespace-pre-wrap flex-1 line-clamp-4">
                        {preview}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[#3182F6] font-medium">{nt.readMore}</span>
                      {imgCount > 1 && (
                        <span className="text-xs text-[#B0B8C1]">{nt.photos(imgCount)}</span>
                      )}
                    </div>
                  </div>

                </Link>
              )
            })}
          </div>
        )}

        {/* SEO 텍스트 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-6 py-8 mt-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-black text-[#191F28] mb-2">
              메이플 공지사항, 가장 빠르게 확인하세요
            </h2>
            <p className="text-[#8B95A1] text-sm">
              메이플스토리 · 메이플랜드 · 메이플플래닛 패치노트 및 업데이트 공지
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4 text-sm text-[#64748b] leading-relaxed">
            <p>
              <strong className="text-[#191F28] font-bold">메이플디스코드</strong>는 메이플스토리, 메이플랜드, 메이플플래닛의 주요 패치노트, 업데이트 공지, 이벤트 정보를 가장 빠르게 전달합니다.
              Nexon 공식 패치노트와 커뮤니티 핫이슈를 한 곳에서 확인하세요.
            </p>
            <p>
              메이플스토리 신규 패치, 메이플랜드 클래식 서버 업데이트, 메이플플래닛 신규 콘텐츠까지 게임별 전용 공지 채널을 통해 실시간으로 안내합니다.
              중요 공지는 디스코드 알림으로 자동 전송되어 놓치지 않고 확인할 수 있습니다.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
