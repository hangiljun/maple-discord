"use client"
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore'
import { getOrCreateDMRoom } from '@/lib/dm'
import { useRouter } from 'next/navigation'
import { LogOut, MessageCircle, User, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [contacting, setContacting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const innerUnsubs = useRef<Array<() => void>>([])

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      innerUnsubs.current.forEach(u => u())
      innerUnsubs.current = []
      setUser(currentUser)
      if (currentUser) {
        const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data())
        })
        const dmQuery = query(
          collection(db, "dm_rooms"),
          where("participants", "array-contains", currentUser.uid)
        )
        const unsubDM = onSnapshot(dmQuery, (snap) => {
          let total = 0
          snap.docs.forEach(d => { total += d.data().unread?.[currentUser.uid] || 0 })
          setUnreadTotal(total)
        })
        innerUnsubs.current = [unsubUser, unsubDM]
      } else {
        setUserData(null)
        setUnreadTotal(0)
      }
    })
    return () => { unsubAuth(); innerUnsubs.current.forEach(u => u()) }
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
    { href: "/mapleland",      label: "실시간 거래방" },
    { href: "/tip",            label: "거래 주의사항" },
    { href: "/notice",         label: "공지사항" },
    { href: "/board",          label: "자유게시판" },
    { href: "/verify-request", label: "인증 신청" },
    { href: "/report",         label: "사기꾼 제보" },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E8EB]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap shrink-0 mr-2">
            <span className="text-base font-black text-[#191F28] tracking-tight">메이플랜드 거래방</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link key={item.href} href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-[#3182F6] bg-[#EBF3FE] font-semibold"
                      : "text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6]"
                  }`}>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* 오른쪽 버튼 영역 */}
          <div className="flex items-center gap-1 ml-auto">
            {user ? (
              <>
                <Link href="/profile"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] rounded-lg transition-colors text-sm font-medium">
                  <User size={15} />
                  마이페이지
                </Link>

                <button onClick={() => signOut(auth)}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] rounded-lg transition-colors text-sm font-medium">
                  <LogOut size={15} />
                  로그아웃
                </button>

                <Link href="/messages"
                  className="relative flex items-center gap-1.5 px-3 py-1.5 text-[#8B95A1] hover:text-[#191F28] hover:bg-[#F2F4F6] rounded-lg transition-colors text-sm font-medium">
                  <MessageCircle size={15} />
                  1:1 대화
                  {unreadTotal > 0 && (
                    <span className="absolute top-1.5 left-5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Link>
              </>
            ) : (
              <Link href="/login"
                className="flex items-center gap-1.5 bg-[#3182F6] hover:bg-[#1C6EE8] text-white px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors">
                <User size={14} />
                로그인
              </Link>
            )}

            {/* 햄버거 */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-[#8B95A1] hover:bg-[#F2F4F6] transition-colors">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5E8EB] py-2 flex flex-col">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#3182F6] bg-[#EBF3FE]"
                      : "text-[#191F28] hover:bg-[#F2F4F6]"
                  }`}>
                  {item.label}
                </Link>
              )
            })}
            {user ? (
              <>
                <Link href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="px-5 py-3 text-sm font-medium text-[#191F28] hover:bg-[#F2F4F6] transition-colors border-t border-[#E5E8EB] mt-1 flex items-center gap-2">
                  <User size={15} /> 마이페이지
                </Link>
                <button
                  onClick={() => { handleContactAdmin(); setMenuOpen(false) }}
                  className="px-5 py-3 text-sm font-medium text-left text-[#191F28] hover:bg-[#F2F4F6] transition-colors flex items-center gap-2">
                  <MessageCircle size={15} /> 운영자 문의
                </button>
                <button
                  onClick={() => { signOut(auth); setMenuOpen(false) }}
                  className="px-5 py-3 text-sm font-medium text-left text-red-500 hover:bg-[#F2F4F6] transition-colors flex items-center gap-2">
                  <LogOut size={15} /> 로그아웃
                </button>
              </>
            ) : (
              <Link href="/login"
                onClick={() => setMenuOpen(false)}
                className="mx-4 my-2 py-2.5 bg-[#3182F6] hover:bg-[#1C6EE8] text-white rounded-lg font-semibold text-sm text-center transition-colors">
                로그인
              </Link>
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
