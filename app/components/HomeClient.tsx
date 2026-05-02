"use client"
import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"

interface Banner {
  id: string
  imageUrl: string
  description: string
  link: string
  order: number
  active: boolean
}

const BOT_FEATURES = [
  {
    icon: "🍁",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    cmd: "/정보",
    title: "캐릭터 조회",
    desc: "레벨·직업·전투력·유니온은 물론 장비, 헥사, 코디, 연무장 DPS까지 한번에. 하단 🥊 버튼으로 DPS 측정 결과 확인.",
    tags: ["장비", "헥사", "코디", "연무장 DPS"],
  },
  {
    icon: "🔗",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    cmd: "/링크",
    title: "링크 스킬",
    desc: "직업명·효과 키워드로 검색 후 Lv.1(70)/Lv.2(120)/Lv.3(285) 버튼으로 전환",
    tags: ["키워드 검색", "레벨 전환", "전 직업"],
  },
  {
    icon: "🏆",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
    cmd: "/유니온",
    title: "유니온 공격대",
    desc: "직업군 → 세부 직업 → 캐릭터 계층 탐색, B~SSS 등급별 효과 버튼 전환",
    tags: ["계층 탐색", "등급 전환", "50+ 캐릭터"],
  },
]

const UPDATES = [
  {
    date: "2026.04.13",
    badge: "신규",
    badgeColor: "#22c55e",
    title: "연무장 DPS 조회 추가",
    desc: "/정보 → 🥊 연무장 버튼으로 총 데미지·DPS·스킬별 분석을 확인할 수 있어요.",
  },
  {
    date: "2026.04.13",
    badge: "신규",
    badgeColor: "#22c55e",
    title: "웹사이트 캐릭터 연무장 조회",
    desc: "캐릭터 조회 페이지에서 연무장 DPS 측정 결과를 바로 확인할 수 있습니다.",
  },
  {
    date: "2026.04.12",
    badge: "업데이트",
    badgeColor: "#3182F6",
    title: "유니온 계층형 탐색 추가",
    desc: "직업군(모험가·시그너스 등) → 세부 직업(전사·마법사 등) → 캐릭터 순으로 탐색 가능.",
  },
  {
    date: "2026.04.12",
    badge: "업데이트",
    badgeColor: "#3182F6",
    title: "/링크 레벨 버튼 및 전체 결과 표시",
    desc: "Lv.1(70)/Lv.2(120)/Lv.3(285) 버튼 전환, 결과 15개 제한 해제로 전체 표시.",
  },
]

export default function HomeClient() {
  const [banners, setBanners] = useState<Banner[]>([])

  useEffect(() => {
    const q = query(collection(db, "banners"), orderBy("order"))
    return onSnapshot(q, (snap) => {
      setBanners(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Banner))
          .filter(b => b.active)
          .slice(0, 4)
      )
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-5">

        {/* 봇 기능 카드 */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-xs font-semibold text-[#8B95A1] uppercase tracking-wide">메이플봇 기능</p>
            <Link href="/bot" className="text-xs text-[#3182F6] font-semibold hover:underline">전체 보기 →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BOT_FEATURES.map((f) => (
              <div
                key={f.cmd}
                className="bg-white rounded-2xl overflow-hidden border"
                style={{ borderColor: f.border }}
              >
                <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ borderColor: f.border, background: f.bg }}>
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <code className="text-xs font-bold" style={{ color: f.color }}>{f.cmd}</code>
                    <p className="text-sm font-bold text-[#191F28]">{f.title}</p>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-[#4E5968] leading-relaxed mb-2">{f.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {f.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-[#F2F4F6] text-[#8B95A1] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 업데이트 */}
        <div>
          <p className="text-xs font-semibold text-[#8B95A1] uppercase tracking-wide mb-2 px-1">최근 업데이트</p>
          <div className="bg-white border border-[#E5E8EB] rounded-2xl divide-y divide-[#E5E8EB]">
            {UPDATES.map((u, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{ color: u.badgeColor, background: u.badgeColor + "18" }}
                >
                  {u.badge}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#191F28]">{u.title}</span>
                    <span className="text-xs text-[#B0B8C1]">{u.date}</span>
                  </div>
                  <p className="text-xs text-[#8B95A1] mt-0.5 leading-relaxed">{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 배너 섹션 */}
        {banners.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8B95A1] uppercase tracking-wide mb-2 px-1">신용 인증</p>
            <div className="grid grid-cols-2 gap-3">
              {banners.map(banner => (
                <a key={banner.id} href={banner.link} target="_blank" rel="noopener noreferrer"
                  className="block bg-white border border-[#E5E8EB] rounded-2xl overflow-hidden hover:border-[#3182F6] transition-colors">
                  <div className="aspect-[4/3] bg-[#F9FAFB] overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.description}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                    />
                  </div>
                  <div className="px-3 py-2.5 border-t border-[#E5E8EB]">
                    <p className="text-xs font-medium text-[#4E5968] line-clamp-2 leading-relaxed">{banner.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
