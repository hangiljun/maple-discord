"use client"
import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberEmail, setRememberEmail] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("maple_saved_email")
    if (saved) {
      setEmail(saved)
      setRememberEmail(true)
    }
  }, [])

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          verified: false,
          createdAt: serverTimestamp(),
          role: "user"
        })
        alert("회원가입이 완료되었습니다! 운영자 확인 후 인증 마크가 부여됩니다.")
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        if (rememberEmail) {
          localStorage.setItem("maple_saved_email", email)
        } else {
          localStorage.removeItem("maple_saved_email")
        }
      }
      router.push("/")
    } catch (error: any) {
      console.error("Auth Error:", error.code)
      if (error.code === 'auth/invalid-credential') {
        alert("이메일 또는 비밀번호가 올바르지 않습니다.")
      } else if (error.code === 'auth/email-already-in-use') {
        alert("이미 사용 중인 이메일입니다.")
      } else if (error.code === 'auth/weak-password') {
        alert("비밀번호는 6자리 이상이어야 합니다.")
      } else if (error.code === 'auth/network-request-failed') {
        alert("네트워크 연결 에러입니다. 도메인 설정을 확인해주세요.")
      } else {
        alert("오류 발생: " + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto mt-20 p-8 bg-[#1e1e1e] rounded-2xl border border-gray-700 shadow-2xl text-white">
      <h1 className="text-3xl font-bold mb-2 text-center text-[#60A5FA]">
        {isRegister ? "회원가입" : "로그인"}
      </h1>
      <p className="text-center text-sm text-gray-500 mb-10">
        {isRegister ? "새로운 계정을 만들고 커뮤니티에 참여하세요." : "등록된 계정으로 로그인하세요."}
      </p>

      <form onSubmit={handleAuth} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">이메일 주소</label>
          <input
            type="email"
            className="w-full bg-black border border-gray-600 p-4 rounded-xl outline-none focus:border-[#1B6FDC] focus:ring-1 focus:ring-[#1B6FDC] transition"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-400">비밀번호</label>
          <input
            type="password"
            className="w-full bg-black border border-gray-600 p-4 rounded-xl outline-none focus:border-[#1B6FDC] focus:ring-1 focus:ring-[#1B6FDC] transition"
            placeholder="6자리 이상 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {!isRegister && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(e) => setRememberEmail(e.target.checked)}
              className="w-4 h-4 accent-[#1B6FDC] cursor-pointer"
            />
            <span className="text-sm text-gray-400 font-medium">아이디 저장</span>
          </label>
        )}

        <button
          disabled={loading}
          className="w-full bg-[#1B6FDC] hover:bg-[#1558B0] disabled:bg-gray-700 font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg text-lg"
        >
          {loading ? "처리 중..." : (isRegister ? "지금 가입하기" : "로그인하기")}
        </button>
      </form>

      <div className="mt-10 text-center pt-6 border-t border-gray-800">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-gray-400 hover:text-[#60A5FA] underline underline-offset-4 transition"
        >
          {isRegister ? "이미 아이디가 있으신가요? 로그인" : "처음이신가요? 3초만에 회원가입"}
        </button>
      </div>
    </main>
  )
}
