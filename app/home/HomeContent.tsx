"use client"
import Link from "next/link"
import { useLang } from "../contexts/LanguageContext"
import HeroTitle from "./HeroTitle"

const DISCORD_URL = "https://discord.gg/2UwBw8dnSv"

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
  </svg>
)

const t = {
  ko: {
    badge: "지금 온라인 · 5만 명 커뮤니티",
    heroDesc: "메이플스토리 · 메이플랜드 · 메이플플래닛을 한 곳에서.\n거래, 파티, 보스, 정보 조회, 커뮤니티까지 한번에.",
    statMembers: "총 멤버", statGames: "게임 커버", statUptime: "실시간 운영",
    ctaJoin: "디스코드 참여하기", ctaNotice: "공지사항 보기",
    gamesLabel: "GAMES", gamesTitle: "어떤 게임을 하세요?", gamesDesc: "게임별 전용 채널을 운영하고 있어요",
    channelBtn: "채널 입장하기 →",
    featLabel: "FEATURES", featTitle: "메이플디스코드에서 할 수 있는 것",
    botLabel: "BOT COMMANDS", botTitle: "메이플봇 명령어", botSubtitle: "공식 Nexon OpenAPI 기반 · 최대 15분 지연",
    exampleLabel: "예시",
    ctaFinalTitle: "지금 바로 참여하세요", ctaFinalDesc: "5만 명의 메이플러가 기다리고 있어요 · 완전 무료",
    games: [
      { name: "메이플스토리", tag: "KMS · GMS", features: ["메소 · 아이템 거래방","캐릭터 정보 조회기능","패치노트 · 이벤트 공지","링크스킬 · 유니온 조회"] },
      { name: "메이플랜드", tag: "클래식 서버", features: ["메소 · 아이템 거래방","안전거래 인증 시스템","사기꾼 제보 채널","거래 주의사항 안내"] },
      { name: "메이플플래닛", tag: "신규 서버", features: ["전용 채널 운영 중","커뮤니티 · 자유게시판","공지 · 업데이트 알림","유저 간 정보 공유"] },
    ],
    features: [
      { icon: "🤖", title: "메이플봇", desc: "캐릭터 정보, 링크스킬, 유니온을 슬래시 커맨드 하나로 조회." },
      { icon: "🔒", title: "인증 거래 시스템", desc: "유저 인증 후 거래 채널 입장. 사기 발생 시 즉시 제보 및 차단 처리." },
      { icon: "📢", title: "게임별 공지 채널", desc: "메이플스토리·메이플랜드·메이플플래닛 패치노트와 변경사항을 가장 빠르게." },
      { icon: "💬", title: "활발한 커뮤니티", desc: "5만 명이 모인 국내 최대 메이플 종합 디스코드. 정보 공유부터 친목까지." },
    ],
    commands: [
      { name: "/파티", badge: "파티모집", color: "#f43f5e", desc: "파티 모집 공고를 생성합니다. 모집자·신청자·상태가 임베드로 표시되며 참가 신청과 마감을 버튼으로 처리해요.", example: "/파티 개미굴", features: ["🍁 파티 모집 임베드 자동 생성","✋ 참가하기 버튼으로 신청자 자동 등록","🔒 파티 마감 버튼으로 모집 종료","👥 모집자 · 신청자 · 상태 실시간 표시"] },
      { name: "/정보", badge: "캐릭터", color: "#f59e0b", desc: "캐릭터 기본 정보 조회. 장비·헥사·코디·레벨 변동·캐릭터 역사까지.", example: "/정보 아크메이지", features: ["🛡️ 장비 슬롯별 목록 및 잠재 옵션","📈 최근 7일 경험치 · 30일 레벨 히스토리","💎 헥사 코어 및 헥사 스탯","🎨 캐릭터 코디 및 타임라인 조회"] },
      { name: "/링크", badge: "링크스킬", color: "#22c55e", desc: "링크 스킬을 직업명 또는 효과 키워드로 검색. Lv.1/2/3 버튼 전환 지원.", example: "/링크 경험치", features: ["🔍 직업명 완전 일치 → 전 레벨 효과 한눈에","🔑 키워드 검색 → 조건에 맞는 링크 스킬 목록","🔢 Lv.1(70) / Lv.2(120) / Lv.3(285) 버튼 전환"] },
      { name: "/유니온", badge: "유니온", color: "#a855f7", desc: "유니온 공격대원 효과 검색. 직업군 계층형 버튼 탐색 또는 키워드 직접 검색.", example: "/유니온 모험가", features: ["🏆 직업군 입력 → 세부 직업 버튼 탐색","⚔️ 직업 계열 입력 → 해당 직업군 선택 탐색","🔍 직업명 완전 일치 → 전 등급(B~SSS) 효과"] },
    ],
  },
  en: {
    badge: "Online Now · 50K Community",
    heroDesc: "MapleStory · MapleLegenD · MaplePlanet, all in one place.\nTrade, party, boss, info & community — all at once.",
    statMembers: "Members", statGames: "Games Covered", statUptime: "Live 24/7",
    ctaJoin: "Join Discord", ctaNotice: "View Notices",
    gamesLabel: "GAMES", gamesTitle: "Which game do you play?", gamesDesc: "Dedicated channels for each game",
    channelBtn: "Enter Channel →",
    featLabel: "FEATURES", featTitle: "What you can do in MapleDiscord",
    botLabel: "BOT COMMANDS", botTitle: "Maple Bot Commands", botSubtitle: "Based on Nexon OpenAPI · up to 15-min delay",
    exampleLabel: "Example",
    ctaFinalTitle: "Join Us Now", ctaFinalDesc: "50K Maplers are waiting · Completely free",
    games: [
      { name: "MapleStory", tag: "KMS · GMS", features: ["Meso & Item Trading","Character Info Lookup","Patch Notes & Events","Link Skill & Union Lookup"] },
      { name: "MapleLegenD", tag: "Classic Server", features: ["Meso & Item Trading","Safe Trade Verification","Scammer Report Channel","Trade Safety Guide"] },
      { name: "MaplePlanet", tag: "New Server", features: ["Dedicated Channels Active","Community & Free Board","Notices & Update Alerts","User Info Sharing"] },
    ],
    features: [
      { icon: "🤖", title: "Maple Bot", desc: "Look up character info, link skills, and union data with a single slash command." },
      { icon: "🔒", title: "Verified Trading System", desc: "Enter trade channels after verification. Instant report and ban for scammers." },
      { icon: "📢", title: "Game Notification Channels", desc: "Get the latest patch notes and updates for MapleStory, MapleLegenD, and MaplePlanet." },
      { icon: "💬", title: "Active Community", desc: "Korea's largest all-in-one Maple Discord with 50K members. Share info and make friends." },
    ],
    commands: [
      { name: "/party", badge: "Party", color: "#f43f5e", desc: "Create a party recruitment post. Members, applicants, and status are displayed with buttons to join or close.", example: "/party ant-tunnel", features: ["🍁 Auto-generate party embed","✋ Join button for auto-registration","🔒 Close button to end recruitment","👥 Real-time member & status display"] },
      { name: "/info", badge: "Character", color: "#f59e0b", desc: "Look up character basics: equipment, Hexa, coordinate, level history, and more.", example: "/info archmage", features: ["🛡️ Equipment slots & potential options","📈 7-day EXP & 30-day level history","💎 Hexa Core & Hexa Stats","🎨 Character coordinate & timeline"] },
      { name: "/link", badge: "Link Skill", color: "#22c55e", desc: "Search link skills by class name or effect keyword. Lv.1/2/3 button switching supported.", example: "/link experience", features: ["🔍 Exact class name → full level effects","🔑 Keyword search → matching link skill list","🔢 Lv.1(70) / Lv.2(120) / Lv.3(285) toggle"] },
      { name: "/union", badge: "Union", color: "#a855f7", desc: "Search union raider effects by class group hierarchy or direct keyword.", example: "/union adventurer", features: ["🏆 Class group → sub-class button browse","⚔️ Class series → class group selection","🔍 Exact class name → all ranks (B~SSS)"] },
    ],
  },
}

const GAME_META = [
  { color: "#f59e0b", border: "rgba(245,158,11,0.35)", icon: "🍁" },
  { color: "#3182F6", border: "rgba(49,130,246,0.35)", icon: "🌿" },
  { color: "#a855f7", border: "rgba(168,85,247,0.35)", icon: "🪐" },
]

export default function HomeContent() {
  const { lang } = useLang()
  const c = t[lang]

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── 히어로 ── */}
      <section className="min-h-[92vh] flex items-center border-b border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-7 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                {c.badge}
              </div>

              <div className="flex flex-row gap-1.5 justify-center flex-wrap mb-8">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300 text-amber-500 whitespace-nowrap">🍁 메이플스토리</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-green-300 text-green-500 whitespace-nowrap">🌿 메이플랜드</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-300 text-purple-500 whitespace-nowrap">🪐 메이플플래닛</span>
              </div>

              <HeroTitle />

              <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10 whitespace-pre-line">
                {c.heroDesc}
              </p>

              {/* 통계 카드 */}
              <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-md items-stretch">
                <div className="flex flex-col items-center px-3 py-4 rounded-2xl border border-gray-200">
                  <div className="flex-1 flex items-center justify-center w-full">
                    <img src="/캐릭터.png?v=2" alt="" aria-hidden
                      className="w-full h-auto object-contain" style={{ maxWidth: "88px", maxHeight: "72px" }} />
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-2">50,000+</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{c.statMembers}</p>
                </div>
                <div className="flex flex-col items-center px-2 py-4 rounded-2xl border border-gray-200">
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-xs font-bold leading-tight text-amber-500">메이플스토리</span>
                    <span className="text-xs font-bold leading-tight text-green-500">메이플랜드</span>
                    <span className="text-xs font-bold leading-tight text-purple-500">메이플플래닛</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-2">3{lang === "ko" ? "개" : ""}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{c.statGames}</p>
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
                  <p className="text-xs text-gray-400 font-medium mt-1">{c.statUptime}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-xl text-base text-white transition-all hover:-translate-y-1"
                  style={{ background: "#5865F2" }}>
                  <DiscordIcon />{c.ctaJoin}
                </a>
                <Link href="/notice"
                  className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-base text-gray-700 border border-gray-300 transition-all hover:bg-gray-50">
                  {c.ctaNotice}
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center" style={{ height: "85vh", maxHeight: "800px" }}>
              <img src="/배경.png?v=3" alt="" aria-hidden className="h-full w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 게임별 채널 ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-b border-gray-100">
        <p className="text-center text-xs font-bold tracking-widest text-purple-500 uppercase mb-3">{c.gamesLabel}</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-3">{c.gamesTitle}</h2>
        <p className="text-center text-sm text-gray-400 mb-10">{c.gamesDesc}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {c.games.map((g, i) => {
            const meta = GAME_META[i]
            return (
              <div key={g.name} className="rounded-2xl border p-5 flex flex-col gap-4" style={{ borderColor: meta.border }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <p className="font-black text-gray-900 text-base">{g.name}</p>
                    <p className="text-xs font-medium" style={{ color: meta.color }}>{g.tag}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {g.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: meta.color }} />{f}
                    </li>
                  ))}
                </ul>
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                  className="mt-auto text-center text-xs font-bold py-2 rounded-xl border transition-colors hover:opacity-70"
                  style={{ color: meta.color, borderColor: meta.border }}>
                  {c.channelBtn}
                </a>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 서버 특징 ── */}
      <section className="max-w-4xl mx-auto px-4 py-20 border-b border-gray-100">
        <p className="text-center text-xs font-bold tracking-widest text-purple-500 uppercase mb-3">{c.featLabel}</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-10">{c.featTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {c.features.map((f) => (
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
        <p className="text-center text-xs font-bold tracking-widest text-purple-500 uppercase mb-3">{c.botLabel}</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-2">{c.botTitle}</h2>
        <p className="text-center text-sm text-gray-400 mb-10">{c.botSubtitle}</p>
        <div className="space-y-4">
          {c.commands.map((cmd) => (
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
                  <span className="text-xs font-bold text-gray-400">{c.exampleLabel}</span>
                  <code className="text-sm font-mono" style={{ color: cmd.color }}>{cmd.example}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEO 텍스트 (한국어 고정) ── */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-b border-gray-100">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong className="text-gray-500">메이플디스코드</strong>는 메이플스토리, 메이플랜드, 메이플플래닛을 즐기는 유저들이 함께 모인 국내 최대 메이플 종합 디스코드 커뮤니티입니다.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            현재 5만 명 이상의 메이플러가 활동하고 있으며, 게임별 전용 채널을 통해 거래, 정보 공유, 파티 모집, 길드 모집, 커뮤니티 활동을 편하게 즐길 수 있습니다.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            또한 메이플봇을 통해 디스코드 안에서 캐릭터 정보, 링크스킬, 유니온 정보까지 바로 조회할 수 있어 더욱 편리합니다.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            안전한 거래 환경을 위해 인증 시스템과 사기 제보 채널을 운영하고 있으며, 메이플스토리 패치노트와 메이플랜드·메이플플래닛 공지도 빠르게 확인할 수 있습니다.
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            메이플디스코드는 메이플 유저들 사이에서 'msd디스코드'로도 불리는 국내 최대 메이플 디스코드 서버입니다.
          </p>
        </div>
      </section>

      {/* ── 하단 CTA ── */}
      <section className="py-24 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {GAME_META.map((meta, i) => (
              <span key={i} className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{ color: meta.color, borderColor: meta.border }}>
                {meta.icon} {c.games[i].name}
              </span>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3 text-gray-900">{c.ctaFinalTitle}</h2>
          <p className="text-gray-400 text-sm mb-10">{c.ctaFinalDesc}</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-bold px-10 py-4 rounded-xl text-base text-white transition-all hover:-translate-y-1"
            style={{ background: "#5865F2" }}>
            <DiscordIcon />{c.ctaJoin}
          </a>
        </div>
      </section>

    </div>
  )
}
