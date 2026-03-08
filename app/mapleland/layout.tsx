import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "실시간 메이플랜드 메소·아이템 거래방",
  description:
    "메이플랜드 메소 거래, 아이템 구매·판매·교환을 실시간 채팅으로. 인증 유저와 안전하게 거래하세요. 메랜 실시간 거래방.",
  alternates: { canonical: "https://www.maplediscord.com/mapleland" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
