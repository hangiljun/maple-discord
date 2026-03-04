import { db } from "@/lib/firebase"
import {
  doc, setDoc, getDoc, collection, addDoc,
  serverTimestamp, updateDoc, increment
} from "firebase/firestore"

// ── 비회원 uid 영구 저장 (localStorage) ──────────────────
export function getOrCreateGuestUid(): string {
  if (typeof window === "undefined") return "guest_ssr"
  const saved = localStorage.getItem("maple_guest_uid")
  if (saved) return saved
  const newUid = "guest_" + Math.random().toString(36).substring(2, 9)
  localStorage.setItem("maple_guest_uid", newUid)
  return newUid
}

// ── 두 uid로 고유한 chatId 생성 ───────────────────────────
export function getDMChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("__")
}

// ── DM 방 생성 또는 기존 방 가져오기 ─────────────────────
export async function getOrCreateDMRoom(
  uid1: string, name1: string,
  uid2: string, name2: string
): Promise<string> {
  const chatId = getDMChatId(uid1, uid2)
  const roomRef = doc(db, "dm_rooms", chatId)
  const snap = await getDoc(roomRef)

  if (!snap.exists()) {
    await setDoc(roomRef, {
      participants: [uid1, uid2],
      participantNames: { [uid1]: name1, [uid2]: name2 },
      lastMessage: "",
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      unread: { [uid1]: 0, [uid2]: 0 },
      // 비회원 여부 표시
      guestParticipants: [
        ...(uid1.startsWith("guest_") ? [uid1] : []),
        ...(uid2.startsWith("guest_") ? [uid2] : []),
      ]
    })
    // 새 방 생성 시 안전 거래 안내 시스템 메시지 자동 전송
    await addDoc(collection(db, "dm_rooms", chatId, "messages"), {
      text: "📌 안전한 거래를 위해 안내드립니다.\n• 상대방과 핸드폰 번호를 꼭 교환하세요\n• 게임 내에서 만나서 거래하세요",
      senderUid: "system",
      senderName: "📢 공지",
      isSystem: true,
      createdAt: serverTimestamp(),
      clientTime: Date.now(),
    })
  } else {
    // 닉네임이 바뀌었을 경우 업데이트
    const data = snap.data()
    const updates: Record<string, any> = {}
    if (data.participantNames?.[uid1] !== name1) updates[`participantNames.${uid1}`] = name1
    if (data.participantNames?.[uid2] !== name2) updates[`participantNames.${uid2}`] = name2
    if (Object.keys(updates).length > 0) {
      await updateDoc(roomRef, updates)
    }
  }
  return chatId
}

// ── 메시지 전송 ───────────────────────────────────────────
export async function sendDMMessage(
  chatId: string,
  senderUid: string,
  senderName: string,
  text: string,
  otherUid: string
): Promise<void> {
  // 메시지 서브컬렉션에 추가
  await addDoc(collection(db, "dm_rooms", chatId, "messages"), {
    text,
    senderUid,
    senderName,
    createdAt: serverTimestamp(),
    clientTime: Date.now(),
  })

  // 방 정보 업데이트 - increment로 버그 없이 unread +1
  await updateDoc(doc(db, "dm_rooms", chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unread.${otherUid}`]: increment(1),  // ← 기존 코드 버그 수정
  })
}

// ── 읽음 처리 ─────────────────────────────────────────────
export async function markAsRead(chatId: string, uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, "dm_rooms", chatId), {
      [`unread.${uid}`]: 0
    })
  } catch (e) {
    // 방이 없거나 권한 없으면 무시
    console.warn("markAsRead 실패:", e)
  }
}