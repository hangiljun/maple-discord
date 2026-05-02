import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "자유게시판 | 메이플디스코드",
  description:
    "메이플스토리·메이플랜드·메이플플래닛 유저들의 자유게시판. 공략, 정보 공유, 잡담까지 메이플 종합 커뮤니티.",
  keywords: [
    "메이플 자유게시판", "메이플스토리 커뮤니티", "메이플랜드 커뮤니티",
    "메이플플래닛 커뮤니티", "메이플 디스코드 게시판", "메이플 정보 공유",
  ],
  alternates: { canonical: "/board" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
