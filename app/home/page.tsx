import type { Metadata } from "next"
import Link from "next/link"

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
    "메이플 디스코드 커뮤니티 추천",
  ],
}

const DISCORD_URL = "https://discord.gg/2UwBw8dnSv"

const GAMES = [
  {
    name: "메이플스토리",
    tag: "KMS · GMS",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    icon: "🍁",
    features: ["캐릭터 정보 · 장비 · 헥사", "링크스킬 · 유니온 조회", "패치노트 · 공지 채널", "연무장 DPS 측정"],
  },
  {
    name: "메이플랜드",
    tag: "클래식 서버",
    color: "#3182F6",
    bg: "rgba(49,130,246,0.1)",
    border: "rgba(49,130,246,0.25)",
    icon: "🌿",
    features: ["메소 · 아이템 거래방", "안전거래 인증 시스템", "사기꾼 제보 채널", "거래 주의사항 안내"],
  },
  {
    name: "메이플플래닛",
    tag: "신규 서버",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
    icon: "🪐",
    features: ["전용 채널 운영 중", "커뮤니티 · 자유게시판", "공지 · 업데이트 알림", "유저 간 정보 공유"],
  },
]

const STATS = [
  { value: "50,000+", label: "총 멤버" },
  { value: "3개", label: "게임 커버" },
  { value: "24/7", label: "실시간 운영" },
  { value: "무료", label: "참여 비용" },
]

const FEATURES = [
  {
    icon: "🤖",
    title: "메이플봇",
    desc: "캐릭터 정보, 링크스킬, 유니온, 연무장 DPS를 슬래시 커맨드 하나로 조회. 공식 Nexon API 연동.",
  },
  {
    icon: "🔒",
    title: "인증 거래 시스템",
    desc: "유저 인증 후 거래 채널 입장. 사기 발생 시 즉시 제보 및 차단 처리.",
  },
  {
    icon: "📢",
    title: "게임별 공지 채널",
    desc: "메이플스토리·메이플랜드·메이플플래닛 패치노트와 변경사항을 가장 빠르게.",
  },
  {
    icon: "💬",
    title: "활발한 커뮤니티",
    desc: "5만 명이 모인 국내 최대 메이플 종합 디스코드. 정보 공유부터 친목까지.",
  },
]

const COMMANDS = [
  {
    name: "/파티",
    badge: "파티모집",
    color: "#f43f5e",
    bg: "rgba(244,63,94,0.15)",
    desc: "파티 모집 공고를 생성합니다. 모집자·신청자·상태가 임베드로 표시되며 참가 신청과 마감을 버튼으로 처리해요.",
    example: "/파티 개미굴",
    features: ["🍁 파티 모집 임베드 자동 생성", "✋ 참가하기 버튼으로 신청자 자동 등록", "🔒 파티 마감 버튼으로 모집 종료", "👥 모집자 · 신청자 · 상태 실시간 표시"],
  },
  {
    name: "/정보",
    badge: "캐릭터",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.15)",
    desc: "캐릭터 기본 정보 조회. 장비·헥사·코디·레벨 변동·캐릭터 역사·연무장 DPS까지.",
    example: "/정보 아크메이지",
    features: ["🛡️ 장비 슬롯별 목록 및 잠재 옵션", "📈 최근 7일 경험치 · 30일 레벨 히스토리", "💎 헥사 코어 및 헥사 스탯", "🥊 연무장 DPS 측정 결과 · 스킬별 분석 TOP 5"],
  },
  {
    name: "/링크",
    badge: "링크스킬",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    desc: "링크 스킬을 직업명 또는 효과 키워드로 검색. Lv.1/2/3 버튼 전환 지원.",
    example: "/링크 경험치",
    features: ["🔍 직업명 완전 일치 → 전 레벨 효과 한눈에", "🔑 키워드 검색 → 조건에 맞는 링크 스킬 목록", "🔢 Lv.1(70) / Lv.2(120) / Lv.3(285) 버튼 전환"],
  },
  {
    name: "/유니온",
    badge: "유니온",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.15)",
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
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#162032] to-[#0f172a] pointer-events-none" />
        <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#5865F2] opacity-[0.07] blur-[140px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-20 text-center">

          {/* 상태 배지 */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm font-medium text-[#93c5fd] mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            지금 온라인 · 5만 명 커뮤니티
          </div>

          {/* 3개 게임 뱃지 */}
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {GAMES.map(g => (
              <span key={g.name}
                className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{ color: g.color, background: g.bg, borderColor: g.border }}>
                {g.icon} {g.name}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-5">
            3개 게임, 하나의<br />
            <span className="text-[#5865F2]">메이플 디스코드</span>
          </h1>

          <p className="text-[#94a3b8] text-base md:text-lg max-w-lg mx-auto leading-relaxed mb-10">
            메이플스토리·메이플랜드·메이플플래닛을 한 곳에서.<br />
            거래, 정보 조회, 커뮤니티까지 모두 무료.
          </p>

          {/* 통계 */}
          <div className="flex justify-center gap-6 md:gap-10 mb-10 flex-wrap">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-[#64748b] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-[#5865F2]/30">
              <DiscordIcon />
              무료로 참여하기
            </a>
            <Link href="/notice"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-6 py-3.5 rounded-xl text-base transition-colors">
              공지사항 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 게임별 채널 소개 */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-center text-xs font-bold tracking-widest text-[#5865F2] uppercase mb-3">GAMES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-3">어떤 게임을 하세요?</h2>
        <p className="text-center text-sm text-[#64748b] mb-10">게임별 전용 채널을 운영하고 있어요</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GAMES.map((g) => (
            <div key={g.name}
              className="rounded-2xl border p-5 flex flex-col gap-4"
              style={{ background: g.bg, borderColor: g.border }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="font-black text-white text-base">{g.name}</p>
                  <p className="text-xs font-medium" style={{ color: g.color }}>{g.tag}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {g.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: g.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                className="mt-auto text-center text-xs font-bold py-2 rounded-xl border transition-colors hover:opacity-80"
                style={{ color: g.color, borderColor: g.border }}>
                채널 입장하기 →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 서버 특징 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <p className="text-center text-xs font-bold tracking-widest text-[#5865F2] uppercase mb-3">FEATURES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-10">메이플디스코드에서 할 수 있는 것</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 봇 명령어 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <p className="text-center text-xs font-bold tracking-widest text-[#5865F2] uppercase mb-3">BOT COMMANDS</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-2">메이플봇 명령어</h2>
        <p className="text-center text-sm text-[#64748b] mb-10">공식 Nexon OpenAPI 기반 · 최대 15분 지연</p>
        <div className="space-y-4">
          {COMMANDS.map((cmd) => (
            <div key={cmd.name} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                  style={{ background: cmd.bg, color: cmd.color }}>/</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <code className="font-black text-base px-2 py-0.5 rounded-lg" style={{ color: cmd.color, background: cmd.bg }}>{cmd.name}</code>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: cmd.color, background: cmd.bg }}>{cmd.badge}</span>
                  </div>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">{cmd.desc}</p>
                </div>
              </div>
              <div className="px-6 py-4 space-y-2">
                {cmd.features.map((f, i) => (
                  <p key={i} className="text-sm text-[#94a3b8]">{f}</p>
                ))}
              </div>
              <div className="px-6 pb-5">
                <div className="bg-black/30 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#475569]">예시</span>
                  <code className="text-sm font-mono" style={{ color: cmd.color }}>{cmd.example}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO 텍스트 */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="border-t border-white/10 pt-10 text-center space-y-3">
          <p className="text-sm text-[#475569] leading-relaxed">
            <strong className="text-[#64748b]">메이플디스코드</strong>는 메이플스토리, 메이플랜드, 메이플플래닛을 즐기는 유저들이 모인 국내 최대 메이플 종합 디스코드 커뮤니티입니다.
          </p>
          <p className="text-sm text-[#475569] leading-relaxed">
            5만 명 이상의 메이플러가 활동하며, 게임별 전용 채널에서 거래·정보 공유·커뮤니티를 즐길 수 있습니다.
            메이플봇을 통해 캐릭터 정보, 링크스킬, 유니온, 연무장 DPS를 디스코드 안에서 바로 조회하세요.
          </p>
          <p className="text-sm text-[#475569] leading-relaxed">
            안전한 거래 환경을 위한 인증 시스템과 사기 제보 채널을 운영하고 있으며,
            메이플스토리 패치노트와 메이플랜드·메이플플래닛 공지를 가장 빠르게 전달합니다.
          </p>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {GAMES.map(g => (
              <span key={g.name} className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{ color: g.color, background: g.bg, borderColor: g.border }}>
                {g.icon} {g.name}
              </span>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">지금 바로 참여하세요</h2>
          <p className="text-[#94a3b8] text-sm mb-8">5만 명의 메이플러가 기다리고 있어요 · 완전 무료</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-xl shadow-[#5865F2]/30">
            <DiscordIcon />
            디스코드 참여하기
          </a>
        </div>
      </section>

    </div>
  )
}
