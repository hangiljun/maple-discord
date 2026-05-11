"use client"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { db, auth } from "@/lib/firebase"
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { isAdmin } from "@/lib/admin"

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

export default function BoardPostPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [adminUser, setAdminUser] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", content: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) setAdminUser(await isAdmin(u.uid))
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    getDoc(doc(db, "board_posts", id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR") || ""
        setPost({ id: snap.id, ...data, date } as Post)
      }
      setLoading(false)
    })
  }, [id])

  const canEdit = post && (adminUser || (user && user.uid === post.authorUid))

  const handleDelete = async () => {
    if (!confirm("게시글을 삭제할까요?")) return
    await deleteDoc(doc(db, "board_posts", id))
    router.push("/board")
  }

  const handleEditSave = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) { alert("제목과 내용을 입력해주세요"); return }
    setSaving(true)
    await updateDoc(doc(db, "board_posts", id), {
      title: editForm.title,
      content: editForm.content,
    })
    setPost(prev => prev ? { ...prev, title: editForm.title, content: editForm.content } : prev)
    setEditing(false)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <p className="text-[#8B95A1] text-sm">불러오는 중...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-3">
        <p className="text-[#8B95A1]">게시글을 찾을 수 없어요.</p>
        <Link href="/board" className="text-sm text-[#3182F6] hover:underline">← 자유게시판으로</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* 뒤로가기 */}
        <Link href="/board" className="inline-flex items-center gap-1.5 text-sm text-[#8B95A1] hover:text-[#191F28] transition-colors">
          ← 자유게시판
        </Link>

        {/* 게시글 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">

          {/* 헤더 */}
          <div className="px-5 py-4 border-b border-[#E5E8EB] flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {post.isAdminPost && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-red-50 text-red-500 border-red-200">운영자</span>
              )}
              <span className="text-xs text-[#8B95A1]">
                {post.isGuest ? `비회원 · ${post.authorName}` : post.authorName} · {post.date}
              </span>
            </div>
            {canEdit && !editing && (
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditing(true); setEditForm({ title: post.title, content: post.content }) }}
                  className="text-xs text-[#8B95A1] hover:text-[#191F28] transition-colors">✏️ 수정</button>
                <button onClick={handleDelete}
                  className="text-xs text-[#8B95A1] hover:text-red-500 transition-colors">🗑️ 삭제</button>
              </div>
            )}
          </div>

          {/* 본문 */}
          <div className="p-5 space-y-4">
            {editing ? (
              <div className="space-y-3">
                <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6]" />
                <textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={8} maxLength={3000}
                  className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] resize-none" />
                <div className="flex gap-2">
                  <button onClick={handleEditSave} disabled={saving}
                    className="px-4 py-2 bg-[#3182F6] text-white text-sm font-semibold rounded-lg hover:bg-[#1C6EE8] disabled:opacity-50 transition-colors">
                    {saving ? "저장 중..." : "저장"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-[#F2F4F6] text-[#4E5968] text-sm font-semibold rounded-lg hover:bg-[#E5E8EB] transition-colors">
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-lg font-bold text-[#191F28] leading-snug">{post.title}</h1>
                <p className="text-sm text-[#4E5968] whitespace-pre-wrap leading-relaxed">{post.content}</p>
                {post.imageUrls && post.imageUrls.length > 0 && (
                  <div className="space-y-3 pt-1">
                    {post.imageUrls.map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-[#E5E8EB]">
                        <img src={url} alt={`첨부 이미지 ${i + 1}`} className="w-full h-auto"
                          loading="lazy" decoding="async"
                          onError={(e) => {
                            const el = e.target as HTMLImageElement
                            if (el.parentElement) el.parentElement.style.display = "none"
                          }} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
