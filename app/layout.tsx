import type { Metadata, Viewport } from "next"
import "./globals.css"
import Navbar from "./components/Navbar"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maple-discord.vercel.app"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "메이플 디스코드",
  description: "메이플랜드 실시간 거래 커뮤니티 — 아이템 구매·판매·교환을 실시간 채팅으로! 인증 유저와 안전하게 거래하세요.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "메이플 디스코드",
    description: "메이플랜드 실시간 거래 커뮤니티 — 아이템 구매·판매·교환을 실시간 채팅으로! 인증 유저와 안전하게 거래하세요.",
  },
  twitter: {
    card: "summary",
    description: "메이플랜드 실시간 거래 커뮤니티",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 text-gray-900 antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
