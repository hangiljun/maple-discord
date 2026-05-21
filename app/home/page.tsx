import type { Metadata } from "next"
import Link from "next/link"
import HeroTitle from "./HeroTitle"

export const metadata: Metadata = {
  title: "메이플디스코드 | 메이플스토리·메이플랜드·메이플플래닛 종합 디스코드",
  description:
    "메이플스토리, 메이플랜드, 메이플플래닛 3개 게임을 아우르는 메이플 종합 디스코드. " +
    "5만 명 커뮤니티에서 실시간 거래, 캐릭터 정보 조회, 공지 확인까지.",
  alternates: { canonical: "/home" },
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
  ],
}

const DISCORD_URL = "https://discord.gg/2UwBw8dnSv"

const GAMES = [
  {
    name: "메이플스토리", tag: "KMS · GMS", color: "#f59e0b",
    border: "rgba(245,158,11,0.35)", icon: "🍁",
    features: ["메소 · 아이템 거래방", "캐릭터 정보 조회기능", "패치노트 · 이벤트 공지", "링크스킬 · 유니온 조회"],
  },
  {
    name: "메이플랜드", tag: "클래식 서버", color: "#3182F6",
    border: "rgba(49,130,246,0.35)", icon: "🌿",
    features: ["메소 · 아이템 거래방", "안전거래 인증 시스템", "사기꾼 제보 채널", "거래 주의사항 안내"],
  },
  {
    name: "메이플플래닛", tag: "신규 서버", color: "#a855f7",
    border: "rgba(168,85,247,0.35)", icon: "🪐",
    features: ["전용 채널 운영 중", "커뮤니티 · 자유게시판", "공지 · 업데이트 알림", "유저 간 정보 공유"],
  },
]

const FEATURES = [
  { icon: "🤖", title: "메이플봇", desc: "캐릭터 정보, 링크스킬, 유니온을 슬래시 커맨드 하나로 조회." },
  { icon: "🔒", title: "인증 거래 시스템", desc: "유저 인증 후 거래 채널 입장. 사기 발생 시 즉시 제보 및 차단 처리." },
  { icon: "📢", title: "게임별 공지 채널", desc: "메이플스토리·메이플랜드·메이플플래닛 패치노트와 변경사항을 가장 빠르게." },
  { icon: "💬", title: "활발한 커뮤니티", desc: "5만 명이 모인 국내 최대 메이플 종합 디스코드. 정보 공유부터 친목까지." },
]

const COMMANDS = [
  {
    name: "/파티", badge: "파티모집", color: "#f43f5e",
    desc: "파티 모집 공고를 생성합니다. 모집자·신청자·상태가 임베드로 표시되며 참가 신청과 마감을 버튼으로 처리해요.",
    example: "/파티 개미굴",
    features: ["🍁 파티 모집 임베드 자동 생성", "✋ 참가하기 버튼으로 신청자 자동 등록", "🔒 파티 마감 버튼으로 모집 종료", "👥 모집자 · 신청자 · 상태 실시간 표시"],
  },
  {
    name: "/정보", badge: "캐릭터", color: "#f59e0b",
    desc: "캐릭터 기본 정보 조회. 장비·헥사·코디·레벨 변동·캐릭터 역사까지.",
    example: "/정보 아크메이지",
    features: ["🛡️ 장비 슬롯별 목록 및 잠재 옵션", "📈 최근 7일 경험치 · 30일 레벨 히스토리", "💎 헥사 코어 및 헥사 스탯", "🎨 캐릭터 코디 및 타임라인 조회"],
  },
  {
    name: "/링크", badge: "링크스킬", color: "#22c55e",
    desc: "링크 스킬을 직업명 또는 효과 키워드로 검색. Lv.1/2/3 버튼 전환 지원.",
    example: "/링크 경험치",
    features: ["🔍 직업명 완전 일치 → 전 레벨 효과 한눈에", "🔑 키워드 검색 → 조건에 맞는 링크 스킬 목록", "🔢 Lv.1(70) / Lv.2(120) / Lv.3(285) 버튼 전환"],
  },
  {
    name: "/유니온", badge: "유니온", color: "#a855f7",
    desc: "유니온 공격대원 효과 검색. 직업군 계층형 버튼 탐색 또는 키워드 직접 검색.",
    example: "/유니온 모험가",
    features: ["🏆 직업군 입력 → 세부 직업 버튼 탐색", "⚔️ 직업 계열 입력 → 해당 직업군 선택 탐색", "🔍 직업명 완전 일치 → 전 등급(B~SSS) 효과"],
  },
]

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── 히어로 ── */}
      <section className="min-h-[92vh] flex items-center border-b border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            {/* 왼쪽: 텍스트 */}
            <div className="flex flex-col items-center text-center">

              <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-7 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                지금 온라인 · 5만 명 커뮤니티
              </div>

              <div className="flex flex-row gap-1.5 justify-center flex-wrap mb-8">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300 text-amber-500 whitespace-nowrap">🍁 메이플스토리</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-300 text-green-500 whitespace-nowrap">🌿 메이플랜드</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-300 text-purple-500 whitespace-nowrap">🪐 메이플플래닛</span>
              </div>

              <HeroTitle />

              <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10">
                메이플스토리 · 메이플랜드 · 메이플플래닛을 한 곳에서.<br />
                거래, 파티, 보스, 정보 조회, 커뮤니티까지 한번에.
              </p>

              {/* 통계 카드 */}
              <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-md items-stretch">
                <div className="flex flex-col items-center px-3 py-4 rounded-2xl border border-gray-200">
                  <div className="flex-1 flex items-center justify-center w-full">
                    <img src="/캐릭터.png?v=2" alt="" aria-hidden
                      className="w-full h-auto object-contain" style={{ maxWidth: "88px", maxHeight: "72px" }} />
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-2">50,000+</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">총 멤버</p>
                </div>
                <div className="flex flex-col items-center px-2 py-4 rounded-2xl border border-gray-200">
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-xs font-bold leading-tight text-amber-500">메이플스토리</span>
                    <span className="text-xs font-bold leading-tight text-green-500">메이플랜드</span>
                    <span className="text-xs font-bold leading-tight text-purple-500">메이플플래닛</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-2">3개</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">게임 커버</p>
                </div>
                <div className="flex flex-col items-center px-3 py-4 rounded-2xl border border-gray-200">
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 border-cyan-400">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                        stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-2">24/7</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">실시간 운영</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-xl text-base text-white transition-all hover:-translate-y-1"
                  style={{ background: "#5865F2" }}>
                  <DiscordIcon />디스코드 참여하기
                </a>
                <Link href="/notice"
                  className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-base text-gray-700 border border-gray-300 transition-all hover:bg-gray-50">
                  공지사항 보기
                </Link>
              </div>
            </div>

            {/* 오른쪽: 캐릭터 이미지 */}
            <div className="hidden lg:flex items-center justify-center" style={{ height: "85vh", maxHeight: "800px" }}>
              <img
                src="/배경.png?v=2"
                alt=""
                aria-hidden
                className="h-full w-auto object-contain"
              />
            </div>

          </div>
        </div>
      </section>

      {/* ── 게임별 채널 소개 ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-b border-gray-100">
        <p className="text-center text-xs font-bold tracking-widest text-purple-500 uppercase mb-3">GAMES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-3">어떤 게임을 하세요?</h2>
        <p className="text-center text-sm text-gray-400 mb-10">게임별 전용 채널을 운영하고 있어요</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GAMES.map((g) => (
            <div key={g.name} className="rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: g.border }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="font-black text-gray-900 text-base">{g.name}</p>
                  <p className="text-xs font-medium" style={{ color: g.color }}>{g.tag}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {g.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: g.color }} />{f}
                  </li>
                ))}
              </ul>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                className="mt-auto text-center text-xs font-bold py-2 rounded-xl border transition-colors hover:opacity-70"
                style={{ color: g.color, borderColor: g.border }}>
                채널 입장하기 →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── 서버 특징 ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-b border-gray-100">
        <p className="text-center text-xs font-bold tracking-widest text-purple-500 uppercase mb-3">FEATURES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-10">메이플디스코드에서 할 수 있는 것</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="border border-gray-200 rounded-2xl p-5 hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 봇 명령어 ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-b border-gray-100">
        <p className="text-center text-xs font-bold tracking-widest text-purple-500 uppercase mb-3">BOT COMMANDS</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-2">메이플봇 명령어</h2>
        <p className="text-center text-sm text-gray-400 mb-10">공식 Nexon OpenAPI 기반 · 최대 15분 지연</p>
        <div className="space-y-4">
          {COMMANDS.map((cmd) => (
            <div key={cmd.name} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 border"
                  style={{ color: cmd.color, borderColor: cmd.color + "55" }}>/</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <code className="font-black text-base px-2 py-0.5 rounded-lg border"
                      style={{ color: cmd.color, borderColor: cmd.color + "44" }}>{cmd.name}</code>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full border"
                      style={{ color: cmd.color, borderColor: cmd.color + "44" }}>{cmd.badge}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{cmd.desc}</p>
                </div>
              </div>
              <div className="px-6 py-4 space-y-2">
                {cmd.features.map((f, i) => <p key={i} className="text-sm text-gray-500">{f}</p>)}
              </div>
              <div className="px-6 pb-5">
                <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-gray-100">
                  <span className="text-xs font-bold text-gray-400">예시</span>
                  <code className="text-sm font-mono" style={{ color: cmd.color }}>{cmd.example}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEO 텍스트 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-gray-500">메이플디스코드</strong>는 메이플스토리, 메이플랜드, 메이플플래닛을 즐기는 유저들이 모인 국내 최대 메이플 종합 디스코드 커뮤니티입니다.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            5만 명 이상의 메이플러가 활동하며, 게임별 전용 채널에서 거래·정보 공유·커뮤니티를 즐길 수 있습니다.
            메이플봇을 통해 캐릭터 정보, 링크스킬, 유니온을 디스코드 안에서 바로 조회하세요.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            안전한 거래 환경을 위한 인증 시스템과 사기 제보 채널을 운영하고 있으며,
            메이플스토리 패치노트와 메이플랜드·메이플플래닛 공지를 가장 빠르게 전달합니다.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            메이플플래닛 전용 채널에서는 파티 모집, 길드 모집, 아이템·메소 거래, 공략 정보 공유를 자유롭게 진행할 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {GAMES.map(g => (
              <span key={g.name} className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{ color: g.color, borderColor: g.border }}>
                {g.icon} {g.name}
              </span>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3 text-gray-900">지금 바로 참여하세요</h2>
          <p className="text-gray-400 text-sm mb-10">5만 명의 메이플러가 기다리고 있어요 · 완전 무료</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-bold px-10 py-4 rounded-xl text-base text-white transition-all hover:-translate-y-1"
            style={{ background: "#5865F2" }}>
            <DiscordIcon />디스코드 참여하기
          </a>
        </div>
      </section>

    </div>
  )
}
