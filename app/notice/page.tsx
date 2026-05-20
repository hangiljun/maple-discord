"use client"
import dynamic from "next/dynamic"
const NoticeContent = dynamic(() => import("./NoticeContent"), { ssr: false })
export default function NoticePage() { return <NoticeContent /> }
