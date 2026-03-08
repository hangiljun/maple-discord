import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "메이플랜드 사기꾼 제보 | 거래 사기 조회",
  description:
    "메이플랜드 거래 사기꾼 닉네임 조회 및 신고. 메랜 사기 피해를 예방하고 안전한 거래를 도와드립니다.",
  alternates: { canonical: "https://www.maplediscord.com/report" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
