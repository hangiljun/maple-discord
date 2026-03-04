"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore'
import { getOrCreateDMRoom } from '@/lib/dm'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [contacting, setContacting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data())
        })
        const dmQuery = query(
          collection(db, "dm_rooms"),
          where("participants", "array-contains", currentUser.uid)
        )
        onSnapshot(dmQuery, (snap) => {
          let total = 0
          snap.docs.forEach(d => { total += d.data().unread?.[currentUser.uid] || 0 })
          setUnreadTotal(total)
        })
      } else {
        setUserData(null)
        setUnreadTotal(0)
      }
    })
    return () => unsubAuth()
  }, [])

  const handleContactAdmin = async () => {
    if (!user) { router.push("/login"); return }
    if (contacting) return
    setContacting(true)
    try {
      const adminSnap = await getDocs(collection(db, "admin"))
      if (adminSnap.empty) { alert("운영자를 찾을 수 없어요"); return }
      const adminUid = adminSnap.docs[0].id
      const adminUserSnap = await getDoc(doc(db, "users", adminUid))
      const adminName = adminUserSnap.exists() ? (adminUserSnap.data().nickname || "운영자") : "운영자"
      const myName = userData?.nickname || user.email?.split("@")[0] || "모험가"
      await getOrCreateDMRoom(user.uid, myName, adminUid, adminName)
      router.push("/messages")
    } catch (err) {
      console.error(err)
      alert("문의 시작에 실패했어요")
    } finally {
      setContacting(false)
    }
  }

  const menuItems = [
    { href: "/mapleland",      label: "실시간 경매장", highlight: true },
    { href: "/notice",         label: "공지사항" },
    { href: "/board",          label: "자유게시판" },
    { href: "/verify-request", label: "인증 신청" },
    { href: "/report",         label: "사기꾼 제보" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#1A0900] border-b-2 border-[#8B4513] shadow-lg">
        <div className="px-3 py-2.5 flex justify-between items-center gap-2">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            <span className="text-base font-black text-[#FFD700] tracking-tight">🍁 메이플랜드 경매장</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 px-3">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`px-3 py-1.5 rounded text-xs font-black transition-colors whitespace-nowrap ${
                  item.highlight
                    ? "bg-[#E67E22] text-white hover:bg-[#D35400]"
                    : "text-[#FFB347] hover:text-[#FFD700] hover:bg-[#2D1507]"
                }`}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* 오른쪽 유저 영역 */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user ? (
              <>
                {/* 쪽지함 */}
                <Link href="/messages"
                  className="relative flex items-center justify-center w-8 h-8 rounded bg-[#2D1507] border border-[#8B4513] hover:bg-[#3D2000] transition-colors">
                  <span className="text-sm">💬</span>
                  {unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                  )}
                </Link>

                {/* 프로필 */}
                <Link href="/profile"
                  className="flex items-center gap-1 bg-[#2D1507] border border-[#8B4513] px-2.5 py-1.5 rounded hover:bg-[#3D2000] transition-colors">
                  <span className="text-xs font-black text-[#FFD700]">{userData?.nickname || "모험가"}님</span>
                  {userData?.verified && <span className="text-[9px] text-blue-400 font-black">✓</span>}
                </Link>

                {/* 운영자 문의 - 데스크탑 */}
                <button onClick={handleContactAdmin} disabled={contacting}
                  className="hidden lg:block px-2.5 py-1.5 bg-[#8B4513] hover:bg-[#A0522D] disabled:opacity-50 text-[#FFD700] text-xs font-black rounded border border-[#C17A3E] transition-colors whitespace-nowrap">
                  {contacting ? "연결 중..." : "📩 운영자 문의"}
                </button>

                {/* 로그아웃 - 데스크탑 */}
                <button onClick={() => signOut(auth)}
                  className="hidden lg:block text-[10px] font-bold text-[#8B4513] hover:text-[#C17A3E] transition-colors">
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login"
                className="bg-[#E67E22] hover:bg-[#D35400] text-white px-4 py-1.5 rounded font-black text-xs transition-colors border border-[#C17A3E]">
                로그인
              </Link>
            )}

            {/* 햄버거 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col justify-center items-center w-8 h-8 rounded bg-[#2D1507] border border-[#8B4513] gap-1 hover:bg-[#3D2000] transition-colors">
              <span className={`block w-3.5 h-0.5 bg-[#FFB347] transition-all duration-200 origin-center ${menuOpen ? "rotate-45 translate-y-[6px]" : ""}`} />
              <span className={`block w-3.5 h-0.5 bg-[#FFB347] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-3.5 h-0.5 bg-[#FFB347] transition-all duration-200 origin-center ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""}`} />
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 */}
        {menuOpen && (
          <div className="lg:hidden border-t border-[#2D1507] bg-[#0F0600] py-1 flex flex-col">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 text-sm font-bold transition-colors border-b border-[#1A0900] ${
                  item.highlight
                    ? "text-[#FFD700] bg-[#2D1507]"
                    : "text-[#FFB347] hover:bg-[#1A0900] hover:text-[#FFD700]"
                }`}>
                {item.label}
              </Link>
            ))}
            {user && (
              <>
                <button
                  onClick={() => { handleContactAdmin(); setMenuOpen(false) }}
                  className="px-4 py-3 text-sm font-bold text-left text-[#FFB347] hover:bg-[#1A0900] hover:text-[#FFD700] border-b border-[#1A0900] transition-colors">
                  📩 운영자 문의
                </button>
                <button
                  onClick={() => { signOut(auth); setMenuOpen(false) }}
                  className="px-4 py-3 text-sm font-bold text-left text-red-400 hover:bg-[#1A0900] transition-colors">
                  🚪 로그아웃
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}
