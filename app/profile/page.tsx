"use client"

import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [nickname, setNickname] = useState("")
  const [server, setServer] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const userRef = doc(db, "users", currentUser.uid)
        
        // 실시간 데이터 구독
        const unsubDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data()
            setUserData(data)
            setNickname(data.nickname || "")
            setServer(data.server || "")
          }
          setLoading(false)
        })
        return () => unsubDoc()
      } else {
        setLoading(false)
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleSave = async () => {
    if (!userData?.verified) {
      alert("운영자 승인을 받은 유저만 정보를 수정할 수 있습니다.")
      return
    }
    if (!user) return

    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { 
        nickname: nickname,
        server: server,
        lastUpdated: new Date()
      })
      alert("정보가 성공적으로 수정되었습니다!")
    } catch (e: any) {
      alert("저장 실패: " + e.message)
    }
  }

  if (loading) return <div className="p-10 text-white text-center">데이터를 불러오는 중...</div>
  if (!user) return <div className="p-10 text-white text-center">로그인이 필요한 페이지입니다.</div>

  return (
    <main className="max-w-2xl mx-auto mt-16 p-8 bg-[#1e1e1e] rounded-2xl border border-gray-800 text-white shadow-2xl">
      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-2xl font-bold text-orange-500">마이페이지</h1>
        <div className="text-right">
          <p className="text-xs text-gray-500">계정 상태</p>
          <span className={`text-xs font-bold ${userData?.verified ? 'text-blue-400' : 'text-red-400'}`}>
            {userData?.verified ? "● 운영자 승인 완료" : "○ 미승인 계정"}
          </span>
        </div>
      </div>

      {/* 인증 상태 배지 섹션 */}
      <section className="mb-10 bg-[#252525] p-6 rounded-xl border border-gray-700">
        <h2 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
           <span className="text-blue-400">🛡️</span> 내 인증 정보
        </h2>
        <div className="flex flex-wrap gap-3">
          <Badge label="메이플 핸즈" active={!!userData?.handsVerified} />
          <Badge label="이메일 인증" active={!!userData?.emailVerified} />
          <Badge label="핸드폰 인증" active={!!userData?.phoneVerified} />
          <Badge label="우수 유저" active={!!userData?.excellent} />
        </div>
      </section>

      {/* 정보 수정 섹션 */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">서버 선택</label>
          <select 
            disabled={!userData?.verified}
            className="w-full bg-black border border-gray-700 p-3 rounded-lg outline-none focus:border-orange-500 disabled:opacity-50"
            value={server}
            onChange={(e) => setServer(e.target.value)}
          >
            <option value="">서버를 선택하세요</option>
            <option value="스카니아">스카니아</option>
            <option value="베라">베라</option>
            <option value="루나">루나</option>
            <option value="제니스">제니스</option>
            <option value="크로아">크로아</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">활동 닉네임</label>
          <input 
            type="text"
            disabled={!userData?.verified}
            className="w-full bg-black border border-gray-700 p-3 rounded-lg outline-none focus:border-orange-500 disabled:opacity-50"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="인증 후 수정 가능합니다"
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-orange-600 hover:bg-orange-500 font-bold py-4 rounded-xl transition-all shadow-lg mt-4 disabled:bg-gray-700"
          disabled={!userData?.verified}
        >
          설정 저장하기
        </button>
        {!userData?.verified && (
          <p className="text-center text-xs text-red-400 mt-2">※ 먼저 운영자에게 승인을 받아야 수정 권한이 생깁니다.</p>
        )}
      </div>
    </main>
  )
}

function Badge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`px-3 py-1.5 rounded-md text-[11px] font-bold border ${
      active 
      ? 'border-orange-500 text-orange-500 bg-orange-500/10' 
      : 'border-gray-700 text-gray-600 bg-transparent opacity-50'
    }`}>
      {active && '✓ '} {label}
    </div>
  )
}