'use client';

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '60px 20px' }}>
      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>
          개인정보 처리방침
        </h1>

        <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '12px', lineHeight: '1.8', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>제1조 (개인정보의 수집)</h2>
            <p style={{ color: '#4B5563' }}>
              본 사이트는 거래 진행을 위해 최소한의 정보(닉네임, 서버, 연락처)만을 수집합니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>제2조 (개인정보의 이용)</h2>
            <p style={{ color: '#4B5563' }}>
              수집된 정보는 거래 진행 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>제3조 (개인정보의 보관 및 파기)</h2>
            <p style={{ color: '#4B5563' }}>
              거래 완료 후 일정 기간 보관 후 파기됩니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>제4조 (이용자의 권리)</h2>
            <p style={{ color: '#4B5563' }}>
              이용자는 언제든지 본인의 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.
            </p>
          </section>

          <p style={{ marginTop: '32px', color: '#9CA3AF', fontSize: '14px', textAlign: 'center' }}>
            시행일: 2026년 6월 24일
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href="/" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>← 홈으로 돌아가기</a>
        </div>
      </main>
    </div>
  );
}
