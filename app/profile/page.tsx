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
    if (!userData?.verified) return;
    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, { nickname, server })
      alert("성공적으로 저장되었습니다!")
    } catch (e) {
      alert("저장 중 오류가 발생했습니다.")
    }
  }

  if (loading) return <div className="p-20 text-center text-white">정보를 불러오는 중...</div>
  if (!user) return <div className="p-20 text-center text-white">로그인이 필요합니다.</div>

  return (
    <main className="max-w-xl mx-auto mt-16 p-8 bg-[#1e1e1e] rounded-2xl border border-gray-800 text-white shadow-2xl">
      <h1 className="text-2xl font-bold text-orange-500 mb-2 text-center">회원 정보</h1>
      <p className="text-gray-500 text-sm text-center mb-10">{user.email}</p>

      {/* 상단 인증 상태 (참고 사진 스타일 구현) */}
      <section className="mb-10 bg-black/40 p-6 rounded-2xl border border-gray-800">
        <h2 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Verification Status</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Badge label="핸즈 인증" active={!!userData?.handsVerified} />
          <Badge label="이메일 인증" active={!!userData?.emailVerified} />
          <Badge label="휴대폰 인증" active={!!userData?.phoneVerified} />
        </div>
      </section>

      {/* 본문: 인증 여부에 따라 수정 칸 또는 읽기 칸 표시 */}
      <div className="space-y-8">
        <div>
          <label className="text-xs font-bold text-gray-500 ml-1">활동 서버</label>
          {userData?.verified ? (
            <select 
              className="w-full bg-black border border-gray-700 p-4 rounded-xl mt-2 outline-none focus:border-orange-500 transition"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            >
              <option value="">서버 선택</option>
              <option value="스카니아">스카니아</option>
              <option value="루나">루나</option>
              <option value="제니스">제니스</option>
              <option value="크로아">크로아</option>
            </select>
          ) : (
            <div className="w-full bg-gray-900/50 border border-gray-800 p-4 rounded-xl mt-2 text-gray-400">
              {server || "서버 정보가 없습니다."}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 ml-1">활동 닉네임</label>
          {userData?.verified ? (
            <input 
              type="text"
              className="w-full bg-black border border-gray-700 p-4 rounded-xl mt-2 outline-none focus:border-orange-500 transition"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="변경할 닉네임 입력"
            />
          ) : (
            <div className="w-full bg-gray-900/50 border border-gray-800 p-4 rounded-xl mt-2 text-gray-400">
              {nickname || "닉네임 정보가 없습니다."}
            </div>
          )}
        </div>

        {/* 하단 버튼 및 안내 */}
        {userData?.verified ? (
          <button 
            onClick={handleSave}
            className="w-full bg-orange-600 hover:bg-orange-500 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
          >
            프로필 업데이트 하기
          </button>
        ) : (
          <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl text-center">
            <p className="text-red-400 text-xs font-bold">인증되지 않은 계정입니다.</p>
            <p className="text-gray-500 text-[10px] mt-1">프로필 수정은 운영자 승인 후 가능합니다.</p>
          </div>
        )}
      </div>
    </main>
  )
}

function Badge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
      active 
      ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
      : 'border-gray-800 text-gray-700 bg-transparent'
    }`}>
      <span className="mr-1">{active ? '✓' : '○'}</span> {label}
    </div>
  )
}