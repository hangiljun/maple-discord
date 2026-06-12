import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "이용약관 | 메이플디스코드",
  description: "메이플디스코드 민원실 봇 이용약관",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10">
          <Link href="/home" className="text-sm text-purple-500 hover:underline">← 메인으로</Link>
          <h1 className="text-3xl font-black mt-4 mb-2">이용약관</h1>
          <p className="text-sm text-gray-400">최종 수정일: 2025년 1월 1일</p>
        </div>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제1조 (목적)</h2>
            <p>본 약관은 메이플디스코드(이하 "서비스")가 제공하는 민원실 디스코드 봇 및 관련 서비스의 이용 조건과 절차, 이용자와 서비스 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제2조 (서비스 설명)</h2>
            <p>민원실 봇은 메이플디스코드 서버 내에서 다음 기능을 제공합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>게임 닉네임 인증 및 변경 처리</li>
              <li>사기 신고 접수 및 처리</li>
              <li>역할(Role) 부여 및 관리</li>
              <li>서버 입·퇴장 통계 관리</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제3조 (이용 자격)</h2>
            <p>본 서비스는 메이플디스코드 디스코드 서버에 참여한 사용자라면 누구든지 이용할 수 있습니다. 단, 서비스 운영 방침에 반하는 행위를 한 사용자는 이용이 제한될 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제4조 (금지 행위)</h2>
            <p>다음 행위는 엄격히 금지됩니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>허위 정보를 이용한 인증 또는 신고 접수</li>
              <li>타인을 사칭하거나 타인의 정보를 도용하는 행위</li>
              <li>악의적 목적의 반복 신고 또는 허위 신고</li>
              <li>봇 명령어를 이용한 서비스 방해 행위</li>
              <li>관련 법령 및 공서양속에 반하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제5조 (서비스 변경 및 중단)</h2>
            <p>서비스는 운영상 필요에 따라 사전 공지 없이 기능을 변경하거나 서비스를 중단할 수 있습니다. 서비스 중단으로 인한 손해에 대해 서비스 측은 책임을 지지 않습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제6조 (면책 조항)</h2>
            <p>서비스는 이용자 간 거래, 분쟁, 사기 피해 등에 대해 직접적인 법적 책임을 지지 않습니다. 본 서비스는 정보 공유 및 커뮤니티 운영을 목적으로 하며, 이용자는 자신의 행동에 대한 책임을 집니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제7조 (약관 변경)</h2>
            <p>본 약관은 서비스 운영 정책 변경 시 사전 공지 후 개정될 수 있습니다. 개정된 약관은 서비스 내 공지 후 효력이 발생합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제8조 (문의)</h2>
            <p>이용약관에 관한 문의는 메이플디스코드 서버 내 관리자 채널을 통해 접수해 주세요.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm">
          <Link href="/privacy" className="text-purple-500 hover:underline">개인정보 처리방침 →</Link>
        </div>
      </div>
    </div>
  )
}
