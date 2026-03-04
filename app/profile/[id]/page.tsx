"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { isAdmin } from "@/lib/admin"
import Navbar from "../../components/Navbar"

export default function UserProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [targetUser, setTargetUser] = useState<any>(null)
  const [targetIsAdmin, setTargetIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function fetchUser() {
      const [docSnap, adminCheck] = await Promise.all([
        getDoc(doc(db, "users", id)),
        isAdmin(id),
      ])
      if (docSnap.exists()) setTargetUser(docSnap.data())
      setTargetIsAdmin(adminCheck)
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
            {targetIsAdmin ? "🛡️" : (targetUser?.badge || "B")}
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {targetIsAdmin ? "운영자" : (targetUser?.nickname || "익명")}
            {!targetIsAdmin && targetUser?.verified && <span className="text-blue-400">✓</span>}
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            {targetIsAdmin ? "서버 관리자" : `${targetUser?.server || "일반"} 서버 유저`}
          </p>
        </div>

        {targetIsAdmin ? (
          <div className="bg-black/40 p-6 rounded-2xl border border-orange-500/30 text-center">
            <p className="text-orange-500 font-bold text-sm">🛡️ 서버 운영자</p>
            <p className="text-gray-500 text-xs mt-2">운영자의 상세 정보는 공개되지 않아요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 bg-black/40 p-6 rounded-2xl border border-gray-800">
            <BadgeItem label="핸즈 인증" active={targetUser?.handsVerified} />
            <BadgeItem label="이메일 인증" active={targetUser?.emailVerified} />
            <BadgeItem label="휴대폰 인증" active={targetUser?.phoneVerified} />
            <BadgeItem label="우수 인증" active={targetUser?.excellent} />
          </div>
        )}
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
