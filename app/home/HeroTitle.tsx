"use client"
import { useState, useEffect } from "react"

const TITLES = [
  { name: "메이플스토리", color: "#f59e0b" },
  { name: "메이플랜드",   color: "#22c55e" },
  { name: "메이플플래닛", color: "#a855f7" },
]

export default function HeroTitle() {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % 3), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <h1 className="flex flex-col gap-1 mb-6 tracking-tight" style={{ lineHeight: 1.15 }}>
      {TITLES.map((t, i) => (
        <span key={t.name} style={{
          display: "block",
          fontSize: i === active ? "clamp(2.6rem, 6vw, 4rem)" : "clamp(1.3rem, 2.5vw, 1.8rem)",
          fontWeight: i === active ? 900 : 500,
          color: i === active ? t.color : "#9ca3af",
          transition: "font-size 0.45s ease, color 0.45s ease, font-weight 0.45s ease",
        }}>{t.name}</span>
      ))}
      <span className="mt-2 text-gray-900 font-black" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
        종합 디스코드
      </span>
    </h1>
  )
}
