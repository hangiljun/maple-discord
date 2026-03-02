"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  return (
    <nav className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-gray-800 text-white sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-orange-500 tracking-tighter">
        MAPLE DISCORD
      </Link>
      
      <ul className="flex gap-6 items-center text-sm font-medium">
        <li className="hover:text-red-400 transition font-bold text-red-500">
          <Link href="/report">사기꾼 제보</Link>
        </li>
        <li className="hover:text-orange-400 transition font-bold text-orange-200">
          <Link href="/mapleland">메이플랜드 거래방</Link>
        </li>
        
        {user ? (
          <li className="flex items-center gap-3 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
            <span className="text-[11px] text-gray-300">{user.email?.split('@')[0]}님</span>
            <button 
              onClick={() => signOut(auth)}
              className="text-[11px] font-bold text-orange-500 hover:text-orange-400"
            >
              로그아웃
            </button>
          </li>
        ) : (
          <li>
            <Link href="/login" className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded text-xs font-bold transition">
              로그인 / 가입
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}