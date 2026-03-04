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
        authorName: adminUser ? "🛡️ 운영자" : user ? userNickname : guestName.trim(),
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
    <div className="min-h-screen bg-[#D6EEFF] p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#0A3D6B] to-[#1877D4] rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white">💬 자유게시판</h1>
            <p className="text-sm text-sky-200 font-bold mt-1">자유롭게 글을 써보세요!</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-white text-[#1877D4] px-5 py-2.5 rounded-xl font-black text-sm shadow-md active:scale-95 hover:bg-sky-50 transition-colors">
            {showForm ? "✕ 취소" : "✏️ 글쓰기"}
          </button>
        </div>

        {/* 글쓰기 폼 */}
        {showForm && (
          <div className="bg-white border-2 border-[#5BA8D8] rounded-2xl p-5 space-y-3 shadow-md">
            {!user && (
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                placeholder="닉네임 (비회원)" maxLength={20}
                className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4]" />
            )}
            {user && (
              <p className="text-xs font-black px-1">
                {adminUser
                  ? <span className="text-red-500">🛡️ 운영자 로 작성</span>
                  : <span className="text-[#0A3D6B]">🍁 {userNickname} 으로 작성</span>}
              </p>
            )}
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목" maxLength={50}
              className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4]" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요" rows={5} maxLength={1000}
              className="w-full p-3 rounded-xl border-2 border-[#90C4E8] font-bold text-sm outline-none focus:border-[#1877D4] resize-none" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold">{form.content.length}/1000</span>
              <button onClick={handlePost} disabled={posting}
                className="px-6 py-2.5 bg-[#1877D4] disabled:bg-gray-300 hover:bg-[#0D47A1] text-white rounded-2xl font-black text-sm transition-colors">
                {posting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#5BA8D8] font-bold">아직 게시글이 없어요. 첫 글을 써보세요!</div>
        ) : (
          <div className="space-y-3">
            {posts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((post) => (
              <div key={post.id} className="bg-white border-2 border-[#5BA8D8] rounded-2xl overflow-hidden shadow-md">
                <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#EBF7FF] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#0A3D6B] truncate">{post.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      {post.isAdminPost ? `🛡️ ${post.authorName}` : post.isGuest ? `👤 ${post.authorName}` : `🍁 ${post.authorName}`} · {post.date}
                    </p>
                  </div>
                  <span className={`text-gray-400 text-xs transition-transform flex-shrink-0 ${expanded === post.id ? "rotate-180" : ""}`}>▼</span>
                  {canDelete(post) && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(post) }}
                      className="text-red-300 hover:text-red-500 text-xs font-black flex-shrink-0">✕</button>
                  )}
                </button>
                {expanded === post.id && (
                  <div className="px-5 pb-5 pt-3 border-t-2 border-[#D0E8FF]">
                    <p className="text-sm text-[#5D4037] font-bold whitespace-pre-wrap leading-relaxed">{post.content}</p>
                  </div>
                )}
              </div>
            ))}

            {/* 페이지네이션 */}
            {Math.ceil(posts.length / PAGE_SIZE) > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl font-black text-sm bg-white border-2 border-[#5BA8D8] text-[#1877D4] disabled:opacity-40 hover:bg-[#EBF7FF] transition-colors">
                  ← 이전
                </button>
                {Array.from({ length: Math.ceil(posts.length / PAGE_SIZE) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl font-black text-sm border-2 transition-colors ${p === currentPage ? "bg-[#1877D4] text-white border-[#1877D4]" : "bg-white text-[#1877D4] border-[#5BA8D8] hover:bg-[#EBF7FF]"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(Math.ceil(posts.length / PAGE_SIZE), p + 1))}
                  disabled={currentPage === Math.ceil(posts.length / PAGE_SIZE)}
                  className="px-4 py-2 rounded-xl font-black text-sm bg-white border-2 border-[#5BA8D8] text-[#1877D4] disabled:opacity-40 hover:bg-[#EBF7FF] transition-colors">
                  다음 →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
