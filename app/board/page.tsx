import type { Metadata } from 'next'
import BoardList from './BoardList'
import { parseFirestoreDoc, FIREBASE_PROJECT_ID, FIREBASE_API_KEY } from '@/lib/firestore-rest'

// ISR: 5분마다 서버 HTML 갱신 (크롤러가 보는 캐시)
export const revalidate = 300

export const metadata: Metadata = {
  title: '자유게시판',
  description: '메이플스토리·메이플랜드·메이플플래닛 유저들의 자유로운 소통 공간. 게임 공략, 질문 답변, 팁과 노하우를 공유하세요.',
  openGraph: {
    url: '/board',
    title: '자유게시판',
    description: '메이플스토리·메이플랜드·메이플플래닛 유저들의 자유로운 소통 공간. 게임 공략, 질문 답변, 팁과 노하우를 공유하세요.',
  },
}

interface Post {
  id: string
  title: string
  content: string
  authorUid: string
  authorName: string
  isGuest: boolean
  isAdminPost?: boolean
  imageUrls?: string[]
  pinned?: boolean
  viewCount?: number
  likeCount?: number
  createdAt?: string
  date: string
}

async function getInitialPosts(): Promise<Post[]> {
  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)` +
      `/documents/board_posts?key=${FIREBASE_API_KEY}` +
      `&orderBy=createdAt%20desc&pageSize=20`

    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []

    const data = await res.json()
    return (data.documents || []).map((doc: any) => {
      const id = doc.name.split('/').pop()
      return parseFirestoreDoc(id, doc.fields)
    })
  } catch {
    return []
  }
}

export default async function BoardPage() {
  const initialPosts = await getInitialPosts()
  return <BoardList initialPosts={initialPosts} />
}
