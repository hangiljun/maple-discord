// Firestore REST API 유틸리티 (서버 컴포넌트 전용)

export const FIREBASE_PROJECT_ID = "maplediscord-cfc6a"
export const FIREBASE_API_KEY = "AIzaSyDn72fWR9UcseyGgK3uefx66f7o9Bv2t9A"

/**
 * Firestore REST API 응답 파싱 헬퍼
 * {fields: {title: {stringValue: "..."}}} → {title: "..."}
 */
export function parseFirestoreDoc(id: string, fields: any): any {
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
