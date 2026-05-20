"use client"
import dynamic from "next/dynamic"
const BoardContent = dynamic(() => import("./BoardContent"), { ssr: false })
export default function BoardPage() { return <BoardContent /> }
