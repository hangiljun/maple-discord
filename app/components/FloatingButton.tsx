"use client"

const DISCORD_URL = "https://discord.gg/2UwBw8dnSv"

export default function FloatingButton() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-1.5">
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-5 py-3 rounded-full shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
        style={{ background: "#5865F2", color: "white" }}
      >
        <img src="/icon.png" alt="" className="w-7 h-7 rounded-full object-cover" />
        <span className="font-black text-sm whitespace-nowrap">바로 입장</span>
      </a>
      <span className="text-[11px] text-gray-500 bg-white px-3 py-1 rounded-full shadow border border-gray-100 whitespace-nowrap">
        클릭 시 디스코드 바로 입장
      </span>
    </div>
  )
}
