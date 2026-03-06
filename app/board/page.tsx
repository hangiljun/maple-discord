"use client"
import { useState, useEffect } from "react"
import { db, auth } from "@/lib/firebase"
import {
  collection, query, orderBy, onSnapshot, addDoc,
  deleteDoc, doc, serverTimestamp, getDoc
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
  createdAt?: any
  date: string
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
  const [posting, setPosting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 20

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

  const handlePost = async () => {
    if (!form.title.trim() || !form.content.trim()) { alert("제목과 내용을 입력해주세요"); return }
    if (!user && !guestName.trim()) { alert("닉네임을 입력해주세요"); return }
    setPosting(true)
    if (!user && guestName.trim()) localStorage.setItem("maple_guest_name", guestName.trim())
    try {
      await addDoc(collection(db, "board_posts"), {
        title: form.title,
        content: form.content,
        authorUid: user?.uid || "guest_" + Math.random().toString(36).substring(7),
        authorName: adminUser ? "운영자" : user ? userNickname : guestName.trim(),
        isGuest: !user,
        isAdminPost: adminUser,
        createdAt: serverTimestamp(),
      })
      setForm({ title: "", content: "" })
      setShowForm(false)
    } catch (e) { console.error(e) }
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
          <button onClick={() => setShowForm(!showForm)}
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
              placeholder="내용을 입력하세요" rows={5} maxLength={1000}
              className="w-full p-3 rounded-xl border border-[#E5E8EB] text-sm text-[#191F28] outline-none focus:border-[#3182F6] resize-none placeholder:text-[#B0B8C1]" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#B0B8C1]">{form.content.length}/1000</span>
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
          <div className="space-y-2">
            {posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((post) => (
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
