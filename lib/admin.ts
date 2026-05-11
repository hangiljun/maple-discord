import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function isAdmin(uid: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "admin", uid))
    return snap.exists()
  } catch {
    return false
  }
}
