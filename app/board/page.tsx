"use client"
import { useState, useEffect, useRef, DragEvent } from "react"
import Link from "next/link"
import { db, auth } from "@/lib/firebase"
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, getDoc
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"
import { uploadImageFile } from "@/lib/storage"

interface Post {
  id: string
  title: string
  content: string
  authorUid: string
  authorName: string
  isGuest: boolean
  isAdminPost?: boolean
  imageUrls?: string[]
  createdAt?: any
  date: string
}

interface ImageEntry {
  preview: string
  file: File
}

export default function BoardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<any>(null)
  const [userNickname, setUserNickname] = useState("")
  const [guestName, setGuestName] = useState("")
  const [adminUser, setAdminUser] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })
  const [images, setImages] = useState<ImageEntry[]>([])
  const [dragging, setDragging] = useState(false)
  const [posting, setPosting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const PAGE_SIZE = 12

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const [adminCheck, snap] = await Promise.all([isAdmin(u.uid), getDoc(doc(db, "users", u.uid))])
        setAdminUser(adminCheck)
        if (adminCheck) {
          setUserNickname("운영자")
        } else {
          setUserNickname(snap.exists() ? snap.data().nickname || u.email?.split("@")[0] || "모험가" : u.email?.split("@")[0] || "모험가")
        }
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("maple_guest_name")
    if (saved) setGuestName(saved)
  }, [])

  useEffect(() => {
    const q = query(collection(db, "board_posts"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => {
        const data = d.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR") || ""
        return { id: d.id, ...data, date } as Post
      }))
    })
  }, [])

  const addImageFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"))
    setImages(prev => [...prev, ...arr.map(file => ({ preview: URL.createObjectURL(file), file }))])
  }

  const removeImage = (i: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[i].preview)
      return prev.filter((_, idx) => idx !== i)
    })
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    addImageFiles(e.dataTransfer.files)
  }

  const resetForm = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview))
    setForm({ title: "", content: "" })
    setImages([])
    setShowForm(false)
  }

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) { alert("제목과 내용을 입력해주세요"); return }
    if (!user && !guestName.trim()) { alert("닉네임을 입력해주세요"); return }
    setPosting(true)
    if (!user && guestName.trim()) localStorage.setItem("maple_guest_name", guestName.trim())
    try {
      const imageUrls = await Promise.all(
        images.map(img => uploadImageFile(img.file, `board/${Date.now()}_${img.file.name}`))
      )
      await addDoc(collection(db, "board_posts"), {
        title: form.title,
        content: form.content,
        imageUrls: imageUrls.length > 0 ? imageUrls : [],
        authorUid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        authorName: adminUser ? "운영자" : user ? userNickname : guestName.trim(),
        isGuest: !user,
        isAdminPost: adminUser,
        createdAt: serverTimestamp(),
      })
      resetForm()
    } catch (e: any) {
      console.error(e)
      if (e?.code === "storage/unauthorized") {
        alert("이미지 업로드 권한이 없습니다. 로그인 후 다시 시도해주세요.")
      } else {
        alert("등록 중 오류가 발생했습니다. 다시 시도해주세요.")
      }
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("게시글을 삭제할까요?")) return
    await deleteDoc(doc(db, "board_posts", postId))
  }

  const canDelete = (post: Post) =>
    adminUser || (user && user.uid === post.authorUid)

  const pagePosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const totalPages = Math.ceil(posts.length / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#191F28]">자유게시판</h1>
            <p className="text-[#8B95A1] text-sm mt-0.5">자유롭게 글을 써보세요!</p>
          </div>
          <button onClick={() => { if (showForm) resetForm(); else setShowForm(true) }}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              showForm
                ? "bg-[#F2F4F6] text-[#8B95A1] hover:bg-[#E5E8EB]"
                : "bg-[#3182F6] text-white hover:bg-[#1C6EE8]"
            }`}>
            {showForm ? "취소" : "글쓰기"}
          </button>
        </div>

        {/* 글쓰기 폼 */}
        {showForm && (
          <div className="bg-white border border-[#E5E8EB] rounded-2xl p-5 space-y-3">
            {!user && (
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                placeholder="닉네임 (비회원)" maxLength={20}
                className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] placeholder:text-[#B0B8C1]" />
            )}
            {user && (
              <p className="text-xs text-[#8B95A1] px-1">
                {adminUser
                  ? <span className="text-red-500 font-semibold">운영자로 작성</span>
                  : <span className="text-[#3182F6] font-semibold">{userNickname}으로 작성</span>}
              </p>
            )}
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목" maxLength={50}
              className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] placeholder:text-[#B0B8C1]" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요" rows={5} maxLength={3000}
              className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] resize-none placeholder:text-[#B0B8C1]" />

            {/* 이미지 첨부 — 로그인 유저만 */}
            {!user && <p className="text-xs text-[#B0B8C1] px-1">이미지 첨부는 로그인 후 이용 가능해요.</p>}
            {user && (
              <div>
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {images.map((img, i) => (
                      <div key={img.preview} className="relative w-20 h-20">
                        <img src={img.preview} alt="" className="w-full h-full object-cover rounded-lg border border-[#E5E8EB]" />
                        <button type="button" onClick={() => removeImage(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center font-bold shadow transition-colors">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl cursor-pointer transition-colors py-4 px-4 text-center
                    ${dragging ? "border-[#3182F6] bg-[#EBF3FE]" : "border-[#E5E8EB] hover:border-[#3182F6] hover:bg-[#F9FAFB]"}`}>
                  <p className="text-xs text-[#8B95A1]">
                    {images.length > 0 ? "사진 추가하기 · 클릭 또는 드래그" : "사진 첨부 · 클릭 또는 드래그 (선택)"}
                  </p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { if (e.target.files) addImageFiles(e.target.files); e.target.value = "" }} />
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-xs text-[#B0B8C1]">{form.content.length}/3000</span>
              <button onClick={handlePost} disabled={posting}
                className="px-5 py-2 bg-[#3182F6] disabled:bg-[#E5E8EB] hover:bg-[#1C6EE8] text-white disabled:text-[#8B95A1] rounded-lg font-semibold text-sm transition-colors">
                {posting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#8B95A1]">아직 게시글이 없어요. 첫 글을 써보세요!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pagePosts.map((post) => {
                const thumb = post.imageUrls?.[0]
                return (
                  <Link key={post.id} href={`/board/${post.id}`}
                    className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden hover:border-[#3182F6] transition-colors flex flex-col cursor-pointer">

                    {/* 카드 헤더 */}
                    <div className="px-4 py-3 border-b border-[#E5E8EB] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.isAdminPost && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-500 border-red-200">
                            운영자
                          </span>
                        )}
                        <span className="text-xs text-[#8B95A1]">
                          {post.isGuest ? `비회원 · ${post.authorName}` : post.authorName} · {post.date}
                        </span>
                      </div>
                      {canDelete(post) && (
                        <button onClick={(e) => handleDelete(e, post.id)}
                          className="text-xs text-[#B0B8C1] hover:text-red-500 transition-colors px-1">🗑️</button>
                      )}
                    </div>

                    {/* 썸네일 */}
                    {thumb && (
                      <div className="w-full aspect-video overflow-hidden bg-[#F9FAFB]">
                        <img src={thumb} alt={post.title} className="w-full h-full object-cover"
                          loading="lazy" decoding="async"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement
                            if (el.parentElement) el.parentElement.style.display = "none"
                          }} />
                      </div>
                    )}

                    {/* 본문 */}
                    <div className="p-4 flex flex-col flex-1 space-y-2">
                      <h3 className="font-semibold text-[#191F28] text-sm leading-snug">{post.title}</h3>
                      <p className="text-xs text-[#8B95A1] leading-relaxed flex-1 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[#3182F6] font-medium">자세히 보기 →</span>
                        {post.imageUrls && post.imageUrls.length > 1 && (
                          <span className="text-xs text-[#B0B8C1]">사진 {post.imageUrls.length}장</span>
                        )}
                      </div>
                    </div>

                  </Link>
                )
              })}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm text-[#4E5968] bg-white border border-[#E5E8EB] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors">
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm transition-colors ${p === currentPage ? "bg-[#3182F6] text-white" : "bg-white text-[#4E5968] border border-[#E5E8EB] hover:bg-[#F9FAFB]"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg text-sm text-[#4E5968] bg-white border border-[#E5E8EB] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors">
                  다음
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
