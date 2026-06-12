import type { Metadata } from "next"
import DiscordbotContent from "./DiscordbotContent"

export const metadata: Metadata = {
  title: "봇 기능 소개 | 메이플디스코드",
  description: "메이플디스코드 민원실 봇의 인증, 닉네임 관리, 사기 신고, 자동화 기능을 소개합니다.",
  alternates: { canonical: "/discordbot" },
}

export default function BotPage() {
  return <DiscordbotContent />
}
