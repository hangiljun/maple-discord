import { db } from "@/lib/firebase"
import {
  doc, setDoc, getDoc, collection, addDoc,
  serverTimestamp, updateDoc, query, where,
  orderBy, getDocs
} from "firebase/firestore"

// 두 uid로 고유한 chatId 생성 (항상 동일한 ID)
export function getDMChatId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_")
}

// DM 방 생성 또는 기존 방 가져오기
export async function getOrCreateDMRoom(
  uid1: string, name1: string,
  uid2: string, name2: string
) {
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
      unread: { [uid1]: 0, [uid2]: 0 }
    })
  }
  return chatId
}

// 메시지 전송
export async function sendDMMessage(
  chatId: string,
  senderUid: string,
  senderName: string,
  text: string,
  otherUid: string
) {
  // 메시지 추가
  await addDoc(collection(db, "dm_rooms", chatId, "messages"), {
    text,
    senderUid,
    senderName,
    createdAt: serverTimestamp(),
    clientTime: Date.now(),
  })

  // 방 정보 업데이트 (lastMessage + 상대방 unread +1)
  await updateDoc(doc(db, "dm_rooms", chatId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unread.${otherUid}`]: (await getDoc(doc(db, "dm_rooms", chatId)))
      .data()?.unread?.[otherUid] + 1 || 1
  })
}

// 읽음 처리
export async function markAsRead(chatId: string, uid: string) {
  await updateDoc(doc(db, "dm_rooms", chatId), {
    [`unread.${uid}`]: 0
  })
}