"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { db, auth } from "@/lib/firebase"
import {
  doc, getDoc, deleteDoc, updateDoc, increment,
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, deleteDoc as deleteDocFn
} from "firebase/firestore"
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
  viewCount?: number
  likeCount?: number
  likedBy?: string[]
  createdAt?: any
  date: string
}

interface Comment {
  id: string
  postId: string
  authorUid: string
  authorName: string
  isGuest: boolean
  content: string
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
  const viewCounted = useRef(false)

  // 좋아요
  const [liking, setLiking] = useState(false)

  // 댓글
  const [comments, setComments] = useState<Comment[]>([])
  const [commentForm, setCommentForm] = useState({ name: "", password: "", content: "" })
  const [submittingComment, setSubmittingComment] = useState(false)

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

  // 조회수 증가 (최초 1회)
  useEffect(() => {
    if (!post || viewCounted.current) return
    viewCounted.current = true
    updateDoc(doc(db, "board_posts", id), { viewCount: increment(1) }).catch(() => {})
  }, [post, id])

  // 댓글 실시간 구독
  useEffect(() => {
    const q = query(
      collection(db, "board_comments"),
      where("postId", "==", id),
      orderBy("createdAt", "asc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => {
        const data = d.data()
        const date = data.createdAt?.toDate()?.toLocaleDateString("ko-KR") || ""
        return { id: d.id, ...data, date } as Comment
      }))
    })
    return () => unsub()
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

  const handleLike = async () => {
    if (!user || liking) return
    setLiking(true)
    const liked = post?.likedBy?.includes(user.uid)
    try {
      if (liked) {
        await updateDoc(doc(db, "board_posts", id), {
          likeCount: increment(-1),
          likedBy: (post!.likedBy || []).filter((u: string) => u !== user.uid),
        })
        setPost(prev => prev ? {
          ...prev,
          likeCount: (prev.likeCount || 1) - 1,
          likedBy: (prev.likedBy || []).filter((u: string) => u !== user.uid),
        } : prev)
      } else {
        await updateDoc(doc(db, "board_posts", id), {
          likeCount: increment(1),
          likedBy: [...(post?.likedBy || []), user.uid],
        })
        setPost(prev => prev ? {
          ...prev,
          likeCount: (prev.likeCount || 0) + 1,
          likedBy: [...(prev.likedBy || []), user.uid],
        } : prev)
      }
    } finally {
      setLiking(false)
    }
  }

  const handleCommentSubmit = async () => {
    const content = commentForm.content.trim()
    if (!content) return
    if (!user && !commentForm.name.trim()) { alert("닉네임을 입력해주세요"); return }
    setSubmittingComment(true)
    try {
      await addDoc(collection(db, "board_comments"), {
        postId: id,
        authorUid: user?.uid || "",
        authorName: user ? user.displayName || "익명" : commentForm.name.trim(),
        isGuest: !user,
        guestPassword: !user ? commentForm.password : "",
        content,
        createdAt: serverTimestamp(),
      })
      setCommentForm({ name: "", password: "", content: "" })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleCommentDelete = async (comment: Comment) => {
    if (!user) {
      const pw = prompt("비밀번호를 입력해주세요")
      if (!pw) return
      const snap = await getDoc(doc(db, "board_comments", comment.id))
      if (!snap.exists() || snap.data().guestPassword !== pw) { alert("비밀번호가 틀렸어요"); return }
    } else if (!adminUser && user.uid !== comment.authorUid) {
      alert("삭제 권한이 없어요"); return
    }
    if (!confirm("댓글을 삭제할까요?")) return
    await deleteDocFn(doc(db, "board_comments", comment.id))
  }

  const isLiked = !!(user && post?.likedBy?.includes(user.uid))

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
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#8B95A1]">👁 {post.viewCount || 0}</span>
              {canEdit && !editing && (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditing(true); setEditForm({ title: post.title, content: post.content }) }}
                    className="text-xs text-[#8B95A1] hover:text-[#191F28] transition-colors">✏️ 수정</button>
                  <button onClick={handleDelete}
                    className="text-xs text-[#8B95A1] hover:text-red-500 transition-colors">🗑️ 삭제</button>
                </div>
              )}
            </div>
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

          {/* 좋아요 */}
          <div className="px-5 pb-5 flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={!user || liking}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                isLiked
                  ? "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                  : "bg-[#F2F4F6] text-[#8B95A1] border-[#E5E8EB] hover:bg-[#E5E8EB]"
              } disabled:opacity-40`}
            >
              {isLiked ? "❤️" : "🤍"} {post.likeCount || 0}
            </button>
            {!user && <span className="text-xs text-[#8B95A1]">로그인 후 좋아요를 누를 수 있어요</span>}
          </div>
        </div>

        {/* 댓글 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E8EB]">
            <h2 className="text-sm font-bold text-[#191F28]">댓글 {comments.length}</h2>
          </div>

          {/* 댓글 목록 */}
          <div className="divide-y divide-[#F2F4F6]">
            {comments.length === 0 && (
              <p className="px-5 py-6 text-sm text-[#8B95A1] text-center">첫 댓글을 남겨보세요!</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="px-5 py-4 flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#F2F4F6] flex items-center justify-center text-xs text-[#8B95A1] shrink-0">
                  {c.authorName.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#191F28]">
                      {c.isGuest ? `비회원 · ${c.authorName}` : c.authorName}
                    </span>
                    <span className="text-xs text-[#8B95A1]">{c.date}</span>
                  </div>
                  <p className="text-sm text-[#4E5968] whitespace-pre-wrap leading-relaxed">{c.content}</p>
                </div>
                {(adminUser || (user && user.uid === c.authorUid) || (!user && c.isGuest)) && (
                  <button onClick={() => handleCommentDelete(c)}
                    className="text-xs text-[#8B95A1] hover:text-red-400 transition-colors shrink-0 self-start">
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 댓글 작성 */}
          <div className="px-5 py-4 border-t border-[#E5E8EB] space-y-3">
            {!user && (
              <div className="flex gap-2">
                <input
                  value={commentForm.name}
                  onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                  placeholder="닉네임"
                  maxLength={20}
                  className="flex-1 p-2.5 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6]"
                />
                <input
                  value={commentForm.password}
                  onChange={(e) => setCommentForm({ ...commentForm, password: e.target.value })}
                  placeholder="비밀번호 (삭제용)"
                  type="password"
                  maxLength={20}
                  className="flex-1 p-2.5 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6]"
                />
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={commentForm.content}
                onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                placeholder="댓글을 입력하세요..."
                maxLength={500}
                rows={2}
                className="flex-1 p-2.5 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] resize-none"
              />
              <button
                onClick={handleCommentSubmit}
                disabled={submittingComment || !commentForm.content.trim()}
                className="px-4 py-2 bg-[#3182F6] text-white text-sm font-semibold rounded-xl hover:bg-[#1C6EE8] disabled:opacity-40 transition-colors self-end"
              >
                등록
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
