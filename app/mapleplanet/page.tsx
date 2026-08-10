import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '메이플플래닛 디스코드 거래방·파티',
  description: '메이플플래닛 디스코드 거래방. 플래닛 메소·아이템 거래, 파티·쩔 구인, 자리 판매 채널까지. 안전하게 메이플플래닛 유저와 거래하세요.',
  alternates: { canonical: 'https://www.maplediscord.com/mapleplanet' },
  openGraph: {
    url: '/mapleplanet',
    title: '메이플플래닛 디스코드 거래방·파티',
    description: '메이플플래닛 디스코드 거래방. 플래닛 메소·아이템 거래, 파티·쩔 구인, 자리 판매 채널까지.',
  },
}

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://www.maplediscord.com" },
    { "@type": "ListItem", "position": 2, "name": "메이플플래닛 디스코드" }
  ]
}

export default function MaplePlanetPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* 히어로 */}
      <section className="relative bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-sm font-semibold mb-6">
              🪐 MaplePlanet
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              메이플플래닛 디스코드
            </h1>
            <h2 className="text-lg md:text-xl text-gray-600 font-medium">
              플래닛 거래방 · 파티/쩔 · 자리 판매
            </h2>
          </div>

          {/* 히어로 이미지 placeholder */}
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-gradient-to-br from-purple-100 to-pink-100">
            <div className="w-full aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🪐</div>
                <p className="text-gray-600 font-medium">메이플플래닛 디스코드 거래방·파티</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO 텍스트 */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-4">
          <p className="text-gray-700 text-base leading-relaxed">
            메이플플래닛 디스코드는 플래닛 유저를 위한 <strong className="text-gray-900">거래방, 파티·쩔, 자리 판매</strong> 채널을 갖추고 있습니다. 플래닛 거래방에서 메소·아이템을 거래하고, 파티·쩔 채널에서 사냥 파티와 쩔을 구할 수 있습니다.
          </p>
          <p className="text-gray-700 text-base leading-relaxed">
            특히 <strong className="text-gray-900">자리 판매</strong> 채널은 메이플플래닛 유저를 위한 사냥터 자리 거래 공간으로, 좋은 사냥 자리를 사고팔 수 있습니다. 공지·자유대화·가이드 통합 채널과 신고문의로 안전하게 이용하세요.
          </p>
        </div>
      </section>

      {/* 채널 기능 카드 */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-black text-center mb-12 text-gray-900">
            메이플플래닛 디스코드 채널
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 카드 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">플래닛 거래방</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                메이플플래닛 메소·아이템 거래 전용
              </p>
            </div>

            {/* 카드 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">파티·쩔</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                파티 모집, 쩔 구인
              </p>
            </div>

            {/* 카드 3 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">자리 판매</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                사냥터 자리 거래 (플래닛 특화)
              </p>
            </div>

            {/* 카드 4 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">통합 커뮤니티 + 안전</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                공지·자유대화·가이드 + 신고문의
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <a
          href="https://discord.gg/2UwBw8dnSv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-lg rounded-xl transition-all hover:-translate-y-1 shadow-lg"
        >
          <svg width="24" height="24" viewBox="0 0 71 55" fill="currentColor">
            <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
          </svg>
          메이플플래닛 디스코드 입장하기 →
        </a>
      </section>
    </>
  )
}
