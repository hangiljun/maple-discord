"use client"
import { useState } from "react"
import { auth } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
        alert("회원가입 성공!")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        alert("로그인 성공!")
      }
      router.push("/")
    } catch (error: any) {
      console.error("Firebase 상세 에러:", error)
      // 네트워크 에러일 경우 구체적인 안내
      if (error.code === 'auth/network-request-failed') {
        alert("네트워크 연결이 불안정하거나 Firebase에서 해당 도메인을 차단했습니다. 승인된 도메인 설정을 확인해주세요.")
      } else {
        alert("에러: " + error.message)
      }
    }
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-8 bg-gray-800 rounded-xl border border-gray-700 text-white">
      <h1 className="text-2xl font-bold mb-6 text-center text-orange-500">
        {isRegister ? "회원가입" : "로그인"}
      </h1>
      <form onSubmit={handleAuth} className="space-y-4">
        <input 
          type="email" placeholder="이메일" className="w-full bg-gray-900 border border-gray-600 p-3 rounded"
          value={email} onChange={(e) => setEmail(e.target.value)} required 
        />
        <input 
          type="password" placeholder="비밀번호" className="w-full bg-gray-900 border border-gray-600 p-3 rounded"
          value={password} onChange={(e) => setPassword(e.target.value)} required 
        />
        <button className="w-full bg-orange-600 font-bold py-3 rounded">
          {isRegister ? "지금 가입하기" : "로그인하기"}
        </button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} className="w-full mt-4 text-sm text-gray-400">
        {isRegister ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 회원가입"}
      </button>
    </main>
  )
}