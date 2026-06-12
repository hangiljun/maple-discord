"use client"
import { createContext, useContext, useState, useEffect } from "react"

type Lang = "ko" | "en"

const LanguageContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: "ko", setLang: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ko")

  useEffect(() => {
    const saved = localStorage.getItem("maple_lang") as Lang | null
    if (saved === "ko" || saved === "en") setLang(saved)
  }, [])

  const handleSet = (l: Lang) => {
    setLang(l)
    localStorage.setItem("maple_lang", l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSet }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
