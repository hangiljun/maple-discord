const BASE = "https://open.api.nexon.com"

async function nexonFetch(path: string) {
  const key = process.env.NEXON_API_KEY
  if (!key) return null
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "x-nxopen-api-key": key },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getOcid(name: string): Promise<string | null> {
  const data = await nexonFetch(`/maplestory/v1/id?character_name=${encodeURIComponent(name)}`)
  return data?.ocid ?? null
}

export interface CharacterBasic {
  character_name: string
  world_name: string
  character_class: string
  character_class_level: string
  character_level: number
  character_exp: number
  character_exp_rate: string
  character_guild_name: string
  character_image: string
  character_date_create: string
}

export interface StatItem {
  stat_name: string
  stat_value: string
}

export interface CharacterData {
  basic: CharacterBasic
  stats: StatItem[]
}

export const MAIN_STATS   = ["STR", "DEX", "INT", "LUK"]
export const BATTLE_STATS = ["HP", "MP", "공격력", "마력"]
export const DETAIL_STATS = ["보스 몬스터 데미지", "방어율 무시", "크리티컬 확률", "크리티컬 데미지", "방어력"]

export async function fetchCharacter(name: string): Promise<CharacterData | null> {
  if (!name?.trim()) return null
  const ocid = await getOcid(name)
  if (!ocid) return null

  const [basic, statData] = await Promise.all([
    nexonFetch(`/maplestory/v1/character/basic?ocid=${ocid}`),
    nexonFetch(`/maplestory/v1/character/stat?ocid=${ocid}`),
  ])
  if (!basic) return null

  return {
    basic: {
      character_name:    basic.character_name     ?? name,
      world_name:        basic.world_name         ?? "",
      character_class:   basic.character_class    ?? "",
      character_class_level: basic.character_class_level ?? "",
      character_level:   basic.character_level    ?? 0,
      character_exp:     basic.character_exp      ?? 0,
      character_exp_rate: basic.character_exp_rate ?? "0",
      character_guild_name: basic.character_guild_name ?? "",
      character_image:   basic.character_image    ?? "",
      character_date_create: basic.character_date_create ?? "",
    },
    stats: statData?.final_stat ?? [],
  }
}

export interface BattlePracticeSkill {
  skillName: string
  damage: number
  damagePercent: string
  dps: number
  useCount: number
  maxDamage: number
}

export interface BattlePracticeData {
  registerDate: string
  totalPlayTimeMs: number
  totalDamage: number
  totalDps: number
  endType: string
  likeCount: number
  skillStatistic: BattlePracticeSkill[]
}

export async function fetchBattlePractice(name: string): Promise<BattlePracticeData | null> {
  const ocid = await getOcid(name)
  if (!ocid) return null

  const replayData = await nexonFetch(`/maplestory/v1/battle-practice/replay-id?ocid=${ocid}`)
  if (!replayData?.replay_id) return null

  const result = await nexonFetch(`/maplestory/v1/battle-practice/result?replay_id=${replayData.replay_id}`)
  if (!result) return null

  return {
    registerDate:    replayData.register_date ?? "",
    totalPlayTimeMs: result.total_play_time   ?? 0,
    totalDamage:     result.total_damage      ?? 0,
    totalDps:        result.total_dps         ?? 0,
    endType:         result.end_type          ?? "",
    likeCount:       result.like_count        ?? 0,
    skillStatistic:  (result.skill_statistic ?? []).map((s: any) => ({
      skillName:     s.skill_name     ?? "",
      damage:        s.damage         ?? 0,
      damagePercent: s.damage_percent ?? "0",
      dps:           s.dps            ?? 0,
      useCount:      s.use_count      ?? 0,
      maxDamage:     s.max_damage     ?? 0,
    })),
  }
}
