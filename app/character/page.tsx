"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

const EXAMPLE_NAMES = ["아크메이지", "팔라딘", "나이트로드", "바이퍼", "캐논슈터"]

export default function CharacterSearchPage() {
  const [name, setName] = useState("")
  const router = useRouter()

  const handleSearch = (value?: string) => {
    const trimmed = (value ?? name).trim()
    if (!trimmed) return
    router.push(`/character/${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-6 py-8 text-center">
          <div className="text-5xl mb-4">🍁</div>
          <h1 className="text-2xl font-bold text-[#191F28]">캐릭터 조회</h1>
          <p className="text-[#8B95A1] text-sm mt-2">
            메이플스토리 캐릭터 정보를 닉네임으로 조회하세요
          </p>
        </div>

        {/* 검색 박스 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-6 py-6 space-y-4">
          <label className="block text-sm font-semibold text-[#191F28]">캐릭터 닉네임</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="닉네임을 입력하세요"
              className="flex-1 border border-[#E5E8EB] rounded-xl px-4 py-3 text-sm text-[#191F28] placeholder:text-[#C8CDD4] focus:outline-none focus:border-[#3182F6] transition-colors"
              autoFocus
            />
            <button
              onClick={() => handleSearch()}
              className="flex items-center gap-2 bg-[#3182F6] hover:bg-[#1C6EE8] text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
            >
              <Search size={16} />
              조회
            </button>
          </div>
          <p className="text-xs text-[#8B95A1]">* Nexon OpenAPI 기반으로 조회됩니다</p>
        </div>

        {/* 예시 검색어 */}
        <div className="bg-white border border-[#E5E8EB] rounded-2xl px-6 py-5">
          <p className="text-xs font-semibold text-[#8B95A1] mb-3">예시 닉네임</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_NAMES.map((n) => (
              <button
                key={n}
                onClick={() => handleSearch(n)}
                className="px-3 py-1.5 rounded-lg bg-[#F2F4F6] hover:bg-[#EBF3FE] hover:text-[#3182F6] text-sm text-[#4E5968] font-medium transition-colors"
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-[#F0F6FF] border border-[#C7DFFE] rounded-xl px-4 py-3">
          <p className="text-xs text-[#1A5FC8] leading-relaxed">
            💡 캐릭터 정보는 Nexon OpenAPI에서 실시간으로 가져옵니다.
            데이터 업데이트에 최대 하루 정도 소요될 수 있습니다.
          </p>
        </div>

      </div>
    </div>
  )
}
