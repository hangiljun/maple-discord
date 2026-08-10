import { Metadata } from "next"
import { notFound } from "next/navigation"
import PostClient from "./PostClient"
import { parseFirestoreDoc, FIREBASE_PROJECT_ID, FIREBASE_API_KEY } from "@/lib/firestore-rest"

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

async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/board_posts/${id}?key=${FIREBASE_API_KEY}`,
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
    alternates: { canonical: `https://www.maplediscord.com/board/${id}` },
    openGraph: {
      title: post.title,
      description,
      url: `https://www.maplediscord.com/board/${id}`,
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
