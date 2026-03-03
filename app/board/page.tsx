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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        setAdminUser(await isAdmin(u.uid))
        try {
          const snap = await getDoc(doc(db, "users", u.uid))
          if (snap.exists()) setUserNickname(snap.data().nickname || u.email?.split("@")[0] || "모험가")
        } catch { setUserNickname(u.email?.split("@")[0] || "모험가") }
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
        authorName: user ? userNickname : guestName.trim(),
        isGuest: !user,
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
    <div className="min-h-screen bg-[#FFF9F2] p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#E67E22]">💬 자유게시판</h1>
            <p className="text-sm text-[#A64D13] font-bold mt-1">자유롭게 글을 써보세요!</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-[#E67E22] text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-md active:scale-95">
            {showForm ? "취소" : "✏️ 글쓰기"}
          </button>
        </div>

        {/* 글쓰기 폼 */}
        {showForm && (
          <div className="bg-white border-2 border-[#FFD8A8] rounded-3xl p-5 space-y-3 shadow-sm">
            {!user && (
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)}
                placeholder="닉네임 (비회원)" maxLength={20}
                className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22]" />
            )}
            {user && <p className="text-xs font-black text-[#A64D13] px-1">🍁 {userNickname} 으로 작성</p>}
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="제목" maxLength={50}
              className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22]" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="내용을 입력하세요" rows={5} maxLength={1000}
              className="w-full p-3 rounded-xl border-2 border-[#FFD8A8] font-bold text-sm outline-none focus:border-[#E67E22] resize-none" />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold">{form.content.length}/1000</span>
              <button onClick={handlePost} disabled={posting}
                className="px-6 py-2.5 bg-[#E67E22] disabled:bg-gray-300 text-white rounded-2xl font-black text-sm">
                {posting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#FFD8A8] font-bold">아직 게시글이 없어요. 첫 글을 써보세요!</div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border-2 border-[#FFD8A8] rounded-2xl overflow-hidden shadow-sm">
                <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#FFF9F2] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-[#5D4037] truncate">{post.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      {post.isGuest ? `👤 ${post.authorName}` : `🍁 ${post.authorName}`} · {post.date}
                    </p>
                  </div>
                  <span className={`text-gray-400 text-xs transition-transform flex-shrink-0 ${expanded === post.id ? "rotate-180" : ""}`}>▼</span>
                  {canDelete(post) && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(post) }}
                      className="text-red-300 hover:text-red-500 text-xs font-black flex-shrink-0">✕</button>
                  )}
                </button>
                {expanded === post.id && (
                  <div className="px-5 pb-5 pt-3 border-t-2 border-[#FFE8CC]">
                    <p className="text-sm text-[#5D4037] font-bold whitespace-pre-wrap leading-relaxed">{post.content}</p>
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