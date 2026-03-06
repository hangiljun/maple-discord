import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "안전 거래 팁 | 메이플랜드 거래방",
  description: "메이플랜드 개인 간 거래 사기 방지 가이드. 최근 유행 사기 유형과 안전 거래 체크리스트를 확인하세요.",
  alternates: { canonical: "/tip" },
}

export default function TipPage() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap"
      />
      <style>{`
        .tip-page {
          background: #ffffff;
          color: #1e293b;
          font-family: 'Noto Sans KR', sans-serif;
          min-height: 100vh;
          padding: 40px 16px 80px;
        }
        .tip-page .tp-container { max-width: 800px; margin: 0 auto; }

        /* HEADER */
        .tip-page .tp-header { text-align: center; margin-bottom: 48px; animation: tpFadeDown 0.6s ease both; }
        .tip-page .tp-header-badge {
          display: inline-block;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.4);
          color: #f59e0b;
          font-size: 12px; font-weight: 700; letter-spacing: 3px;
          padding: 6px 16px; border-radius: 999px; margin-bottom: 16px;
          text-transform: uppercase;
        }
        .tip-page .tp-header h1 {
          font-family: 'Black Han Sans', sans-serif;
          font-size: clamp(28px, 6vw, 48px); line-height: 1.15;
          color: #0f172a; margin-bottom: 12px;
        }
        .tip-page .tp-header h1 span { color: #f59e0b; }
        .tip-page .tp-header p { color: #64748b; font-size: 14px; line-height: 1.7; }

        /* SECTION TITLE */
        .tip-page .tp-section-title {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Black Han Sans', sans-serif;
          font-size: 18px; color: #0f172a; margin-bottom: 16px;
        }
        .tip-page .tp-icon {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
        }

        /* SCAM CARDS */
        .tip-page .tp-scam-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
        .tip-page .tp-scam-card {
          background: #f8fafc; border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px; padding: 20px 24px;
          position: relative; overflow: hidden;
          animation: tpFadeUp 0.5s ease both;
        }
        .tip-page .tp-scam-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; border-radius: 4px 0 0 4px;
        }
        .tip-page .tp-scam-card.tp-danger::before { background: #ef4444; }
        .tip-page .tp-scam-card.tp-warning::before { background: #f59e0b; }
        .tip-page .tp-scam-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 12px; margin-bottom: 10px;
        }
        .tip-page .tp-scam-num {
          font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #64748b;
          background: rgba(0,0,0,0.05); padding: 3px 8px; border-radius: 4px; flex-shrink: 0;
        }
        .tip-page .tp-scam-title { font-weight: 700; font-size: 15px; color: #0f172a; flex: 1; }
        .tip-page .tp-stars { color: #f59e0b; font-size: 13px; flex-shrink: 0; }
        .tip-page .tp-scam-desc { color: #64748b; font-size: 13px; line-height: 1.75; }
        .tip-page .tp-scam-desc strong { color: #1e293b; }
        .tip-page .tp-scam-result {
          margin-top: 10px; padding: 10px 14px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; font-size: 12px; color: #dc2626;
          display: flex; gap: 6px; align-items: flex-start;
        }

        /* CHECKLIST */
        .tip-page .tp-checklist-block {
          background: #f8fafc; border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px; padding: 24px; margin-bottom: 12px;
          animation: tpFadeUp 0.5s ease both;
        }
        .tip-page .tp-checklist-subtitle {
          font-weight: 700; font-size: 14px; color: #f59e0b;
          margin-bottom: 14px; display: flex; align-items: center; gap: 6px;
        }
        .tip-page .tp-check-item {
          display: flex; gap: 10px; align-items: flex-start;
          padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.08);
          font-size: 13px; line-height: 1.65; color: #64748b;
        }
        .tip-page .tp-check-item:last-child { border-bottom: none; }
        .tip-page .tp-dot {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(16,185,129,0.15); border: 1.5px solid #10b981;
          color: #10b981; font-size: 11px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 2px;
        }
        .tip-page .tp-check-item strong { color: #0f172a; display: block; margin-bottom: 2px; }

        /* METHOD BOX */
        .tip-page .tp-method-box {
          background: linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.06));
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 16px; padding: 24px; margin-bottom: 40px;
          animation: tpFadeUp 0.5s ease both;
        }
        .tip-page .tp-method-steps { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
        .tip-page .tp-method-step {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 13px; color: #64748b; line-height: 1.65;
        }
        .tip-page .tp-step-num {
          width: 26px; height: 26px; background: #3b82f6; color: #fff;
          font-weight: 700; font-size: 13px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .tip-page .tp-method-step strong { color: #0f172a; }
        .tip-page .tp-code-chip {
          display: inline-block;
          background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3);
          color: #f59e0b; font-size: 12px; font-weight: 700;
          padding: 2px 10px; border-radius: 6px; font-family: monospace;
        }

        /* TABLE */
        .tip-page .tp-table-wrap {
          background: #f8fafc; border: 1px solid rgba(0,0,0,0.08);
          border-radius: 16px; overflow: hidden; margin-bottom: 16px;
          animation: tpFadeUp 0.5s ease both;
        }
        .tip-page table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .tip-page thead tr { background: rgba(245,158,11,0.06); }
        .tip-page thead th {
          text-align: left; padding: 12px 20px; color: #f59e0b;
          font-weight: 700; letter-spacing: 0.5px; font-size: 12px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .tip-page tbody tr { border-bottom: 1px solid rgba(0,0,0,0.08); }
        .tip-page tbody tr:last-child { border-bottom: none; }
        .tip-page tbody td { padding: 14px 20px; color: #64748b; line-height: 1.7; vertical-align: top; }
        .tip-page tbody td:first-child { color: #0f172a; font-weight: 700; white-space: nowrap; width: 80px; }

        /* WARNING BANNER */
        .tip-page .tp-warn-banner {
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 16px 20px; font-size: 13px; color: #dc2626;
          margin-bottom: 40px; display: flex; gap: 10px; align-items: flex-start;
          animation: tpFadeUp 0.5s ease both;
        }
        .tip-page .tp-wi { font-size: 18px; flex-shrink: 0; }
        .tip-page .tp-warn-banner strong { color: #0f172a; display: block; margin-bottom: 4px; }

        /* FACT CHECK */
        .tip-page .tp-fact-grid { display: flex; flex-direction: column; gap: 12px; }
        .tip-page .tp-fact-card {
          background: #f8fafc; border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px; padding: 18px 20px;
          animation: tpFadeUp 0.5s ease both;
        }
        .tip-page .tp-fact-q {
          font-size: 13px; font-weight: 700; color: #0f172a;
          margin-bottom: 8px; display: flex; gap: 8px; align-items: flex-start;
        }
        .tip-page .tp-q-badge {
          background: rgba(139,92,246,0.1); border: 1px solid rgba(139,92,246,0.3);
          color: #8b5cf6; font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 4px; flex-shrink: 0; margin-top: 1px;
        }
        .tip-page .tp-fact-a {
          font-size: 13px; color: #64748b; line-height: 1.75;
          border-left: 2px solid #10b981; padding-left: 12px;
        }
        .tip-page .tp-fact-a strong { color: #10b981; }

        /* ANIMATIONS */
        @keyframes tpFadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tpFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tip-page .tp-scam-card:nth-child(1) { animation-delay: 0.1s; }
        .tip-page .tp-scam-card:nth-child(2) { animation-delay: 0.2s; }
        .tip-page .tp-scam-card:nth-child(3) { animation-delay: 0.3s; }
        .tip-page .tp-mb-section { margin-bottom: 40px; }
      `}</style>

      <div className="tip-page">
        <div className="tp-container">

          {/* HEADER */}
          <div className="tp-header">
            <div className="tp-header-badge">🍁 MapleStory</div>
            <h1>개인 간 거래<br /><span>사기 방지 가이드</span></h1>
            <p>공식 보호 장치가 없는 개인 간 거래, 이 가이드로 소중한 자산을 지키세요.</p>
          </div>

          {/* 사기 유형 */}
          <div className="tp-mb-section">
            <div className="tp-section-title">
              <div className="tp-icon" style={{background:"rgba(239,68,68,0.12)"}}>⚠️</div>
              최근 유행 사기 유형 BEST 3
            </div>
            <div className="tp-scam-grid">

              <div className="tp-scam-card tp-warning">
                <div className="tp-scam-header">
                  <span className="tp-scam-num">TYPE 01</span>
                  <span className="tp-scam-title">지능형 3자 사기</span>
                  <span className="tp-stars">★★★</span>
                </div>
                <p className="tp-scam-desc">
                  사기꾼(A)이 판매자(B)와 구매자(C) 사이에서 중계자인 척 연기합니다.<br />
                  A가 B에게는 <strong>&ldquo;살게요&rdquo;</strong>, C에게는 <strong>&ldquo;팔게요&rdquo;</strong>라고 접근 후, C에게 B의 계좌를 알려주어 입금하게 한 뒤 아이템만 가로채 잠적합니다.
                </p>
                <div className="tp-scam-result">⚡ C는 돈을 날리고, B는 사기 계좌 제공자로 오해받아 금융 계좌 및 게임 이용 정지 피해를 입습니다.</div>
              </div>

              <div className="tp-scam-card tp-warning">
                <div className="tp-scam-header">
                  <span className="tp-scam-num">TYPE 02</span>
                  <span className="tp-scam-title">핸즈 도용 &amp; 경매장 유도 사기</span>
                  <span className="tp-stars">★★★</span>
                </div>
                <p className="tp-scam-desc">
                  보스 대리·MVP 기부 등을 빌미로 메이플 핸즈 인증을 요구합니다.<br />
                  <strong>&ldquo;지금 밖이라 접속 안 되니 경매장에 템을 올려달라&rdquo;</strong>며 접근, 가짜 사이트 링크(피싱)로 계정 정보를 탈취하거나 경매장 오류를 이용합니다.
                </p>
              </div>

              <div className="tp-scam-card tp-danger">
                <div className="tp-scam-header">
                  <span className="tp-scam-num">TYPE 03</span>
                  <span className="tp-scam-title">신용 계정 위장 사기 (닉변 사기)</span>
                  <span className="tp-stars">★★★★</span>
                </div>
                <p className="tp-scam-desc">
                  고레벨·고스펙 계정을 구매하거나 대여한 뒤 사기를 칩니다.<br />
                  겉모습으로 신용을 얻은 뒤 사기를 치고, 이후 <strong>캐릭터 이름 변경(닉변)</strong>으로 추적을 피합니다. 디스코드 인증으로 안심시키는 수법이 자주 쓰입니다.
                </p>
              </div>

            </div>
          </div>

          {/* 체크리스트 */}
          <div className="tp-mb-section">
            <div className="tp-section-title">
              <div className="tp-icon" style={{background:"rgba(16,185,129,0.12)"}}>✅</div>
              거래 전 필수 체크리스트
            </div>

            <div className="tp-checklist-block">
              <div className="tp-checklist-subtitle">🔍 실물 확인 및 연락처 검증</div>
              <div className="tp-check-item">
                <div className="tp-dot">✓</div>
                <div><strong>인게임 실물 확인</strong>&ldquo;접속 불가&rdquo;, &ldquo;창고 보관 중&rdquo;, &ldquo;경매장 등록 유도&rdquo;는 99% 사기입니다. 반드시 교환창에서 아이템 옵션과 메소량을 직접 확인하세요.</div>
              </div>
              <div className="tp-check-item">
                <div className="tp-dot">✓</div>
                <div><strong>휴대폰 본인 확인</strong>디스코드/오픈채팅 DM만으로는 부족합니다. 반드시 실제 전화번호를 받고 문자 또는 통화로 본인 여부를 확인하세요.</div>
              </div>
              <div className="tp-check-item">
                <div className="tp-dot">✓</div>
                <div><strong>더치트(TheCheat) 조회</strong>상대방의 계좌번호와 휴대폰 번호를 반드시 thecheat.co.kr 에서 조회하세요.</div>
              </div>
            </div>

            <div className="tp-method-box">
              <div className="tp-checklist-subtitle">💡 3자 사기 완벽 예방 — 1원 입금법</div>
              <div className="tp-method-steps">
                <div className="tp-method-step">
                  <div className="tp-step-num">1</div>
                  <div>상대 계좌로 <strong>1원</strong>을 송금합니다.</div>
                </div>
                <div className="tp-method-step">
                  <div className="tp-step-num">2</div>
                  <div>입금자명을 <span className="tp-code-chip">010-1234-1234 거래중</span> 형식으로 설정합니다.</div>
                </div>
                <div className="tp-method-step">
                  <div className="tp-step-num">3</div>
                  <div>상대방에게 <strong>입금자명이 어떻게 찍혔는지</strong> 확인을 요청합니다.<br />사기꾼은 본인 계좌가 아니므로 확인이 불가능합니다.</div>
                </div>
              </div>
            </div>
          </div>

          {/* 행동 강령 테이블 */}
          <div className="tp-mb-section">
            <div className="tp-section-title">
              <div className="tp-icon" style={{background:"rgba(59,130,246,0.12)"}}>📋</div>
              안전 거래 행동 강령
            </div>
            <div className="tp-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>단계</th>
                    <th>체크 항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>거래 전</td>
                    <td>서버 시세 정확히 파악 · 상대방 연락처 및 더치트 조회</td>
                  </tr>
                  <tr>
                    <td>거래 중</td>
                    <td>선입금 절대 금지 — <strong style={{color:"#0f172a"}}>아이템 확인 → 입금 → 수령</strong> 순서 준수, 재촉 시 즉시 거래 중단</td>
                  </tr>
                  <tr>
                    <td>거래 후</td>
                    <td>대화 기록, 스크린샷, 이체 확인증(PDF/이미지) 최소 <strong style={{color:"#0f172a"}}>일주일</strong> 보관</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="tp-warn-banner">
              <span className="tp-wi">🚨</span>
              <div>
                <strong>이 말이 나오면 100% 사기입니다</strong>
                &ldquo;지인 계좌예요&rdquo; · &ldquo;회사 공용 계좌라 이름이 달라요&rdquo; · &ldquo;중간 거래라 복잡해요&rdquo;
              </div>
            </div>
          </div>

          {/* 팩트체크 */}
          <div className="tp-mb-section">
            <div className="tp-section-title">
              <div className="tp-icon" style={{background:"rgba(139,92,246,0.12)"}}>🔍</div>
              추가 팩트체크 FAQ
            </div>
            <div className="tp-fact-grid">

              <div className="tp-fact-card">
                <div className="tp-fact-q">
                  <span className="tp-q-badge">Q1</span>
                  메소 구매자와 입금자 계좌 성함이 다르면 위험한가요?
                </div>
                <div className="tp-fact-a"><strong>매우 위험합니다.</strong> &ldquo;지인이 보내주겠다&rdquo; 또는 &ldquo;대신 구매해주겠다&rdquo;는 말은 보통 3자 사기의 타겟이 되는 상황입니다.</div>
              </div>

              <div className="tp-fact-card">
                <div className="tp-fact-q">
                  <span className="tp-q-badge">Q2</span>
                  더치트에서 깨끗하면 안심해도 되나요?
                </div>
                <div className="tp-fact-a"><strong>아닙니다.</strong> 최근 사기꾼들은 신규 생성 계좌나 대포 통장을 사용합니다. 더치트는 최소한의 방어선일 뿐, 1원 입금법 등을 반드시 병행하세요.</div>
              </div>

              <div className="tp-fact-card">
                <div className="tp-fact-q">
                  <span className="tp-q-badge">Q3</span>
                  경매장 거래가 더 안전하지 않나요?
                </div>
                <div className="tp-fact-a">경매장 거래도 안전할 수도 있지만, 우선 <strong>게임 내에서 만나서 서로 신분을 확인한 후에 거래하는 것이 조금 더 안전합니다.</strong></div>
              </div>

              <div className="tp-fact-card">
                <div className="tp-fact-q">
                  <span className="tp-q-badge">Q4</span>
                  본인인증으로 민증 사진을 보내주는데 믿어도 될까요?
                </div>
                <div className="tp-fact-a"><strong>절대 안 됩니다.</strong> 도용한 타인의 신분증일 가능성이 매우 높습니다. 신분증보다는 실제 통화와 문자 인증이 훨씬 신뢰도가 높습니다.</div>
              </div>

              <div className="tp-fact-card">
                <div className="tp-fact-q">
                  <span className="tp-q-badge">Q5</span>
                  입금한 사진을 보내달라고 하는데 보내줘도 될까요?
                </div>
                <div className="tp-fact-a">보통 3자 사기에서 메소를 파는 사람이 구매자에게 입금 사진을 받아 메소 판매자에게 전달하는 방식으로 이루어집니다. <strong>요청할 땐 상대방과 통화 후 보내주세요.</strong></div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  )
}
