import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "개인정보 처리방침 | 메이플디스코드",
  description: "메이플디스코드 민원실 봇 개인정보 처리방침",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10">
          <Link href="/home" className="text-sm text-purple-500 hover:underline">← 메인으로</Link>
          <h1 className="text-3xl font-black mt-4 mb-2">개인정보 처리방침</h1>
          <p className="text-sm text-gray-400">최종 수정일: 2025년 1월 1일</p>
        </div>

        <div className="space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제1조 (수집하는 개인정보 항목)</h2>
            <p>민원실 봇은 서비스 제공을 위해 다음 정보를 수집합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Discord 사용자 ID (고유 식별자)</li>
              <li>Discord 사용자 이름 및 닉네임</li>
              <li>게임 내 캐릭터 닉네임 (인증 시 사용자가 직접 입력)</li>
              <li>신고 접수 내용 (신고자 ID, 피신고자 정보, 신고 사유)</li>
              <li>서버 입·퇴장 일시 및 통계 데이터</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제2조 (개인정보 수집 및 이용 목적)</h2>
            <p>수집된 정보는 다음 목적으로만 사용됩니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>게임 닉네임 인증 및 역할 부여</li>
              <li>사기 신고 접수 및 처리</li>
              <li>서버 운영 통계 집계 (개인 식별 불가 형태)</li>
              <li>중복 인증 방지 및 서비스 어뷰징 차단</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제3조 (개인정보 보유 및 이용 기간)</h2>
            <p>수집된 개인정보는 서비스 목적 달성 시까지 보유하며, 이용자가 서버를 탈퇴하거나 삭제를 요청하는 경우 지체 없이 파기합니다. 단, 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제4조 (개인정보의 제3자 제공)</h2>
            <p>수집된 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 따라 수사기관 등의 요청이 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제5조 (개인정보 보호 조치)</h2>
            <p>서비스는 개인정보 보호를 위해 다음 조치를 취하고 있습니다.</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>개인정보 접근 권한을 최소한의 인원으로 제한</li>
              <li>외부 침입 방지를 위한 접근 통제 적용</li>
              <li>수집 데이터는 서비스 운영 서버에만 저장</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제6조 (이용자의 권리)</h2>
            <p>이용자는 언제든지 본인의 개인정보 조회, 수정, 삭제를 요청할 수 있습니다. 요청은 메이플디스코드 서버 내 관리자 채널을 통해 접수하며, 요청 접수 후 지체 없이 처리합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제7조 (Discord 플랫폼 정책 준수)</h2>
            <p>본 봇은 Discord의 서비스 이용약관 및 개발자 정책을 준수합니다. Discord의 개인정보 처리방침은 <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">discord.com/privacy</a>에서 확인할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제8조 (개인정보 처리방침 변경)</h2>
            <p>본 방침은 법령 또는 서비스 정책 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지를 통해 고지합니다.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-2">제9조 (문의)</h2>
            <p>개인정보 처리방침에 관한 문의는 메이플디스코드 서버 내 관리자 채널을 통해 접수해 주세요.</p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4 text-sm">
          <Link href="/terms" className="text-purple-500 hover:underline">이용약관 →</Link>
        </div>
      </div>
    </div>
  )
}
