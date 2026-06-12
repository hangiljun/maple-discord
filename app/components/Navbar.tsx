"use client"
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLang } from '../contexts/LanguageContext'

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
  </svg>
)

const menuItems = {
  ko: [
    { href: "/home",       label: "홈" },
    { href: "/tip",        label: "거래 주의사항" },
    { href: "/notice",     label: "공지사항" },
    { href: "/board",      label: "자유게시판" },
    { href: "/discordbot", label: "봇 기능" },
  ],
  en: [
    { href: "/home",       label: "Home" },
    { href: "/tip",        label: "Trade Guide" },
    { href: "/notice",     label: "Notices" },
    { href: "/board",      label: "Free Board" },
    { href: "/discordbot", label: "Bot Features" },
  ],
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { lang, setLang } = useLang()
  const items = menuItems[lang]

  const LangToggle = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex rounded-lg border border-[#E5E8EB] overflow-hidden text-xs font-bold ${mobile ? "w-full" : ""}`}>
      <button
        onClick={() => setLang("ko")}
        className={`flex-1 px-3 py-1.5 transition-colors ${lang === "ko" ? "bg-[#3182F6] text-white" : "text-[#8B95A1] hover:bg-[#F2F4F6]"}`}>
        한국어
      </button>
      <button
        onClick={() => setLang("en")}
        className={`flex-1 px-3 py-1.5 transition-colors ${lang === "en" ? "bg-[#3182F6] text-white" : "text-[#8B95A1] hover:bg-[#F2F4F6]"}`}>
        English
      </button>
    </div>
  )

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E8EB]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-2">

          {/* 로고 */}
          <Link href="/" className="flex items-center gap-1.5 whitespace-nowrap shrink-0 mr-2">
            <span className="text-base font-black text-[#191F28] tracking-tight">메이플디스코드</span>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {items.map((item) => {
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

          {/* 데스크탑 언어 토글 */}
          <div className="hidden lg:flex ml-auto">
            <LangToggle />
          </div>

          {/* 모바일 햄버거 */}
          <div className="ml-auto lg:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8B95A1] hover:bg-[#F2F4F6] transition-colors">
              {menuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* 모바일 드롭다운 */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-[#E5E8EB] py-2 flex flex-col">
            {items.map((item) => {
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
            {/* 모바일 언어 토글 */}
            <div className="px-5 py-3 border-t border-[#E5E8EB] mt-1">
              <LangToggle mobile />
            </div>
          </div>
        )}
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}
