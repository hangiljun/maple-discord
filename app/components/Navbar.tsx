"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Firestore에서 실시간으로 인증 상태 감시
        const userRef = doc(db, "users", currentUser.uid)
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setIsVerified(docSnap.data().verified === true)
          }
        })
        return () => unsubDoc()
      } else {
        setIsVerified(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      await signOut(auth)
      alert("로그아웃 되었습니다.")
    }
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-gray-800 text-white sticky top-0 z-50">
      
      {/* 왼쪽 메뉴 그룹 */}
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-bold text-orange-500 tracking-tighter hover:opacity-80 transition">
          MAPLE DISCORD
        </Link>
        
        <ul className="flex gap-8 items-center text-sm font-medium">
          <li className="hover:text-red-400 transition font-bold text-red-500 text-base">
            <Link href="/report">사기꾼 제보</Link>
          </li>
          <li className="hover:text-orange-400 transition font-bold text-orange-200">
            <Link href="/mapleland">메이플랜드 거래방</Link>
          </li>

          {/* 메이플스토리 드롭다운 */}
          <li className="group relative cursor-pointer hover:text-orange-400 transition text-gray-300">
            메이플스토리
            <ul className="absolute hidden group-hover:block bg-[#252525] p-2 rounded shadow-2xl top-full left-0 w-32 mt-2 border border-gray-700">
              <li className="p-2 hover:bg-gray-800 rounded text-xs text-white">
                <Link href="/maplestory/notice">공지사항</Link>
              </li>
            </ul>
          </li>

          {/* 메이플랜드 드롭다운 */}
          <li className="group relative cursor-pointer hover:text-orange-400 transition text-gray-300">
            메이플랜드
            <ul className="absolute hidden group-hover:block bg-[#252525] p-2 rounded shadow-2xl top-full left-0 w-32 mt-2 border border-gray-700">
              <li className="p-2 hover:bg-gray-800 rounded text-xs text-white">
                <Link href="/mapleland/notice">공지사항</Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* 오른쪽 유저 세션 */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-300 font-semibold">{user.email?.split('@')[0]}님</span>
              {/* ✅ 인증 마크 표시 섹션 */}
              {isVerified && (
                <span className="bg-blue-500 text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold" title="인증된 사용자">
                  ✓
                </span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-orange-500 hover:text-orange-400 transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded text-xs font-bold transition shadow-md text-white">
              로그인 / 가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}