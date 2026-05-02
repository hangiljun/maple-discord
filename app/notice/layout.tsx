import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "공지사항 | 메이플디스코드",
  description:
    "메이플디스코드 공지사항. 메이플스토리·메이플랜드·메이플플래닛 패치노트, 운영 안내, 이벤트 소식을 확인하세요.",
  keywords: [
    "메이플 공지사항", "메이플스토리 패치노트", "메이플랜드 공지",
    "메이플플래닛 공지", "메이플 디스코드 공지", "메이플 업데이트",
  ],
  alternates: { canonical: "/notice" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
