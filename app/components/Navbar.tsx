"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

  // 로그인 상태 실시간 감시
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
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
      
      {/* 1. 왼쪽: 로고 및 메인 메뉴들 */}
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-bold text-orange-500 tracking-tighter">
          MAPLE DISCORD
        </Link>
        
        <ul className="flex gap-8 items-center text-sm font-medium">
          {/* 사기꾼 제보 (강조) */}
          <li className="hover:text-red-400 transition font-bold text-red-500">
            <Link href="/report">사기꾼 제보</Link>
          </li>

          {/* 메이플랜드 거래방 */}
          <li className="hover:text-orange-400 transition font-bold text-orange-200">
            <Link href="/mapleland">메이플랜드 거래방</Link>
          </li>

          {/* 메이플스토리 드롭다운 */}
          <li className="group relative cursor-pointer hover:text-orange-400 transition text-gray-300">
            메이플스토리
            <ul className="absolute hidden group-hover:block bg-[#252525] p-2 rounded shadow-2xl top-full left-0 w-32 mt-2 border border-gray-700">
              <li className="p-2 hover:bg-gray-800 rounded">
                <Link href="/maplestory/notice">공지사항</Link>
              </li>
            </ul>
          </li>

          {/* 메이플랜드 드롭다운 */}
          <li className="group relative cursor-pointer hover:text-orange-400 transition text-gray-300">
            메이플랜드
            <ul className="absolute hidden group-hover:block bg-[#252525] p-2 rounded shadow-2xl top-full left-0 w-32 mt-2 border border-gray-700">
              <li className="p-2 hover:bg-gray-800 rounded">
                <Link href="/mapleland/notice">공지사항</Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      {/* 2. 오른쪽 상단: 로그인 / 회원가입 세션 */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3 bg-gray-800 px-4 py-1.5 rounded-full border border-gray-700">
            <span className="text-xs text-gray-300 font-semibold">{user.email?.split('@')[0]}님</span>
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-orange-500 hover:text-orange-400 transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link 
              href="/login" 
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-xs font-bold transition"
            >
              로그인
            </Link>
            <Link 
              href="/login" // 회원가입도 로그인 페이지에서 처리하므로 같은 경로
              className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded text-xs font-bold transition"
            >
              회원가입
            </Link>
          </div>
        )}
        
        {/* 관리자 버튼 (작게 배치) */}
        <Link href="/admin" className="ml-2 text-[10px] text-gray-600 hover:text-gray-400 transition">
          Admin
        </Link>
      </div>
      
    </nav>
  )
}