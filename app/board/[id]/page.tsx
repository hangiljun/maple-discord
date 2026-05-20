"use client"
import dynamic from "next/dynamic"
const PostContent = dynamic(() => import("./PostContent"), { ssr: false })
export default function BoardPostPage() { return <PostContent /> }
