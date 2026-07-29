import type { Metadata } from "next"
import TipContent from "./TipContent"

export const metadata: Metadata = {
  title: "안전 거래 주의사항 | 메이플디스코드",
  description: "메이플스토리·메이플랜드·메이플플래닛 개인 간 거래 사기 방지 가이드. 최근 유행 사기 유형과 안전 거래 체크리스트를 확인하세요.",
  keywords: [
    "메이플 거래 사기", "메이플랜드 안전거래", "메이플스토리 거래 주의사항",
    "메이플 사기 예방", "메이플 아이템 거래", "메이플 메소 거래",
  ],
  alternates: { canonical: "https://www.maplediscord.com/tip" },
}

export default function TipPage() {
  return <TipContent />
}
