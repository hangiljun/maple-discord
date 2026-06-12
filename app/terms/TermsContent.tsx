"use client"
import { useState } from "react"
import Link from "next/link"

const ko = {
  title: "이용약관",
  updated: "최종 수정일: 2025년 1월 1일",
  sections: [
    {
      title: "제1조 (목적)",
      body: "본 약관은 메이플디스코드(이하 \"서비스\")가 제공하는 민원실 디스코드 봇 및 관련 서비스의 이용 조건과 절차, 이용자와 서비스 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.",
    },
    {
      title: "제2조 (서비스 설명)",
      body: "민원실 봇은 메이플디스코드 서버 내에서 다음 기능을 제공합니다.",
      list: ["게임 닉네임 인증 및 변경 처리", "사기 신고 접수 및 처리", "역할(Role) 부여 및 관리", "서버 입·퇴장 통계 관리"],
    },
    {
      title: "제3조 (이용 자격)",
      body: "본 서비스는 메이플디스코드 디스코드 서버에 참여한 사용자라면 누구든지 이용할 수 있습니다. 단, 서비스 운영 방침에 반하는 행위를 한 사용자는 이용이 제한될 수 있습니다.",
    },
    {
      title: "제4조 (금지 행위)",
      body: "다음 행위는 엄격히 금지됩니다.",
      list: ["허위 정보를 이용한 인증 또는 신고 접수", "타인을 사칭하거나 타인의 정보를 도용하는 행위", "악의적 목적의 반복 신고 또는 허위 신고", "봇 명령어를 이용한 서비스 방해 행위", "관련 법령 및 공서양속에 반하는 행위"],
    },
    {
      title: "제5조 (서비스 변경 및 중단)",
      body: "서비스는 운영상 필요에 따라 사전 공지 없이 기능을 변경하거나 서비스를 중단할 수 있습니다. 서비스 중단으로 인한 손해에 대해 서비스 측은 책임을 지지 않습니다.",
    },
    {
      title: "제6조 (면책 조항)",
      body: "서비스는 이용자 간 거래, 분쟁, 사기 피해 등에 대해 직접적인 법적 책임을 지지 않습니다. 본 서비스는 정보 공유 및 커뮤니티 운영을 목적으로 하며, 이용자는 자신의 행동에 대한 책임을 집니다.",
    },
    {
      title: "제7조 (약관 변경)",
      body: "본 약관은 서비스 운영 정책 변경 시 사전 공지 후 개정될 수 있습니다. 개정된 약관은 서비스 내 공지 후 효력이 발생합니다.",
    },
    {
      title: "제8조 (문의)",
      body: "이용약관에 관한 문의는 메이플디스코드 서버 내 관리자 채널을 통해 접수해 주세요.",
    },
  ],
  privacyLink: "개인정보 처리방침 →",
  backLink: "← 메인으로",
}

const en = {
  title: "Terms of Service",
  updated: "Last updated: January 1, 2025",
  sections: [
    {
      title: "Article 1 (Purpose)",
      body: "These Terms of Service govern the conditions, procedures, and responsibilities for using the Minwonsil Discord bot and related services provided by MapleDiscord (hereinafter \"the Service\").",
    },
    {
      title: "Article 2 (Service Description)",
      body: "The Minwonsil bot provides the following features within the MapleDiscord server:",
      list: ["Game nickname verification and change processing", "Fraud report submission and handling", "Role assignment and management", "Server join/leave statistics tracking"],
    },
    {
      title: "Article 3 (Eligibility)",
      body: "Any user who has joined the MapleDiscord Discord server may use this Service. However, users who engage in conduct contrary to the Service's operating policies may have their access restricted.",
    },
    {
      title: "Article 4 (Prohibited Activities)",
      body: "The following activities are strictly prohibited:",
      list: ["Submitting verifications or reports using false information", "Impersonating others or misusing another person's information", "Repeatedly filing reports or false reports with malicious intent", "Disrupting the Service through bot commands", "Any activity that violates applicable laws or public order"],
    },
    {
      title: "Article 5 (Service Changes and Suspension)",
      body: "The Service may modify features or suspend the Service without prior notice as operationally necessary. The Service is not liable for damages arising from service suspension.",
    },
    {
      title: "Article 6 (Disclaimer)",
      body: "The Service does not bear direct legal responsibility for transactions, disputes, or fraud damages between users. This Service is intended for information sharing and community operation, and users are responsible for their own actions.",
    },
    {
      title: "Article 7 (Amendment)",
      body: "These Terms may be revised after prior notice when the Service's operating policy changes. Revised terms take effect after being announced within the Service.",
    },
    {
      title: "Article 8 (Contact)",
      body: "For inquiries regarding these Terms of Service, please contact us through the administrator channel within the MapleDiscord server.",
    },
  ],
  privacyLink: "Privacy Policy →",
  backLink: "← Back to Home",
}

export default function TermsContent() {
  const [lang, setLang] = useState<"ko" | "en">("ko")
  const c = lang === "ko" ? ko : en

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10">
          <Link href="/home" className="text-sm text-purple-500 hover:underline">{c.backLink}</Link>

          <div className="flex items-center justify-between mt-4 mb-2">
            <h1 className="text-3xl font-black">{c.title}</h1>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-semibold">
              <button
                onClick={() => setLang("ko")}
                className={`px-4 py-1.5 transition-colors ${lang === "ko" ? "bg-purple-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >한국어</button>
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-1.5 transition-colors ${lang === "en" ? "bg-purple-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >English</button>
            </div>
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
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/privacy" className="text-sm text-purple-500 hover:underline">{c.privacyLink}</Link>
        </div>
      </div>
    </div>
  )
}
