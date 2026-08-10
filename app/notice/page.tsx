import type { Metadata } from 'next'
import NoticeList from './NoticeList'
import { parseFirestoreDoc, FIREBASE_PROJECT_ID, FIREBASE_API_KEY } from '@/lib/firestore-rest'

// ISR: 5분마다 서버 HTML 갱신 (크롤러가 보는 캐시)
export const revalidate = 300

export const metadata: Metadata = {
  title: '공지사항',
  description: '메이플스토리·메이플랜드·메이플플래닛 패치노트, 업데이트 공지, 이벤트 정보를 가장 빠르게 확인하세요.',
  openGraph: {
    url: '/notice',
    title: '공지사항',
    description: '메이플스토리·메이플랜드·메이플플래닛 패치노트, 업데이트 공지, 이벤트 정보를 가장 빠르게 확인하세요.',
  },
}

type SavedBlock = { type: "text"; value: string } | { type: "image"; url: string }

interface Notice {
  id: string
  title: string
  category: "패치노트" | "변경사항" | "공지"
  thumbnailUrl?: string
  blocks?: SavedBlock[]
  content?: string
  imageUrls?: string[]
  imageUrl?: string
  createdAt?: string
  date: string
  authorUid?: string
  pinned?: boolean
}

async function getInitialNotices(): Promise<Notice[]> {
  try {
    const url =
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)` +
      `/documents/notices?key=${FIREBASE_API_KEY}` +
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

export default async function NoticePage() {
  const initialNotices = await getInitialNotices()
  return <NoticeList initialNotices={initialNotices} />
}
