"use client"
import { useRef, useEffect } from "react"
import Link from "next/link"

const DISCORD_URL = "https://discord.gg/2UwBw8dnSv"

const GAMES = [
  {
    name: "메이플스토리",
    tag: "KMS · GMS",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
    icon: "🍁",
    features: ["메소 · 아이템 거래방", "캐릭터 정보 조회기능", "패치노트 · 이벤트 공지", "링크스킬 · 유니온 조회"],
  },
  {
    name: "메이플랜드",
    tag: "클래식 서버",
    color: "#3182F6",
    bg: "rgba(49,130,246,0.1)",
    border: "rgba(49,130,246,0.25)",
    icon: "🌿",
    features: ["메소 · 아이템 거래방", "안전거래 인증 시스템", "사기꾼 제보 채널", "거래 주의사항 안내"],
  },
  {
    name: "메이플플래닛",
    tag: "신규 서버",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.25)",
    icon: "🪐",
    features: ["전용 채널 운영 중", "커뮤니티 · 자유게시판", "공지 · 업데이트 알림", "유저 간 정보 공유"],
  },
]

const FEATURES = [
  { icon: "🤖", title: "메이플봇", desc: "캐릭터 정보, 링크스킬, 유니온을 슬래시 커맨드 하나로 조회." },
  { icon: "🔒", title: "인증 거래 시스템", desc: "유저 인증 후 거래 채널 입장. 사기 발생 시 즉시 제보 및 차단 처리." },
  { icon: "📢", title: "게임별 공지 채널", desc: "메이플스토리·메이플랜드·메이플플래닛 패치노트와 변경사항을 가장 빠르게." },
  { icon: "💬", title: "활발한 커뮤니티", desc: "5만 명이 모인 국내 최대 메이플 종합 디스코드. 정보 공유부터 친목까지." },
]

const COMMANDS = [
  {
    name: "/파티", badge: "파티모집", color: "#f43f5e", bg: "rgba(244,63,94,0.15)",
    desc: "파티 모집 공고를 생성합니다. 모집자·신청자·상태가 임베드로 표시되며 참가 신청과 마감을 버튼으로 처리해요.",
    example: "/파티 개미굴",
    features: ["🍁 파티 모집 임베드 자동 생성", "✋ 참가하기 버튼으로 신청자 자동 등록", "🔒 파티 마감 버튼으로 모집 종료", "👥 모집자 · 신청자 · 상태 실시간 표시"],
  },
  {
    name: "/정보", badge: "캐릭터", color: "#f59e0b", bg: "rgba(245,158,11,0.15)",
    desc: "캐릭터 기본 정보 조회. 장비·헥사·코디·레벨 변동·캐릭터 역사까지.",
    example: "/정보 아크메이지",
    features: ["🛡️ 장비 슬롯별 목록 및 잠재 옵션", "📈 최근 7일 경험치 · 30일 레벨 히스토리", "💎 헥사 코어 및 헥사 스탯", "🎨 캐릭터 코디 및 타임라인 조회"],
  },
  {
    name: "/링크", badge: "링크스킬", color: "#22c55e", bg: "rgba(34,197,94,0.15)",
    desc: "링크 스킬을 직업명 또는 효과 키워드로 검색. Lv.1/2/3 버튼 전환 지원.",
    example: "/링크 경험치",
    features: ["🔍 직업명 완전 일치 → 전 레벨 효과 한눈에", "🔑 키워드 검색 → 조건에 맞는 링크 스킬 목록", "🔢 Lv.1(70) / Lv.2(120) / Lv.3(285) 버튼 전환"],
  },
  {
    name: "/유니온", badge: "유니온", color: "#a855f7", bg: "rgba(168,85,247,0.15)",
    desc: "유니온 공격대원 효과 검색. 직업군 계층형 버튼 탐색 또는 키워드 직접 검색.",
    example: "/유니온 모험가",
    features: ["🏆 직업군 입력 → 세부 직업 버튼 탐색", "⚔️ 직업 계열 입력 → 해당 직업군 선택 탐색", "🔍 직업명 완전 일치 → 전 등급(B~SSS) 효과"],
  },
]

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 71 55" fill="currentColor">
    <path d="M60.1 4.9A58.5 58.5 0 0 0 45.5.4a.2.2 0 0 0-.2.1 40.7 40.7 0 0 0-1.8 3.7 54 54 0 0 0-16.2 0A37.8 37.8 0 0 0 25.5.5a.2.2 0 0 0-.2-.1A58.3 58.3 0 0 0 10.7 4.9a.2.2 0 0 0-.1.1C1.6 18.1-.9 31 .3 43.6a.2.2 0 0 0 .1.2 58.8 58.8 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.7 38.7 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.5 5.3 24 5.3 35.4 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.6 2.6.2.2 0 0 0-.1.3 47 47 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.6 58.6 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-14.7-2.4-27.5-10.1-38.8a.2.2 0 0 0-.1 0ZM23.7 36.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.7 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
  </svg>
)

const SPRITES = {
  slime:    "https://maplestory.io/api/GMS/253/mob/100100/icon",
  mushroom: "https://maplestory.io/api/GMS/253/mob/210100/icon",
}

// 배경.png 체커보드(격자) 제거: 외곽 DFS로 연결된 무채색 밝은 픽셀만 투명화
function CharacterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, 0, 0)

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const w = canvas.width, h = canvas.height
      const out = new Uint8ClampedArray(data)
      const visited = new Uint8Array(w * h)

      // 배경 픽셀 판별:
      //   1) 이미 투명
      //   2) 어두운 단색 배경 (avg<30, chroma<20)
      //   3) 체커보드 (무채색 밝은 픽셀 avg>130, chroma<35)
      const isBg = (idx: number) => {
        if (data[idx + 3] < 10) return true
        const r = data[idx], g = data[idx + 1], b = data[idx + 2]
        const avg = (r + g + b) / 3
        const chroma = Math.max(r, g, b) - Math.min(r, g, b)
        if (avg < 30 && chroma < 20) return true   // 외곽 어두운 배경
        if (avg > 130 && chroma < 35) return true  // 체커보드 밝은 격자
        return false
      }

      // Pass 1: 외곽 DFS → 연결된 배경 투명화
      const stack: number[] = []
      for (let x = 0; x < w; x++) { stack.push(x); stack.push((h - 1) * w + x) }
      for (let y = 1; y < h - 1; y++) { stack.push(y * w); stack.push(y * w + w - 1) }

      while (stack.length) {
        const pos = stack.pop()!
        if (visited[pos]) continue
        visited[pos] = 1
        if (!isBg(pos * 4)) continue
        out[pos * 4 + 3] = 0
        const x = pos % w, y = Math.floor(pos / w)
        if (x > 0)     stack.push(pos - 1)
        if (x < w - 1) stack.push(pos + 1)
        if (y > 0)     stack.push(pos - w)
        if (y < h - 1) stack.push(pos + w)
      }

      // Pass 2: 캐릭터 내부에 갇힌 소규모 체커보드 패치 제거
      // → 연결된 밝은-회색 덩어리를 BFS로 탐색, 1500px 미만이면 제거
      const blobVis = new Uint8Array(w * h)
      for (let start = 0; start < w * h; start++) {
        if (out[start * 4 + 3] === 0 || blobVis[start]) continue
        const sr = out[start*4], sg = out[start*4+1], sb = out[start*4+2]
        const savg = (sr + sg + sb) / 3
        const schroma = Math.max(sr, sg, sb) - Math.min(sr, sg, sb)
        if (savg <= 130 || schroma >= 35) continue

        const blob: number[] = []
        const bq: number[] = [start]
        blobVis[start] = 1
        for (let bi = 0; bi < bq.length; bi++) {
          const pos = bq[bi]
          blob.push(pos)
          const px = pos % w, py = (pos / w) | 0
          const ns = [
            px > 0 ? pos - 1 : -1, px < w - 1 ? pos + 1 : -1,
            py > 0 ? pos - w : -1, py < h - 1 ? pos + w : -1,
          ]
          for (const n of ns) {
            if (n < 0 || blobVis[n] || out[n * 4 + 3] === 0) continue
            const nr = out[n*4], ng = out[n*4+1], nb = out[n*4+2]
            if ((nr+ng+nb)/3 > 130 && Math.max(nr,ng,nb)-Math.min(nr,ng,nb) < 35) {
              blobVis[n] = 1
              bq.push(n)
            }
          }
        }
        if (blob.length < 1500) for (const p of blob) out[p * 4 + 3] = 0
      }

      // Pass 3: 경계 스무딩
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const pos = y * w + x, idx = pos * 4
          if (out[idx + 3] === 0) continue
          const adj = out[(pos-1)*4+3]===0 || out[(pos+1)*4+3]===0 ||
                      out[(pos-w)*4+3]===0 || out[(pos+w)*4+3]===0
          if (!adj) continue
          const r = out[idx], g = out[idx+1], b = out[idx+2]
          if (Math.max(r,g,b) - Math.min(r,g,b) < 30 && (r+g+b)/3 > 130) {
            out[idx + 3] = Math.floor(out[idx + 3] * 0.15)
          }
        }
      }

      ctx.putImageData(new ImageData(out, w, h), 0, 0)
    }
    img.src = "/배경.png"
  }, [])

  return (
    <div
      className="hidden lg:flex items-center justify-center"
      style={{ height: "85vh", maxHeight: "800px" }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="h-full w-auto object-contain block"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 20%)",
        }}
      />
    </div>
  )
}

export default function DevPage() {
  return (
    <div className="min-h-screen bg-[#07090f] text-white">

      {/* 테스트 배너 */}
      <div className="relative z-50 bg-yellow-400 text-black text-xs font-bold text-center py-2 px-4 flex items-center justify-center gap-3">
        <span>🚧 UI 테스트 페이지 — 메인에 반영되지 않습니다</span>
        <Link href="/home" className="underline hover:no-underline">← 실제 메인으로</Link>
      </div>

      {/* ── 히어로 ──────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">

        {/* 배경 광원 효과 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(99,70,210,0.35) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[-5%] right-[5%] w-[500px] h-[400px] rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        </div>

        {/* 배경 몬스터 스프라이트 — 왼쪽 하단 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img src={SPRITES.slime} alt="" aria-hidden
            className="absolute bottom-[8%] left-[1%] w-20 md:w-28 opacity-50 drop-shadow-lg"
            style={{ imageRendering: "pixelated" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
          <img src={SPRITES.mushroom} alt="" aria-hidden
            className="absolute bottom-[10%] left-[12%] w-16 md:w-20 opacity-45 drop-shadow-lg"
            style={{ imageRendering: "pixelated" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
        </div>

        {/* 메인 콘텐츠 — 2컬럼 그리드 */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">

            {/* ── 왼쪽: 텍스트 콘텐츠 (가운데 정렬) ── */}
            <div className="flex flex-col items-center text-center">

              {/* 온라인 배지 */}
              <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-7 text-sm font-medium text-[#a5b4fc]"
                style={{
                  background: "rgba(99,70,210,0.18)",
                  border: "1px solid rgba(139,92,246,0.3)",
                  backdropFilter: "blur(12px)",
                }}>
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                지금 온라인 · 5만 명 커뮤니티
              </div>

              {/* 게임 태그 */}
              <div className="flex gap-2 flex-wrap justify-center mb-8">
                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full"
                  style={{ color: "#f59e0b", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  🍁 메이플스토리
                </span>
                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full"
                  style={{ color: "#4ade80", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)" }}>
                  🌿 메이플랜드
                </span>
                <span className="text-xs font-bold px-3.5 py-1.5 rounded-full"
                  style={{ color: "#c084fc", background: "rgba(192,132,252,0.15)", border: "1px solid rgba(192,132,252,0.3)" }}>
                  🪐 메이플플래닛
                </span>
              </div>

              {/* 메인 타이틀 */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6">
                메이플스토리 · 메이플랜드 · 메이플플래닛
                <br />
                <span style={{
                  background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #c084fc 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  종합 디스코드
                </span>
              </h1>

              {/* 서브 카피 */}
              <p className="text-[#94a3b8] text-base md:text-lg leading-relaxed mb-10">
                메이플스토리 · 메이플랜드 · 메이플플래닛을 한 곳에서.<br />
                거래, 파티, 보스, 정보 조회, 커뮤니티까지 한번에.
              </p>

              {/* 통계 카드 3개 */}
              <div className="grid grid-cols-3 gap-3 mb-10 w-full max-w-md">

                {/* 카드 1: 총 멤버 + 캐릭터 이미지 */}
                <div className="flex flex-col items-center gap-1 px-3 py-4 rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                  }}>
                  <p className="text-2xl md:text-3xl font-black text-white leading-none">50,000+</p>
                  <p className="text-xs text-[#64748b] font-medium">총 멤버</p>
                  <img
                    src="/캐릭터.png"
                    alt=""
                    aria-hidden
                    className="w-full h-auto object-contain mt-1.5"
                    style={{ maxWidth: "88px" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                </div>

                {/* 카드 2: 게임 커버 */}
                <div className="flex flex-col items-center gap-2 px-3 py-5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                  }}>
                  <div className="flex flex-col items-center gap-0.5 mb-1 h-14 justify-center">
                    <span className="text-sm font-black leading-tight" style={{ color: "#f59e0b" }}>🍁 메이플스토리</span>
                    <span className="text-sm font-black leading-tight" style={{ color: "#4ade80" }}>🌿 메이플랜드</span>
                    <span className="text-sm font-black leading-tight" style={{ color: "#c084fc" }}>🪐 메이플플래닛</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-white leading-none">3개</p>
                  <p className="text-xs text-[#64748b] font-medium">게임 커버</p>
                </div>

                {/* 카드 3: 실시간 운영 */}
                <div className="flex flex-col items-center gap-2 px-3 py-5 rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                  }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1"
                    style={{
                      background: "rgba(34,211,238,0.1)",
                      border: "2px solid rgba(34,211,238,0.6)",
                      boxShadow: "0 0 16px rgba(34,211,238,0.4), inset 0 0 12px rgba(34,211,238,0.1)",
                    }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                      stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-white leading-none">24/7</p>
                  <p className="text-xs text-[#64748b] font-medium">실시간 운영</p>
                </div>

              </div>

              {/* CTA 버튼 */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-xl text-base text-white transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: "#5865F2",
                    boxShadow: "0 0 24px rgba(88,101,242,0.5), 0 4px 20px rgba(88,101,242,0.3)",
                  }}>
                  <DiscordIcon />
                  디스코드 참여하기
                </a>
                <Link href="/notice"
                  className="flex items-center gap-2 font-semibold px-7 py-3.5 rounded-xl text-base text-white transition-all duration-200 hover:bg-white/10"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(12px)",
                  }}>
                  공지사항 보기
                </Link>
              </div>

            </div>

            {/* ── 오른쪽: 마법사 캐릭터 (배경.png, Canvas 체커보드 제거) ── */}
            <CharacterCanvas />

          </div>
        </div>
      </section>

      {/* ── 게임별 채널 소개 ──────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-center text-xs font-bold tracking-widest text-[#818cf8] uppercase mb-3">GAMES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-3">어떤 게임을 하세요?</h2>
        <p className="text-center text-sm text-[#64748b] mb-10">게임별 전용 채널을 운영하고 있어요</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GAMES.map((g) => (
            <div key={g.name} className="rounded-2xl border p-5 flex flex-col gap-4"
              style={{ background: g.bg, borderColor: g.border }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <p className="font-black text-white text-base">{g.name}</p>
                  <p className="text-xs font-medium" style={{ color: g.color }}>{g.tag}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {g.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#cbd5e1]">
                    <span className="w-1 h-1 rounded-full shrink-0" style={{ background: g.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
                className="mt-auto text-center text-xs font-bold py-2 rounded-xl border transition-colors hover:opacity-80"
                style={{ color: g.color, borderColor: g.border }}>
                채널 입장하기 →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ── 서버 특징 ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-bold tracking-widest text-[#818cf8] uppercase mb-3">FEATURES</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-10">메이플디스코드에서 할 수 있는 것</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.08] transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-[#94a3b8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 봇 명령어 ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-bold tracking-widest text-[#818cf8] uppercase mb-3">BOT COMMANDS</p>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-2">메이플봇 명령어</h2>
        <p className="text-center text-sm text-[#64748b] mb-10">공식 Nexon OpenAPI 기반 · 최대 15분 지연</p>
        <div className="space-y-4">
          {COMMANDS.map((cmd) => (
            <div key={cmd.name} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                  style={{ background: cmd.bg, color: cmd.color }}>/</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <code className="font-black text-base px-2 py-0.5 rounded-lg"
                      style={{ color: cmd.color, background: cmd.bg }}>{cmd.name}</code>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: cmd.color, background: cmd.bg }}>{cmd.badge}</span>
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

      {/* ── 하단 CTA ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px]"
            style={{ background: "radial-gradient(ellipse, rgba(88,101,242,0.2) 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {GAMES.map(g => (
              <span key={g.name} className="text-xs font-bold px-3 py-1 rounded-full border"
                style={{ color: g.color, background: g.bg, borderColor: g.border }}>
                {g.icon} {g.name}
              </span>
            ))}
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">지금 바로 참여하세요</h2>
          <p className="text-[#94a3b8] text-sm mb-10">5만 명의 메이플러가 기다리고 있어요 · 완전 무료</p>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 font-bold px-10 py-4 rounded-xl text-base text-white transition-all duration-200 hover:-translate-y-1"
            style={{
              background: "#5865F2",
              boxShadow: "0 0 32px rgba(88,101,242,0.55), 0 4px 24px rgba(88,101,242,0.35)",
            }}>
            <DiscordIcon />
            디스코드 참여하기
          </a>
        </div>
      </section>

    </div>
  )
}
