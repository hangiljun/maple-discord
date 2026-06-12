import type { Metadata } from "next"
import PrivacyContent from "./PrivacyContent"

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 메이플디스코드",
  description: "메이플디스코드 민원실 봇 개인정보 처리방침 / Privacy Policy for MapleDiscord Minwonsil Bot",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
