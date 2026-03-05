import type { Metadata, Viewport } from "next"
import "./globals.css"
import Navbar from "./components/Navbar"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.maplediscord.com"),

  title: {
    default: "메이플랜드 거래방 | 메랜 메소·아이템 안전거래 디스코드",
    template: "%s | 메이플랜드 거래방",
  },

  description:
    "메이플랜드 메소 거래, 메랜 아이템 안전거래, 아이템 교환 전문 거래방. " +
    "메랜 메소 시세 확인 및 안전한 직거래. 메이플랜드 디스코드 커뮤니티.",

  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://www.maplediscord.com",
    siteName: "메이플랜드 거래방",
    title: "메이플랜드 거래방 | 메랜 메소·아이템 안전거래 디스코드",
    description:
      "메이플랜드 메소 거래, 아이템 안전거래, 교환 전문 디스코드 거래방. 메랜 유저라면 여기로!",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "메이플랜드 거래방 - 메소·아이템 안전거래 디스코드",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "메이플랜드 거래방 | 메랜 메소·아이템 안전거래 디스코드",
    description: "메이플랜드 메소 거래, 아이템 안전거래, 교환 전문 디스코드 거래방.",
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
      <body className="bg-gray-100 text-gray-900 antialiased min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
