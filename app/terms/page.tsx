import type { Metadata } from "next"
import TermsContent from "./TermsContent"

export const metadata: Metadata = {
  title: "이용약관 | 메이플디스코드",
  description: "메이플디스코드 민원실 봇 이용약관 / Terms of Service for MapleDiscord Minwonsil Bot",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return <TermsContent />
}
