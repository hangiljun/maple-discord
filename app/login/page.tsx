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
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* 로고 */}
        <div className="text-center mb-8">
          <span className="text-3xl">🍁</span>
          <h1 className="text-xl font-bold text-[#191F28] mt-2">
            {isRegister ? "회원가입" : "로그인"}
          </h1>
          <p className="text-sm text-[#8B95A1] mt-1">
            {isRegister ? "새로운 계정을 만들고 커뮤니티에 참여하세요." : "등록된 계정으로 로그인하세요."}
          </p>
        </div>

        <div className="bg-white border border-[#E5E8EB] rounded-2xl p-6 space-y-4">
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4E5968] mb-1.5">이메일 주소</label>
              <input
                type="email"
                className="w-full border border-[#E5E8EB] p-3.5 rounded-xl outline-none focus:border-[#3182F6] text-[#191F28] text-sm placeholder:text-[#B0B8C1] transition-colors"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4E5968] mb-1.5">비밀번호</label>
              <input
                type="password"
                className="w-full border border-[#E5E8EB] p-3.5 rounded-xl outline-none focus:border-[#3182F6] text-[#191F28] text-sm placeholder:text-[#B0B8C1] transition-colors"
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
                  className="w-4 h-4 accent-[#3182F6] cursor-pointer"
                />
                <span className="text-sm text-[#4E5968]">아이디 저장</span>
              </label>
            )}

            <button
              disabled={loading}
              className="w-full bg-[#3182F6] hover:bg-[#1C6EE8] disabled:bg-[#E5E8EB] disabled:text-[#8B95A1] text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
            >
              {loading ? "처리 중..." : (isRegister ? "가입하기" : "로그인하기")}
            </button>
          </form>

          <div className="pt-2 border-t border-[#E5E8EB] text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-[#8B95A1] hover:text-[#3182F6] transition-colors"
            >
              {isRegister ? "이미 계정이 있으신가요? 로그인" : "처음이신가요? 회원가입"}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
