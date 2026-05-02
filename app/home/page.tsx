import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "메이플스토리 디스코드 | 5만명 메이플 커뮤니티",
  description:
    "메이플스토리 최대 디스코드 커뮤니티. 실시간 거래방, 인증 시스템, 메이플봇으로 캐릭터 정보·링크스킬·유니온을 조회하세요. 지금 바로 참여하세요.",
  alternates: { canonical: "/home" },
}

const FEATURES = [
  {
    icon: "💬",
    title: "실시간 거래방",
    desc: "메소·아이템 거래를 실시간 채팅으로. 인증된 유저와 안전하게 거래하세요.",
  },
  {
    icon: "✅",
    title: "인증 시스템",
    desc: "신뢰할 수 있는 거래 환경을 위한 유저 인증. 사기꾼 제보 시스템 운영 중.",
  },
  {
    icon: "🤖",
    title: "메이플봇",
    desc: "캐릭터 정보, 링크스킬, 유니온, 연무장 DPS까지 슬래시 커맨드 한 번으로.",
  },
  {
    icon: "📢",
    title: "공지 & 커뮤니티",
    desc: "메이플스토리 패치노트, 변경사항 공지와 자유게시판 운영.",
  },
]

const COMMANDS = [
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

export default function BotPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* 히어로 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#0f172a] to-[#0f172a] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#3182F6] opacity-10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium text-[#93c5fd] mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            지금 온라인
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            메이플스토리<br />
            <span className="text-[#3182F6]">디스코드</span>
          </h1>

          <p className="text-[#94a3b8] text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            메이플스토리 최대 디스코드 커뮤니티.<br />
            실시간 거래부터 캐릭터 정보 조회까지 한 곳에서.
          </p>

          {/* 멤버 수 */}
          <div className="flex justify-center gap-8 mb-10">
            <div className="text-center">
              <p className="text-3xl font-black text-white">5만+</p>
              <p className="text-xs text-[#64748b] mt-1">멤버</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-black text-white">24/7</p>
              <p className="text-xs text-[#64748b] mt-1">실시간 운영</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-black text-white">3+</p>
              <p className="text-xs text-[#64748b] mt-1">봇 명령어</p>
            </div>
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://discord.gg/2UwBw8dnSv"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-8 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-[#5865F2]/30"
            >
              <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
              </svg>
              디스코드 참여하기
            </a>
            <Link
              href="/"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl text-base transition-colors"
            >
              거래방 바로가기
            </Link>
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <p className="text-center text-xs font-bold tracking-widest text-[#3182F6] uppercase mb-3">FEATURES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-10">왜 메이플스토리 디스코드인가요?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 봇 명령어 */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <p className="text-center text-xs font-bold tracking-widest text-[#3182F6] uppercase mb-3">BOT COMMANDS</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-2">메이플봇 명령어</h2>
        <p className="text-center text-sm text-[#64748b] mb-10">공식 Nexon OpenAPI 기반 · 최대 15분 지연</p>

        <div className="space-y-4">
          {COMMANDS.map((cmd) => (
            <div key={cmd.name} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 font-black"
                  style={{ background: cmd.bg, color: cmd.color }}>
                  /
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <code className="font-black text-base px-2 py-0.5 rounded-lg" style={{ color: cmd.color, background: cmd.bg }}>
                      {cmd.name}
                    </code>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: cmd.color, background: cmd.bg }}>
                      {cmd.badge}
                    </span>
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

      {/* 하단 CTA */}
      <section className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3">지금 바로 참여하세요</h2>
          <p className="text-[#94a3b8] text-sm mb-8">5만 명의 메이플러가 기다리고 있어요</p>
          <a
            href="https://discord.gg/2UwBw8dnSv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold px-10 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#5865F2]/30"
          >
            <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
              <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
            </svg>
            디스코드 참여하기
          </a>
        </div>
      </section>

    </div>
  )
}
