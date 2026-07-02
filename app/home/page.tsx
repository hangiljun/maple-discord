import type { Metadata } from "next"
import HomeContent from "./HomeContent"

export const metadata: Metadata = {
  title: "메이플디스코드 | 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드",
  description:
    "메이플스토리, 메이플랜드, 메이플플래닛 3개 게임을 아우르는 메이플 종합 디스코드. " +
    "5만 명 커뮤니티에서 실시간 거래, 캐릭터 정보 조회, 공지 확인까지.",
  alternates: { canonical: "https://www.maplediscord.com/home" },
  keywords: [
    "메이플스토리 디스코드", "메이플랜드 디스코드", "메이플플래닛 디스코드",
    "메이플 디스코드", "메이플 커뮤니티", "메이플봇", "메이플 캐릭터 조회",
    "메이플 종합 디스코드", "메이플 디스코드 서버", "국내 최대 메이플 디스코드",
    "메이플 거래방", "메이플 아이템 거래방", "메이플 메소 거래방",
    "메이플 홍보", "메이플 홍보 디스코드", "메이플 길드 홍보", "메이플 캐릭터 홍보",
    "메이플 파티 모집", "메이플 파티 구인", "메이플 공대 모집",
    "메이플플래닛", "메이플플래닛 커뮤니티", "메이플플래닛 디스코드 서버",
    "메이플플래닛 파티 모집", "메이플플래닛 길드 모집", "메이플플래닛 거래",
    "메이플플래닛 메소 거래", "메이플플래닛 아이템 거래", "메이플플래닛 공략",
    "메이플플래닛 보스", "메이플플래닛 채팅", "메이플플래닛 유저",
    "msd디스코드",
  ],
}

// Schema.org 구조화 데이터 (Google SEO)
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "메이플디스코드",
  alternateName: ["msd디스코드", "메디"],
  url: "https://www.maplediscord.com",
  logo: "https://www.maplediscord.com/logo.png",
  description: "메이플스토리, 메이플랜드, 메이플플래닛 종합 디스코드 커뮤니티",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "50000"
  },
  sameAs: [
    "https://discord.gg/VB3kTJK"
  ]
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "메이플디스코드",
  url: "https://www.maplediscord.com",
  description: "메이플스토리·메이플랜드·메이플플래닛 종합 디스코드 커뮤니티",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.maplediscord.com/board?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}

export default function HomePage() {
  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeContent />
    </>
  )
}
