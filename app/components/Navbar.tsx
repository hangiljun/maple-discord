"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

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

  const menuItems = [
    { href: "/notice",         label: "📢 공지사항",      highlight: false },
    { href: "/board",          label: "자유게시판",        highlight: false },
    { href: "/mapleland",      label: "메이플랜드 거래방", highlight: true  },
    { href: "/verify-request", label: "인증 신청",         highlight: false },
    { href: "/report",         label: "사기꾼 제보",       highlight: false },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b-4 border-[#FFD8A8] px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">

          {/* 왼쪽: 로고 + 데스크탑 메뉴 */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-black text-[#E67E22] flex items-center gap-1">
              🍁 메이플 디스코드
            </Link>
            {/* 데스크탑 메뉴 */}
            <div className="hidden lg:flex gap-4 font-bold text-[#A64D13] text-sm">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}
                  className={item.highlight
                    ? "text-[#E67E22] bg-[#FFF4E6] px-4 py-1 rounded-full border border-[#FFD8A8] whitespace-nowrap"
                    : "hover:text-[#E67E22] transition whitespace-nowrap"}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 오른쪽: 유저 영역 + 햄버거 */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* DM 아이콘 */}
                <Link href="/messages"
                  className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#FFF4E6] border-2 border-[#FFD8A8] hover:bg-[#FFE8CC] transition-colors">
                  <span className="text-base">💬</span>
                  {unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                      {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                  )}
                </Link>
                {/* 프로필 */}
                <Link href="/profile"
                  className="flex items-center gap-1 bg-[#FFF4E6] px-3 py-1.5 rounded-full border-2 border-[#FFD8A8] hover:bg-[#FFE8CC] transition-colors">
                  <span className="text-xs font-black text-[#E67E22]">{userData?.nickname || "모험가"}님</span>
                  {userData?.verified && <span className="text-[10px] text-blue-500 font-black">✓</span>}
                </Link>
                {/* 로그아웃 - 데스크탑만 */}
                <button onClick={() => signOut(auth)}
                  className="hidden lg:block text-[10px] font-bold text-gray-400 hover:text-red-400 transition-colors">
                  로그아웃
                </button>
              </div>
            ) : (
              <Link href="/login"
                className="bg-[#E67E22] text-white px-5 py-2 rounded-full font-black text-xs shadow-md active:scale-95">
                로그인
              </Link>
            )}

            {/* 햄버거 버튼 - 모바일만 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl bg-[#FFF4E6] border-2 border-[#FFD8A8] gap-1.5 hover:bg-[#FFE8CC] transition-colors">
              <span className={`block w-4 h-0.5 bg-[#E67E22] transition-all duration-300 origin-center ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-4 h-0.5 bg-[#E67E22] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-0.5 bg-[#E67E22] transition-all duration-300 origin-center ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {menuOpen && (
          <div className="lg:hidden mt-3 pb-2 border-t-2 border-[#FFE8CC] pt-3 flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-3 rounded-2xl font-bold text-sm transition-colors ${
                  item.highlight
                    ? "text-[#E67E22] bg-[#FFF4E6] border border-[#FFD8A8]"
                    : "text-[#A64D13] hover:bg-[#FFF4E6] active:bg-[#FFE8CC]"
                }`}>
                {item.label}
              </Link>
            ))}
            {/* 모바일 로그아웃 */}
            {user && (
              <button
                onClick={() => { signOut(auth); setMenuOpen(false) }}
                className="px-4 py-3 rounded-2xl font-bold text-sm text-left text-red-400 hover:bg-red-50 transition-colors">
                🚪 로그아웃
              </button>
            )}
          </div>
        )}
      </nav>

      {/* 메뉴 열렸을 때 바깥 클릭하면 닫기 */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}