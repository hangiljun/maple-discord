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
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-7 h-7">
          <path d="M20.317 4.369A19.79 19.79 0 0 0 15.432 3c-.21.375-.454.88-.622 1.28a18.27 18.27 0 0 0-5.62 0A12.6 12.6 0 0 0 8.56 3a19.74 19.74 0 0 0-4.885 1.37C1.5 8.02.874 11.58 1.06 15.09a19.9 19.9 0 0 0 6.06 3.06c.492-.67.93-1.382 1.307-2.13-.72-.27-1.41-.605-2.06-.997.173-.127.343-.26.506-.397a14.2 14.2 0 0 0 12.253 0c.166.14.336.272.506.397-.652.393-1.343.728-2.063.998.377.747.814 1.46 1.306 2.13a19.86 19.86 0 0 0 6.064-3.06c.22-4.07-.776-7.6-3.892-10.72ZM8.68 12.98c-.97 0-1.766-.887-1.766-1.977 0-1.09.78-1.978 1.766-1.978.995 0 1.783.897 1.766 1.978 0 1.09-.78 1.977-1.766 1.977Zm6.64 0c-.97 0-1.766-.887-1.766-1.977 0-1.09.78-1.978 1.766-1.978.995 0 1.783.897 1.766 1.978 0 1.09-.771 1.977-1.766 1.977Z"/>
        </svg>
        <span className="font-black text-sm whitespace-nowrap">바로 입장</span>
      </a>
      <span className="text-[11px] text-gray-500 bg-white px-3 py-1 rounded-full shadow border border-gray-100 whitespace-nowrap">
        클릭 시 디스코드 바로 입장
      </span>
    </div>
  )
}
