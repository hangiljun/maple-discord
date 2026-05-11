"use client"
import { useState, useEffect, useRef, DragEvent } from "react"
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
  const [expanded, setExpanded] = useState<string | null>(null)
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

  // 이미지 추가
  const addImageFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"))
    const entries: ImageEntry[] = arr.map(file => ({ preview: URL.createObjectURL(file), file }))
    setImages(prev => [...prev, ...entries])
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
    }
    finally { setPosting(false) }
  }

  const handleDelete = async (post: Post) => {
    if (!confirm("게시글을 삭제할까요?")) return
    await deleteDoc(doc(db, "board_posts", post.id))
  }

  const canDelete = (post: Post) =>
    adminUser || (user && user.uid === post.authorUid)

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">

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
                {/* 미리보기 */}
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

                {/* 드래그앤드롭 영역 */}
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
          <div className="text-center py-20 text-[#8B95A1]">아직 게시글이 없어요. 첫 글을 써보세요!</div>
        ) : (
          <div className="space-y-3">
            {/* 이미지 있는 글 — 카드 그리드 */}
            {(() => {
              const pagePosts = posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              const imagePosts = pagePosts.filter(p => p.imageUrls && p.imageUrls.length > 0)
              const textPosts = pagePosts.filter(p => !p.imageUrls || p.imageUrls.length === 0)
              return (
                <>
                  {imagePosts.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {imagePosts.map((post) => (
                        <div key={post.id} className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden flex flex-col relative">
                          {canDelete(post) && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(post) }}
                              className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/40 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center transition-colors">✕</button>
                          )}
                          <button onClick={() => setExpanded(expanded === post.id ? null : post.id)} className="text-left flex flex-col flex-1">
                            {expanded !== post.id && (
                              <div className="w-full aspect-square overflow-hidden bg-[#F2F4F6]">
                                <img src={post.imageUrls![0]} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" loading="lazy" />
                              </div>
                            )}
                            <div className="p-3 flex-1">
                              <p className="font-semibold text-sm text-[#191F28] line-clamp-2 leading-snug">{post.title}</p>
                              <p className="text-xs text-[#8B95A1] mt-1 truncate">
                                {post.isAdminPost ? "운영자" : post.isGuest ? `비회원 · ${post.authorName}` : post.authorName} · {post.date}
                              </p>
                            </div>
                          </button>
                          {expanded === post.id && (
                            <div className="px-3 pb-3 pt-2 border-t border-[#E5E8EB] space-y-2">
                              <p className="text-sm text-[#4E5968] whitespace-pre-wrap leading-relaxed">{post.content}</p>
                              <div className="space-y-2">
                                {post.imageUrls!.map((url, i) => (
                                  <div key={i} className="rounded-xl overflow-hidden border border-[#E5E8EB]">
                                    <img src={url} alt={`첨부 이미지 ${i + 1}`} className="w-full h-auto" loading="lazy" decoding="async"
                                      onError={(e) => { const el = e.target as HTMLImageElement; if (el.parentElement) el.parentElement.style.display = "none" }} />
                                  </div>
                                ))}
                              </div>
                              {canDelete(post) && (
                                <button onClick={() => handleDelete(post)} className="text-xs text-[#B0B8C1] hover:text-red-500 transition-colors">삭제</button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 이미지 없는 글 — 리스트 */}
                  {textPosts.length > 0 && (
                    <div className="space-y-2">
                      {textPosts.map((post) => (
                        <div key={post.id} className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">
                          <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                            className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-[#191F28] truncate">{post.title}</p>
                              <p className="text-xs text-[#8B95A1] mt-0.5">
                                {post.isAdminPost ? "운영자" : post.isGuest ? `비회원 · ${post.authorName}` : post.authorName} · {post.date}
                              </p>
                            </div>
                            <span className={`text-[#B0B8C1] text-xs transition-transform flex-shrink-0 ${expanded === post.id ? "rotate-180" : ""}`}>▼</span>
                            {canDelete(post) && (
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(post) }}
                                className="text-[#B0B8C1] hover:text-red-500 text-xs flex-shrink-0 transition-colors">✕</button>
                            )}
                          </button>
                          {expanded === post.id && (
                            <div className="px-5 pb-5 pt-3 border-t border-[#E5E8EB]">
                              <p className="text-sm text-[#4E5968] whitespace-pre-wrap leading-relaxed">{post.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}

            {/* 페이지네이션 */}
            {Math.ceil(posts.length / PAGE_SIZE) > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg text-sm text-[#4E5968] bg-white border border-[#E5E8EB] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors">
                  이전
                </button>
                {Array.from({ length: Math.ceil(posts.length / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm transition-colors ${p === currentPage ? "bg-[#3182F6] text-white" : "bg-white text-[#4E5968] border border-[#E5E8EB] hover:bg-[#F9FAFB]"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(posts.length / PAGE_SIZE), p + 1))}
                  disabled={currentPage === Math.ceil(posts.length / PAGE_SIZE)}
                  className="px-3 py-2 rounded-lg text-sm text-[#4E5968] bg-white border border-[#E5E8EB] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors">
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
