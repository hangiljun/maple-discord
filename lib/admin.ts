import { db } from "@/lib/firebase"
import {
  doc, getDoc, setDoc, deleteDoc,
  collection, addDoc, serverTimestamp, Timestamp
} from "firebase/firestore"

// 관리자 여부 확인
export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "admins", uid))
    return snap.exists()
  } catch {
    return false
  }
}

// 채팅 메시지 삭제
export async function deleteMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, "chats", messageId))
}

// 영구 차단
export async function banUser(
  targetUid: string,
  adminUid: string,
  reason: string
): Promise<void> {
  await setDoc(doc(db, "banned_users", targetUid), {
    uid: targetUid,
    reason,
    bannedAt: serverTimestamp(),
    bannedBy: adminUid
  })
}

// 영구 차단 해제
export async function unbanUser(targetUid: string): Promise<void> {
  await deleteDoc(doc(db, "banned_users", targetUid))
}

// 차단 여부 확인
export async function isBanned(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "banned_users", uid))
    return snap.exists()
  } catch {
    return false
  }
}

// 일시 추방 (N시간)
export async function muteUser(
  targetUid: string,
  adminUid: string,
  hours: number,
  reason: string
): Promise<void> {
  const mutedUntil = new Date(Date.now() + hours * 60 * 60 * 1000)
  await setDoc(doc(db, "muted_users", targetUid), {
    uid: targetUid,
    mutedUntil: Timestamp.fromDate(mutedUntil),
    reason,
    mutedBy: adminUid
  })
}

// 일시 추방 여부 확인 (시간 지났으면 자동 해제)
export async function getMuteStatus(uid: string): Promise<{ muted: boolean; until?: Date }> {
  try {
    const snap = await getDoc(doc(db, "muted_users", uid))
    if (!snap.exists()) return { muted: false }
    const data = snap.data()
    const until: Date = data.mutedUntil.toDate()
    if (until < new Date()) {
      // 시간 지났으면 자동 삭제
      await deleteDoc(doc(db, "muted_users", uid))
      return { muted: false }
    }
    return { muted: true, until }
  } catch {
    return { muted: false }
  }
}

// 경고 메시지 전송 (chats에 시스템 메시지로 추가)
export async function sendWarning(
  targetUid: string,
  targetName: string,
  adminUid: string,
  reason: string,
  room: string
): Promise<void> {
  await addDoc(collection(db, "chats"), {
    text: `⚠️ [관리자 경고] ${targetName}님: ${reason}`,
    createdAt: serverTimestamp(),
    clientTime: Date.now(),
    room,
    msgType: "일반",
    isGuest: false,
    isSystem: true,                // 시스템 메시지 구분
    uid: adminUid,
    displayName: "🛡️ 관리자",
  })
}