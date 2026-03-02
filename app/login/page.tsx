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
        alert("회원가입 성공! 환영합니다.")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        alert("로그인 성공!")
      }
      router.push("/")
    } catch (error: any) {
      console.error("Firebase Error:", error.code)
      
      // 사용자 친절 에러 메시지 처리
      if (error.code === 'auth/invalid-credential') {
        alert("이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.")
      } else if (error.code === 'auth/email-already-in-use') {
        alert("이미 사용 중인 이메일입니다.")
      } else if (error.code === 'auth/weak-password') {
        alert("비밀번호는 최소 6자리 이상이어야 합니다.")
      } else if (error.code === 'auth/network-request-failed') {
        alert("네트워크 연결을 확인해주세요.")
      } else {
        alert("에러 발생: " + error.message)
      }
    }
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-8 bg-[#1e1e1e] rounded-2xl border border-gray-700 shadow-2xl text-white">
      <h1 className="text-2xl font-bold mb-8 text-center text-orange-500">
        {isRegister ? "회원가입" : "로그인"}
      </h1>
      
      <form onSubmit={handleAuth} className="space-y-5">
        <div>
          <label className="block text-sm mb-2 text-gray-400">이메일</label>
          <input 
            type="email" 
            className="w-full bg-black border border-gray-600 p-3 rounded-lg outline-none focus:border-orange-500 transition"
            placeholder="example@email.com"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label className="block text-sm mb-2 text-gray-400">비밀번호</label>
          <input 
            type="password" 
            className="w-full bg-black border border-gray-600 p-3 rounded-lg outline-none focus:border-orange-500 transition"
            placeholder="6자리 이상"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button className="w-full bg-orange-600 hover:bg-orange-500 font-bold py-3 rounded-lg transition-all active:scale-95 shadow-lg">
          {isRegister ? "지금 가입하기" : "로그인하기"}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-gray-800">
        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-gray-400 hover:text-orange-400 underline underline-offset-4"
        >
          {isRegister ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
        </button>
      </div>
    </main>
  )
}