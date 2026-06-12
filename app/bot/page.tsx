import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "봇 기능 소개 | 메이플디스코드",
  description: "메이플디스코드 민원실 봇의 인증, 닉네임 관리, 사기 신고, 자동화 기능을 소개합니다.",
  alternates: { canonical: "/bot" },
}

const DISCORD_URL = "https://discord.gg/2UwBw8dnSv"

const FEATURES = [
  {
    category: "인증 시스템",
    color: "#5865F2",
    border: "rgba(88,101,242,0.3)",
    icon: "✅",
    items: [
      {
        name: "게임별 닉네임 인증",
        desc: "메이플스토리·메이플랜드·메이플플래닛 중 서버를 선택해 캐릭터 닉네임과 레벨을 인증합니다. 인증 완료 시 게임 전용 역할이 자동 부여됩니다.",
        badge: "/인증패널",
      },
      {
        name: "사진 인증 & 관리자 승인",
        desc: "인증 신청 시 캐릭터 스크린샷을 DM으로 전송하면 관리자가 승인 또는 거절합니다. 메이플스토리는 관리자 검토 방식, 메이플랜드·메이플플래닛은 즉시 승인 방식으로 운영됩니다.",
        badge: "관리자 전용",
      },
      {
        name: "인증 리마인더 자동 발송",
        desc: "서버 입장 후 미인증 상태가 지속되면 DM으로 인증 안내 메시지를 자동 발송합니다. 미인증 멤버의 자연스러운 참여를 유도합니다.",
        badge: "자동",
      },
      {
        name: "신규 계정 감지",
        desc: "생성된 지 일정 기간이 지나지 않은 신규 Discord 계정이 입장하면 관리자 채널에 자동으로 알림을 전송합니다.",
        badge: "자동",
      },
    ],
  },
  {
    category: "닉네임 관리",
    color: "#f59e0b",
    border: "rgba(245,158,11,0.3)",
    icon: "✏️",
    items: [
      {
        name: "닉네임 변경 신청",
        desc: "인증된 멤버가 인게임 닉네임을 변경한 경우 변경 신청을 접수합니다. 관리자 승인 후 서버 닉네임이 반영되며 변경 이력이 기록됩니다.",
        badge: "/닉네임패널",
      },
      {
        name: "클래식 서버 닉네임 변경",
        desc: "메이플랜드·메이플플래닛 전용 닉네임 변경 패널입니다. 별도의 관리자 승인 없이 신청 즉시 닉네임이 변경됩니다.",
        badge: "/클래식닉네임패널",
      },
      {
        name: "닉네임 변경 이력 관리",
        desc: "모든 닉네임 변경 내역을 JSON 파일로 저장하여 과거 닉네임 조회 및 중복 신청 방지에 활용합니다.",
        badge: "자동",
      },
    ],
  },
  {
    category: "사기 신고 시스템",
    color: "#f43f5e",
    border: "rgba(244,63,94,0.3)",
    icon: "🚨",
    items: [
      {
        name: "사기 신고 접수",
        desc: "신고 버튼을 눌러 신고 사유를 선택하고 상세 내용을 입력하면 관리자 채널에 자동으로 신고서가 전송됩니다. 신고자 정보와 피신고자 정보가 함께 기록됩니다.",
        badge: "/신고패널",
      },
      {
        name: "메이플월드 전용 신고",
        desc: "메이플스토리 월드(KMS) 전용 사기 신고 패널입니다. 월드별로 신고 채널을 분리 운영하여 신고 처리 효율을 높입니다.",
        badge: "/메이플월드신고패널",
      },
      {
        name: "신고 패널 자동 유지",
        desc: "신고 채널에 다른 메시지가 올라오면 신고 패널을 자동으로 채널 맨 아래로 재등록합니다. 신고 버튼이 항상 접근 가능한 위치에 유지됩니다.",
        badge: "자동",
      },
    ],
  },
  {
    category: "역할 & 게임 채널",
    color: "#22c55e",
    border: "rgba(34,197,94,0.3)",
    icon: "🎮",
    items: [
      {
        name: "게임 역할 선택 패널",
        desc: "메이플스토리·메이플랜드·메이플플래닛 중 원하는 게임 역할을 버튼 클릭으로 선택하거나 해제할 수 있습니다. 게임별 공지 및 채널 접근이 역할 기반으로 제한됩니다.",
        badge: "/게임역할패널",
      },
    ],
  },
  {
    category: "자동화 & 알림",
    color: "#a855f7",
    border: "rgba(168,85,247,0.3)",
    icon: "🤖",
    items: [
      {
        name: "메이플스토리 이벤트 뉴스",
        desc: "넥슨 공식 메이플스토리 이벤트·패치 정보를 주기적으로 크롤링해 지정된 채널에 자동 게시합니다. 최신 이벤트를 서버 멤버들이 빠르게 확인할 수 있습니다.",
        badge: "자동",
      },
      {
        name: "일일 통계 요약",
        desc: "매일 자정(KST) 당일 서버 입장·퇴장·인증 승인·거절 수를 집계하여 관리자 채널에 요약 리포트를 전송합니다.",
        badge: "매일 자정",
      },
      {
        name: "봇 DM 자동 응답",
        desc: "멤버가 봇에게 DM을 보내면 인증 방법, 닉네임 변경 방법 등 안내 메시지를 자동으로 응답합니다.",
        badge: "자동",
      },
    ],
  },
]

const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
  </svg>
)

export default function BotPage() {
  const totalFeatures = FEATURES.reduce((acc, f) => acc + f.items.length, 0)

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* 히어로 */}
      <section className="border-b border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            현재 운영 중
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">민원실 봇 기능 소개</h1>
          <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            메이플디스코드 서버를 자동으로 관리하는 민원실 봇의<br />
            모든 기능을 한눈에 확인하세요.
          </p>
          <div className="flex justify-center gap-6 text-center mb-8">
            <div>
              <p className="text-3xl font-black text-gray-900">{FEATURES.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">카테고리</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-3xl font-black text-gray-900">{totalFeatures}</p>
              <p className="text-xs text-gray-400 mt-0.5">기능</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-3xl font-black text-gray-900">24/7</p>
              <p className="text-xs text-gray-400 mt-0.5">자동 운영</p>
            </div>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-bold px-7 py-3 rounded-xl text-sm text-white transition-all hover:-translate-y-1"
            style={{ background: "#5865F2" }}>
            <DiscordIcon />서버 입장해서 직접 사용해보기
          </a>
        </div>
      </section>

      {/* 기능 목록 */}
      <section className="max-w-4xl mx-auto px-6 py-16 space-y-14">
        {FEATURES.map((f) => (
          <div key={f.category}>
            {/* 카테고리 헤더 */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{f.icon}</span>
              <h2 className="text-xl font-black text-gray-900">{f.category}</h2>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border"
                style={{ color: f.color, borderColor: f.border }}>
                {f.items.length}개 기능
              </span>
            </div>

            {/* 기능 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {f.items.map((item) => (
                <div key={item.name}
                  className="rounded-2xl border p-5 flex flex-col gap-2"
                  style={{ borderColor: f.border }}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                      style={{ color: f.color, background: f.border }}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 하단 CTA */}
      <section className="border-t border-gray-100 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black mb-3">직접 사용해보세요</h2>
          <p className="text-gray-400 text-sm mb-8">메이플디스코드 서버에 입장하면 모든 기능을 바로 이용할 수 있어요.</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-xl text-base text-white transition-all hover:-translate-y-1"
            style={{ background: "#5865F2" }}>
            <DiscordIcon />디스코드 참여하기
          </a>
        </div>
      </section>

    </div>
  )
}
