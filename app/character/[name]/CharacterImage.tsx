"use client"
import { useState } from "react"

export default function CharacterImage({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="w-28 h-28 rounded-2xl bg-[#F2F4F6] flex items-center justify-center text-5xl shrink-0">
        🍁
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={`${name} 캐릭터 이미지`}
      className="w-28 h-28 rounded-2xl object-contain bg-[#F2F4F6] shrink-0"
      onError={() => setError(true)}
    />
  )
}
