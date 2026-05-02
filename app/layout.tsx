import type { Metadata, Viewport } from "next"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"
import Navbar from "./components/Navbar"

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maplediscord.com"),

  title: {
    default: "메이플디스코드 | 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드",
    template: "%s | 메이플디스코드",
  },

  description:
    "메이플스토리, 메이플랜드, 메이플플래닛 3개 게임을 아우르는 메이플 종합 디스코드. " +
    "5만 명 커뮤니티에서 실시간 거래, 캐릭터 정보 조회, 공지 확인까지.",

  keywords: [
    "메이플스토리 디스코드", "메이플랜드 디스코드", "메이플플래닛 디스코드",
    "메이플 디스코드", "메이플스토리 커뮤니티", "메이플랜드 거래방",
    "메이플플래닛 거래방", "메이플 종합 디스코드", "메이플봇", "메이플 캐릭터 조회",
  ],

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.maplediscord.com",
    siteName: "메이플디스코드",
    title: "메이플디스코드 | 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드",
    description:
      "메이플스토리, 메이플랜드, 메이플플래닛 3개 게임 종합 디스코드. 5만 명 커뮤니티.",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "메이플디스코드 - 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "메이플디스코드 | 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드",
    description: "메이플스토리, 메이플랜드, 메이플플래닛 3개 게임 종합 디스코드. 5만 명 커뮤니티.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  alternates: {
    canonical: "https://www.maplediscord.com",
    types: {
      "application/rss+xml": "https://www.maplediscord.com/rss.xml",
    },
  },

  verification: {
    google: "sd0mpvL-LpAQqdFPh2CyLlowAXq-PL_EJQvpmZ0r8H0",
    other: {
      "naver-site-verification": "c95798ba6a654dd8a756d613f745c1afc6d64d81",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.className} bg-gray-100 text-gray-900 antialiased min-h-screen`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
