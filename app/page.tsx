import type { Metadata } from "next"
import HomeClient from "./components/HomeClient"

export const metadata: Metadata = {
  title: "메이플랜드 거래방 | 메랜 메소·아이템 안전거래 디스코드",
  description:
    "메이플랜드 메소 거래, 메랜 아이템 안전거래, 아이템 교환 전문 거래방. " +
    "메랜 메소 시세 확인 및 안전한 직거래. 메이플랜드 디스코드 커뮤니티.",
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  return <HomeClient />
}
