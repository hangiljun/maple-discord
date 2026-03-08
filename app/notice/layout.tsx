import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "공지사항 | 메이플랜드 거래방",
  description:
    "메이플랜드 거래방 공지사항. 운영 안내, 패치노트, 이벤트 소식을 확인하세요.",
  alternates: { canonical: "https://www.maplediscord.com/notice" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
