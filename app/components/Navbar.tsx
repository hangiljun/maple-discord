"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) setUserData(docSnap.data())
        })
      }
    })
    return () => unsubscribe()
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-[#FFD8A8] px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-black text-[#E67E22] flex items-center gap-1">
          🍁 메이플 디스코드
        </Link>
        
        {/* 복구된 메뉴들 */}
        <div className="hidden lg:flex gap-6 font-bold text-[#A64D13] text-sm">
          <Link href="/report" className="hover:text-[#E67E22] transition">사기꾼 제보</Link>
          <Link href="/mapleland" className="text-[#E67E22] bg-[#FFF4E6] px-4 py-1 rounded-full border border-[#FFD8A8]">메이플랜드 거래방</Link>
          <Link href="/maplestory" className="hover:text-[#E67E22] transition">메이플스토리</Link>
          <Link href="/mapleland-info" className="hover:text-[#E67E22] transition">메이플랜드</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-1 bg-[#FFF4E6] px-3 py-1.5 rounded-full border-2 border-[#FFD8A8]">
              <span className="text-xs font-black text-[#E67E22]">{userData?.nickname || "모험가"}님</span>
              {userData?.verified && <span className="text-[10px] text-blue-500 font-black">✓</span>}
            </Link>
            <button onClick={() => signOut(auth)} className="text-[10px] font-bold text-gray-400 hover:text-red-400">로그아웃</button>
          </div>
        ) : (
          <Link href="/login" className="bg-[#E67E22] text-white px-6 py-2 rounded-full font-black text-xs shadow-md active:scale-95">로그인</Link>
        )}
      </div>
    </nav>
  )
}