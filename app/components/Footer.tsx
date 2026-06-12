import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-gray-400">© 2025 메이플디스코드. All rights reserved.</p>
        <div className="flex gap-5 text-xs">
          <Link href="/terms" className="text-gray-400 hover:text-gray-700 transition-colors">이용약관</Link>
          <Link href="/privacy" className="text-gray-400 hover:text-gray-700 transition-colors">개인정보 처리방침</Link>
        </div>
      </div>
    </footer>
  )
}
