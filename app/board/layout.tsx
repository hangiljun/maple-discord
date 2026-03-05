import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "자유게시판 | 메이플랜드 거래방",
  description: "메이플랜드 유저들의 자유게시판 — 공략, 거래후기, 일상 등 자유롭게 이야기해요.",
  openGraph: {
    title: "자유게시판 | 메이플랜드 거래방",
    description: "메이플랜드 유저들의 자유게시판 — 공략, 거래후기, 일상 등 자유롭게 이야기해요.",
  },
  alternates: {
    canonical: "/board",
  },
}

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return children
}
