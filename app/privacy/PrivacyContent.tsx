"use client"
import Link from "next/link"
import { useLang } from "../contexts/LanguageContext"

const ko = {
  title: "개인정보 처리방침",
  updated: "최종 수정일: 2025년 1월 1일",
  sections: [
    {
      title: "제1조 (수집하는 개인정보 항목)",
      body: "민원실 봇은 서비스 제공을 위해 다음 정보를 수집합니다.",
      list: ["Discord 사용자 ID (고유 식별자)", "Discord 사용자 이름 및 닉네임", "게임 내 캐릭터 닉네임 (인증 시 사용자가 직접 입력)", "신고 접수 내용 (신고자 ID, 피신고자 정보, 신고 사유)", "서버 입·퇴장 일시 및 통계 데이터"],
    },
    {
      title: "제2조 (개인정보 수집 및 이용 목적)",
      body: "수집된 정보는 다음 목적으로만 사용됩니다.",
      list: ["게임 닉네임 인증 및 역할 부여", "사기 신고 접수 및 처리", "서버 운영 통계 집계 (개인 식별 불가 형태)", "중복 인증 방지 및 서비스 어뷰징 차단"],
    },
    {
      title: "제3조 (개인정보 보유 및 이용 기간)",
      body: "수집된 개인정보는 서비스 목적 달성 시까지 보유하며, 이용자가 서버를 탈퇴하거나 삭제를 요청하는 경우 지체 없이 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관할 수 있습니다.",
    },
    {
      title: "제4조 (개인정보의 제3자 제공)",
      body: "수집된 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.",
      list: ["이용자가 사전에 동의한 경우", "법령의 규정에 따라 수사기관 등의 요청이 있는 경우"],
    },
    {
      title: "제5조 (개인정보 보호 조치)",
      body: "서비스는 개인정보 보호를 위해 다음 조치를 취하고 있습니다.",
      list: ["개인정보 접근 권한을 최소한의 인원으로 제한", "외부 침입 방지를 위한 접근 통제 적용", "수집 데이터는 서비스 운영 서버에만 저장"],
    },
    {
      title: "제6조 (이용자의 권리)",
      body: "이용자는 언제든지 본인의 개인정보 조회, 수정, 삭제를 요청할 수 있습니다. 요청은 메이플디스코드 서버 내 관리자 채널을 통해 접수하며, 요청 접수 후 지체 없이 처리합니다.",
    },
    {
      title: "제7조 (Discord 플랫폼 정책 준수)",
      body: "본 봇은 Discord의 서비스 이용약관 및 개발자 정책을 준수합니다.",
      discordLink: true,
    },
    {
      title: "제8조 (개인정보 처리방침 변경)",
      body: "본 방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 고지합니다.",
    },
    {
      title: "제9조 (문의)",
      body: "개인정보 처리방침에 관한 문의는 메이플디스코드 서버 내 관리자 채널을 통해 접수해 주세요.",
    },
  ],
  discordPrivacy: "Discord의 개인정보 처리방침은",
  discordPrivacyLink: "discord.com/privacy",
  discordPrivacySuffix: "에서 확인할 수 있습니다.",
  termsLink: "← 이용약관",
  backLink: "← 메인으로",
}

const en = {
  title: "Privacy Policy",
  updated: "Last updated: January 1, 2025",
  sections: [
    {
      title: "Article 1 (Information We Collect)",
      body: "The Minwonsil bot collects the following information to provide its services:",
      list: ["Discord User ID (unique identifier)", "Discord username and display name", "In-game character nickname (entered by the user during verification)", "Report submission content (reporter ID, reported user information, reason)", "Server join/leave timestamps and statistical data"],
    },
    {
      title: "Article 2 (How We Use Information)",
      body: "Collected information is used solely for the following purposes:",
      list: ["Game nickname verification and role assignment", "Fraud report submission and processing", "Server operation statistics (in non-personally identifiable form)", "Preventing duplicate verifications and blocking service abuse"],
    },
    {
      title: "Article 3 (Retention Period)",
      body: "Collected personal information is retained until the purpose of the service is fulfilled. If a user leaves the server or requests deletion, the information will be destroyed without delay. However, information may be retained for the period required by applicable laws.",
    },
    {
      title: "Article 4 (Third-Party Disclosure)",
      body: "Collected personal information is not provided to third parties as a rule. Exceptions include:",
      list: ["Cases where the user has given prior consent", "Cases where investigative agencies request information pursuant to applicable laws"],
    },
    {
      title: "Article 5 (Security Measures)",
      body: "The Service takes the following measures to protect personal information:",
      list: ["Access to personal information is restricted to the minimum number of personnel", "Access controls are applied to prevent unauthorized external access", "Collected data is stored only on the Service's operating servers"],
    },
    {
      title: "Article 6 (User Rights)",
      body: "Users may request access, correction, or deletion of their personal information at any time. Requests can be submitted through the administrator channel in the MapleDiscord server and will be processed without delay.",
    },
    {
      title: "Article 7 (Discord Platform Compliance)",
      body: "This bot complies with Discord's Terms of Service and Developer Policy.",
      discordLink: true,
    },
    {
      title: "Article 8 (Policy Changes)",
      body: "This policy may be updated due to changes in laws or service policies. Any changes will be announced within the Service.",
    },
    {
      title: "Article 9 (Contact)",
      body: "For inquiries regarding this Privacy Policy, please contact us through the administrator channel within the MapleDiscord server.",
    },
  ],
  discordPrivacy: "Discord's Privacy Policy can be found at",
  discordPrivacyLink: "discord.com/privacy",
  discordPrivacySuffix: ".",
  termsLink: "← Terms of Service",
  backLink: "← Back to Home",
}

export default function PrivacyContent() {
  const { lang } = useLang()
  const c = lang === "ko" ? ko : en

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10">
          <Link href="/home" className="text-sm text-purple-500 hover:underline">{c.backLink}</Link>

          <div className="mt-4 mb-2">
            <h1 className="text-3xl font-black">{c.title}</h1>
          </div>
          <p className="text-sm text-gray-400">{c.updated}</p>
        </div>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-base font-bold text-gray-900 mb-2">{s.title}</h2>
              <p>{s.body}</p>
              {s.list && (
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.discordLink && (
                <p className="mt-2">
                  {c.discordPrivacy}{" "}
                  <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-purple-500 hover:underline">{c.discordPrivacyLink}</a>
                  {c.discordPrivacySuffix}
                </p>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/terms" className="text-sm text-purple-500 hover:underline">{c.termsLink}</Link>
        </div>
      </div>
    </div>
  )
}
