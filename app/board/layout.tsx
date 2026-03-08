import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "자유게시판 | 메이플랜드 커뮤니티",
  description:
    "메이플랜드 유저들의 자유게시판. 공략, 정보 공유, 잡담 등 메랜 커뮤니티.",
  alternates: { canonical: "https://www.maplediscord.com/board" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
