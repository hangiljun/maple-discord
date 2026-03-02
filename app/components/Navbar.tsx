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
    // 🔐 로그인 상태 감지
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // 🔥 실시간 유저 데이터(닉네임, 인증여부) 동기화
        const userRef = doc(db, "users", currentUser.uid)
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data())
          }
        })
        return () => unsubDoc() // 리스너 해제
      } else {
        setUserData(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut(auth)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-[#FFD8A8] px-6 py-4 flex justify-between items-center shadow-sm">
      
      {/* 🍁 로고 및 메인 메뉴 */}
      <div className="flex items-center gap-10">
        <Link href="/" className="text-2xl font-black text-[#E67E22] flex items-center gap-2 tracking-tighter hover:scale-105 transition-transform">
          🍁 <span className="hidden sm:inline">MAPLE DISCORD</span>
        </Link>
        
        <div className="hidden md:flex gap-6 font-black text-[#A64D13]">
          <Link href="/report" className="hover:text-[#E67E22] transition-colors">
            사기꾼 제보
          </Link>
          <Link href="/mapleland" className="text-[#E67E22] bg-[#FFF4E6] px-5 py-1.5 rounded-full border-2 border-[#FFD8A8] hover:bg-[#E67E22] hover:text-white transition-all">
            메이플랜드 거래소
          </Link>
        </div>
      </div>

      {/* 👤 유저 정보 및 로그인 섹션 */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {/* 프로필 바로가기 */}
            <Link href="/profile" className="flex items-center gap-2 bg-[#FFF4E6] px-4 py-2 rounded-full border-2 border-[#FFD8A8] hover:shadow-md transition-all active:scale-95">
              <span className="text-sm font-black text-[#E67E22]">
                {userData?.nickname || user.email?.split('@')[0]}님
              </span>
              {/* 인증 마크 */}
              {userData?.verified && (
                <span className="bg-blue-500 text-white text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-black shadow-sm" title="인증된 사용자">
                  ✓
                </span>
              )}
            </Link>
            
            {/* 로그아웃 버튼 */}
            <button 
              onClick={handleLogout} 
              className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link 
            href="/login" 
            className="bg-[#E67E22] text-white px-7 py-2.5 rounded-full font-black text-sm shadow-md hover:bg-[#D35400] transition-all active:scale-95"
          >
            로그인
          </Link>
        )}
      </div>
    </nav>
  )
}