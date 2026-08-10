import type { Metadata } from "next"
import TipContent from "./TipContent"

export const metadata: Metadata = {
  title: "안전 거래 주의사항",
  description: "메이플스토리·메이플랜드·메이플플래닛 개인 간 거래 사기 방지 가이드. 최근 유행 사기 유형과 안전 거래 체크리스트를 확인하세요.",
  keywords: [
    "메이플 거래 사기", "메이플랜드 안전거래", "메이플스토리 거래 주의사항",
    "메이플 사기 예방", "메이플 아이템 거래", "메이플 메소 거래",
  ],
  alternates: { canonical: "https://www.maplediscord.com/tip" },
  openGraph: {
    url: '/tip',
    title: '안전 거래 주의사항',
    description: '메이플스토리·메이플랜드·메이플플래닛 개인 간 거래 사기 방지 가이드. 최근 유행 사기 유형과 안전 거래 체크리스트를 확인하세요.',
  },
}

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "거래 전 상대방 인증은 어떻게 확인하나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "메이플디스코드 거래방에서는 1원 송금 인증과 사진 인증을 통해 본인 인증을 완료한 유저만 참여할 수 있습니다. 거래 전 상대방의 인증 뱃지를 확인하세요."
      }
    },
    {
      "@type": "Question",
      "name": "더치트 조회란 무엇인가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "더치트는 메이플 거래 사기 이력을 확인할 수 있는 커뮤니티 데이터베이스입니다. 거래 전 상대방의 닉네임을 더치트에서 조회하여 사기 이력을 확인할 수 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "1원 송금 인증이 왜 필요한가요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "1원 송금 인증은 상대방의 실명과 계좌 정보를 확인하는 가장 확실한 방법입니다. 거래 전 1원을 송금받아 입금자명을 확인하고, 신고 시 증거로 활용할 수 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "사기를 당했을 때는 어떻게 해야 하나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "즉시 메이플디스코드 사기꾼 제보 채널에 신고하고, 거래 증거(스크린샷, 계좌 이체 내역)를 수집하여 경찰청 사이버안전국에 신고하세요. 커뮤니티 공유로 추가 피해를 막을 수 있습니다."
      }
    },
    {
      "@type": "Question",
      "name": "메이플 아이템 거래 시 주의할 점은?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "거래 전 아이템의 실제 소유 여부를 스크린샷으로 확인하고, 게임 내 거래 창에서 아이템을 직접 확인한 후 거래하세요. 선입금 요구 시 반드시 1원 송금 인증을 받아야 합니다."
      }
    }
  ]
}

export default function TipPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <TipContent />
    </>
  )
}
