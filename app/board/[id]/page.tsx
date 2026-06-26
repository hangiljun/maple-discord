import { Metadata } from "next"
import { notFound } from "next/navigation"
import PostClient from "./PostClient"

const PROJECT_ID = "maplediscord-cfc6a"
const API_KEY = "AIzaSyDn72fWR9UcseyGgK3uefx66f7o9Bv2t9A"

interface Post {
  id: string
  title: string
  content: string
  authorUid: string
  authorName: string
  isGuest: boolean
  isAdminPost?: boolean
  imageUrls?: string[]
  viewCount?: number
  likeCount?: number
  likedBy?: string[]
  createdAt?: string
  date: string
}

function parseFirestoreDoc(id: string, fields: any): Post {
  function parseValue(v: any): any {
    if (!v) return null
    if (v.stringValue !== undefined) return v.stringValue
    if (v.integerValue !== undefined) return Number(v.integerValue)
    if (v.booleanValue !== undefined) return v.booleanValue
    if (v.timestampValue !== undefined) return v.timestampValue
    if (v.arrayValue) return (v.arrayValue.values || []).map(parseValue)
    if (v.mapValue) {
      const obj: any = {}
      for (const k in v.mapValue.fields) obj[k] = parseValue(v.mapValue.fields[k])
      return obj
    }
    return null
  }

  const data: any = {}
  for (const key in fields) data[key] = parseValue(fields[key])

  const ts = data.createdAt
  const date = ts
    ? new Date(ts).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : ""

  return { id, ...data, date }
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/board_posts/${id}?key=${API_KEY}`,
      { next: { revalidate: 0 }, cache: 'no-store' }
    )
    if (!res.ok) return null
    const json = await res.json()
    if (!json.fields) return null
    return parseFirestoreDoc(id, json.fields)
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    return { title: "게시글을 찾을 수 없어요" }
  }

  const description = post.content.slice(0, 150) || "메이플디스코드 자유게시판"
  const author = post.isGuest ? `비회원 · ${post.authorName}` : post.authorName

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      authors: [author],
    },
  }
}

export default async function BoardPostPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return <PostClient initialPost={post} postId={id} />
}
