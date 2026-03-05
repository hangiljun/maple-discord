import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "실시간 거래방 | 메이플랜드 거래방",
  description: "메이플랜드 실시간 거래방 — 아이템 사고팔기, 삽니다·팝니다 채팅으로 빠르게 거래하세요.",
  openGraph: {
    title: "실시간 거래방 | 메이플랜드 거래방",
    description: "메이플랜드 실시간 거래방 — 아이템 사고팔기, 삽니다·팝니다 채팅으로 빠르게 거래하세요.",
  },
  alternates: {
    canonical: "/mapleland",
  },
}

export default function MaplelandLayout({ children }: { children: React.ReactNode }) {
  return children
}
