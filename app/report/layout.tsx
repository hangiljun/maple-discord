import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "사기꾼 제보 | 메이플랜드 거래방",
  description: "메이플랜드 사기 피해를 제보하고 다른 유저를 보호하세요. 사기꾼 계좌번호 및 닉네임을 공유해 안전한 거래 환경을 만들어요.",
  openGraph: {
    title: "사기꾼 제보 | 메이플랜드 거래방",
    description: "메이플랜드 사기 피해를 제보하고 다른 유저를 보호하세요.",
  },
  alternates: {
    canonical: "/report",
  },
}

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children
}
