import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "메이플랜드 거래 주의사항 | 사기 예방 가이드",
  description:
    "메이플랜드 메소·아이템 거래 시 주의사항. 사기 예방 방법과 안전 거래 가이드.",
  alternates: { canonical: "https://www.maplediscord.com/tip" },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
