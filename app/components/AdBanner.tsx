"use client"

import Image from "next/image"

export default function AdBanner() {
  // 디스코드 링크나 이동하고 싶은 주소를 여기에 적으세요
  const discordLink = "https://discord.gg/yourlink"

  return (
    <section 
      className="flex flex-col md:flex-row bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl cursor-pointer hover:border-orange-500 transition group"
      onClick={() => window.open(discordLink, "_blank")}
    >
      {/* 사진 영역 */}
      <div className="md:w-1/3 bg-gray-700 h-48 flex items-center justify-center relative overflow-hidden">
        {/* 이미지가 준비되면 아래 주석을 풀고 사용하세요 */}
        {/* <Image src="/ad-image.png" alt="광고" fill className="object-cover group-hover:scale-105 transition" /> */}
        <div className="text-gray-400 text-center p-4">
          <p className="text-4xl mb-2">🍁</p>
          <p className="text-sm italic font-bold">MAPLE DISCORD AD</p>
        </div>
      </div>

      {/* 소개 영역 */}
      <div className="md:w-2/3 p-6 flex flex-col justify-center bg-gradient-to-br from-gray-800 to-gray-900">
        <h2 className="text-2xl font-bold mb-2 text-orange-500">메이플 디스코드 공식 커뮤니티</h2>
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          가장 빠른 메이플랜드 거래 정보와 커뮤니티를 만나보세요.<br/>
          사진이나 아래 버튼을 누르면 링크로 연결됩니다.
        </p>
        <button className="inline-block w-fit px-8 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-bold shadow-lg transition-all active:scale-95">
          디스코드 바로가기
        </button>
      </div>
    </section>
  )
}