"use client"
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-gray-800 text-white sticky top-0 z-50">
      {/* 사이트 이름/로고 */}
      <Link href="/" className="text-xl font-bold text-orange-500 tracking-tighter">
        MAPLE DISCORD
      </Link>
      
      {/* 중앙 메뉴 */}
      <ul className="flex gap-8 items-center text-sm font-medium">
        {/* 메이플스토리 메뉴 */}
        <li className="group relative cursor-pointer hover:text-orange-400 transition">
          메이플스토리
          <ul className="absolute hidden group-hover:block bg-[#252525] p-2 rounded shadow-2xl top-full left-0 w-32 mt-2 border border-gray-700">
            <li className="p-2 hover:bg-gray-800 rounded">
              <Link href="/maplestory/notice">공지사항</Link>
            </li>
          </ul>
        </li>

        {/* 메이플랜드 거래방 (핵심) */}
        <li className="hover:text-orange-400 transition font-bold text-orange-200">
          <Link href="/mapleland">메이플랜드 거래방</Link>
        </li>

        {/* 메이플랜드 메뉴 */}
        <li className="group relative cursor-pointer hover:text-orange-400 transition">
          메이플랜드
          <ul className="absolute hidden group-hover:block bg-[#252525] p-2 rounded shadow-2xl top-full left-0 w-32 mt-2 border border-gray-700">
            <li className="p-2 hover:bg-gray-800 rounded">
              <Link href="/mapleland/notice">공지사항</Link>
            </li>
          </ul>
        </li>
      </ul>

      {/* 관리자 (숨김 느낌으로 작게) */}
      <Link href="/admin" className="text-[10px] text-gray-600 hover:text-gray-400 transition">
        Admin
      </Link>
    </nav>
  )
}