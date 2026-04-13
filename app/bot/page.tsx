import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "디스코드 봇 명령어 | 메이플랜드 거래방",
  description:
    "메이플봇 슬래시 커맨드 전체 목록. /정보, /링크, /유니온, /연무장 명령어로 메이플스토리 캐릭터·링크스킬·유니온·연무장 정보를 조회하세요.",
  alternates: { canonical: "/bot" },
}

interface Command {
  name: string
  usage: string
  desc: string
  badge: string
  badgeColor: string
  features: { icon: string; text: string }[]
  example?: string
}

const COMMANDS: Command[] = [
  {
    name: "/정보",
    usage: "/정보 캐릭터명",
    desc: "메이플스토리 캐릭터의 기본 정보를 조회합니다. 결과 하단 버튼으로 장비, 헥사, 코디, 레벨 변동, 캐릭터 역사, 연무장 기록까지 확인할 수 있어요.",
    badge: "캐릭터",
    badgeColor: "#f59e0b",
    features: [
      { icon: "🛡️", text: "장비 — 슬롯별 장비 목록 및 잠재 옵션" },
      { icon: "📈", text: "레벨 변동 — 최근 7일 경험치 · 30일 레벨 히스토리" },
      { icon: "💎", text: "헥사 — 헥사 코어 및 헥사 스탯 현황" },
      { icon: "👗", text: "코디 — 착용 중인 캐시 아이템" },
      { icon: "🕰️", text: "캐릭터 역사 — 최근 6개월 닉네임·길드 변경 기록" },
      { icon: "🥊", text: "연무장 — 연무장 최고 층수 및 클리어 시간" },
    ],
    example: "/정보 아크메이지",
  },
  {
    name: "/링크",
    usage: "/링크 검색어",
    desc: "링크 스킬을 직업명 또는 효과 키워드로 검색합니다. 결과 하단 버튼으로 요구 레벨별(Lv.1 / Lv.2 / Lv.3) 효과를 전환할 수 있어요.",
    badge: "링크 스킬",
    badgeColor: "#22c55e",
    features: [
      { icon: "🔍", text: "직업명 완전 일치 → 전 레벨 효과 한눈에 표시" },
      { icon: "🔑", text: "키워드 검색 → 조건에 맞는 모든 링크 스킬 목록" },
      { icon: "🔢", text: "Lv.1 (Lv.70) / Lv.2 (Lv.120) / Lv.3 (Lv.285) 버튼 전환" },
    ],
    example: "/링크 경험치",
  },
  {
    name: "/유니온",
    usage: "/유니온 검색어",
    desc: "유니온 공격대원 효과를 검색합니다. 직업군·세부 직업 계층형 버튼 탐색 또는 키워드로 직접 검색할 수 있어요.",
    badge: "유니온",
    badgeColor: "#a855f7",
    features: [
      { icon: "🏆", text: "직업군 입력 (예: 모험가, 시그너스) → 세부 직업 버튼 탐색" },
      { icon: "⚔️", text: "직업 계열 입력 (예: 전사, 마법사) → 해당 직업군 선택 후 탐색" },
      { icon: "🔍", text: "직업명 완전 일치 → 전 등급(B~SSS) 효과 한눈에 표시" },
      { icon: "🔑", text: "키워드 검색 → B / A / S / SS / SSS 등급 버튼 전환" },
    ],
    example: "/유니온 모험가",
  },
  {
    name: "/연무장 랭킹",
    usage: "/연무장 랭킹 [난이도] [월드]",
    desc: "연무장(연무장) 랭킹을 조회합니다. 난이도와 월드는 선택 옵션이에요.",
    badge: "연무장",
    badgeColor: "#f97316",
    features: [
      { icon: "🥊", text: "일반 / 통달 난이도 버튼으로 즉시 전환" },
      { icon: "🌍", text: "월드 옵션으로 특정 서버 랭킹만 조회 가능" },
      { icon: "📊", text: "순위 · 캐릭터명 · 직업 · 레벨 · 층수 · 클리어 시간 표시" },
      { icon: "📅", text: "전일(KST 기준) 랭킹 데이터 제공" },
    ],
    example: "/연무장 랭킹 난이도:통달 월드:스카니아",
  },
]

const BADGE_BG: Record<string, string> = {
  "#f59e0b": "rgba(245,158,11,0.12)",
  "#22c55e": "rgba(34,197,94,0.12)",
  "#a855f7": "rgba(168,85,247,0.12)",
  "#f97316": "rgba(249,115,22,0.12)",
}

export default function BotPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-6 py-7 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h1 className="text-2xl font-bold text-[#191F28]">메이플봇 명령어 안내</h1>
          <p className="text-sm text-[#8B95A1] mt-2">
            디스코드 서버에서 슬래시 커맨드(/)로 바로 사용하세요
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["메이플스토리", "공식 Nexon API", "실시간 조회"].map(tag => (
              <span key={tag} className="bg-[#EBF3FE] text-[#3182F6] text-xs font-semibold px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 커맨드 카드 목록 */}
        {COMMANDS.map((cmd) => (
          <div key={cmd.name} className="bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden">

            {/* 커맨드 헤더 */}
            <div className="px-6 py-5 flex items-start gap-4 border-b border-[#E5E8EB]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: BADGE_BG[cmd.badgeColor] }}
              >
                {cmd.badge === "캐릭터" ? "🍁" : cmd.badge === "링크 스킬" ? "🔗" : cmd.badge === "유니온" ? "🏆" : "🥊"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <code
                    className="text-base font-bold px-2 py-0.5 rounded-lg"
                    style={{ color: cmd.badgeColor, background: BADGE_BG[cmd.badgeColor] }}
                  >
                    {cmd.name}
                  </code>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: cmd.badgeColor, background: BADGE_BG[cmd.badgeColor] }}
                  >
                    {cmd.badge}
                  </span>
                </div>
                <p className="text-sm text-[#4E5968] mt-2 leading-relaxed">{cmd.desc}</p>
              </div>
            </div>

            {/* 기능 목록 */}
            <div className="px-6 py-4 space-y-2">
              {cmd.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#4E5968]">
                  <span className="text-base shrink-0">{f.icon}</span>
                  <span className="leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>

            {/* 사용 예시 */}
            {cmd.example && (
              <div className="px-6 pb-5">
                <div className="bg-[#F2F4F6] rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#8B95A1] shrink-0">예시</span>
                  <code className="text-sm text-[#191F28] font-mono">{cmd.example}</code>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 안내 */}
        <div className="bg-[#F0F6FF] border border-[#C7DFFE] rounded-xl px-4 py-3">
          <p className="text-xs text-[#1A5FC8] leading-relaxed">
            💡 모든 명령어는 메이플스토리 공식 Nexon OpenAPI 기반으로 조회됩니다.
            데이터는 최대 하루 지연될 수 있으며, 랭킹은 전일 기준으로 제공됩니다.
          </p>
        </div>

      </div>
    </div>
  )
}
