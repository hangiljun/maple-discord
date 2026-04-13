import { NextRequest, NextResponse } from "next/server"
import { fetchCharacter } from "@/lib/maple"

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim()
  if (!name) {
    return NextResponse.json({ error: "캐릭터 이름이 필요합니다" }, { status: 400 })
  }

  const data = await fetchCharacter(name)
  if (!data) {
    return NextResponse.json({ error: "캐릭터를 찾을 수 없습니다" }, { status: 404 })
  }

  return NextResponse.json(data)
}
