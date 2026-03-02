"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation" // ✨ URL에서 ID를 가져오기 위해 필요
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import Navbar from "../../components/Navbar"

export default function UserProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [targetUser, setTargetUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchUser() {
      const docRef = doc(db, "users", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) setTargetUser(docSnap.data())
      setLoading(false)
    }
    fetchUser()
  }, [id])

  if (loading) return <div className="p-20 text-center text-white">로딩 중...</div>

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <main className="max-w-xl mx-auto mt-20 p-8 bg-[#1e1e1e] rounded-3xl border border-gray-800 text-white">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gray-800 rounded-full mb-4 flex items-center justify-center text-2xl font-bold text-orange-500 border border-orange-500/30">
            {targetUser?.badge || "B"}
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {targetUser?.nickname || "익명"} 
            {targetUser?.verified && <span className="text-blue-400">✓</span>}
          </h1>
          <p className="text-gray-500 text-xs mt-1">{targetUser?.server || "일반"} 서버 유저</p>
        </div>

        {/* 🛡️ 인증 상태 UI (사진 참고 디자인) */}
        <div className="grid grid-cols-2 gap-4 bg-black/40 p-6 rounded-2xl border border-gray-800">
          <BadgeItem label="핸즈 인증" active={targetUser?.handsVerified} />
          <BadgeItem label="이메일 인증" active={targetUser?.emailVerified} />
          <BadgeItem label="휴대폰 인증" active={targetUser?.phoneVerified} />
          <BadgeItem label="우수 인증" active={targetUser?.excellent} />
        </div>
      </main>
    </div>
  )
}

function BadgeItem({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`p-4 rounded-xl border flex flex-col items-center gap-1 ${
      active ? 'border-orange-500/50 text-orange-500 bg-orange-500/5' : 'border-gray-800 text-gray-700'
    }`}>
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[10px]">{active ? "인증됨" : "미인증"}</span>
    </div>
  )
}