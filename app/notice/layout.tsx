import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "공지사항 | 메이플랜드 거래방",
  description: "메이플랜드 거래방 공식 공지사항 — 업데이트, 이벤트, 주요 안내를 확인하세요.",
  openGraph: {
    title: "공지사항 | 메이플랜드 거래방",
    description: "메이플 디스코드 공식 공지사항 — 업데이트, 이벤트, 주요 안내를 확인하세요.",
  },
  alternates: {
    canonical: "/notice",
  },
}

export default function NoticeLayout({ children }: { children: React.ReactNode }) {
  return children
}
