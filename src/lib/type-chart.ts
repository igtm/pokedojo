export const pokemonTypes = [
  { id: 'normal', label: 'ノーマル' },
  { id: 'fire', label: 'ほのお' },
  { id: 'water', label: 'みず' },
  { id: 'electric', label: 'でんき' },
  { id: 'grass', label: 'くさ' },
  { id: 'ice', label: 'こおり' },
  { id: 'fighting', label: 'かくとう' },
  { id: 'poison', label: 'どく' },
  { id: 'ground', label: 'じめん' },
  { id: 'flying', label: 'ひこう' },
  { id: 'psychic', label: 'エスパー' },
  { id: 'bug', label: 'むし' },
  { id: 'rock', label: 'いわ' },
  { id: 'ghost', label: 'ゴースト' },
  { id: 'dragon', label: 'ドラゴン' },
  { id: 'dark', label: 'あく' },
  { id: 'steel', label: 'はがね' },
  { id: 'fairy', label: 'フェアリー' },
] as const

export type PokemonType = (typeof pokemonTypes)[number]['id']

export const typeLabels = Object.fromEntries(
  pokemonTypes.map((type) => [type.id, type.label]),
) as Record<PokemonType, string>

const chart: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

export function getEffectiveness(attackType: PokemonType, defenseType: PokemonType): number {
  return chart[attackType][defenseType] ?? 1
}

export function normalizeDefenseTypes(defenseTypes: Array<PokemonType | '' | undefined>): PokemonType[] {
  const uniqueTypes: PokemonType[] = []

  for (const defenseType of defenseTypes) {
    if (!defenseType || uniqueTypes.includes(defenseType)) continue
    uniqueTypes.push(defenseType)
  }

  return uniqueTypes
}

export function calculateMatchup(
  attackType: PokemonType,
  defenseTypes: Array<PokemonType | '' | undefined>,
): number {
  return normalizeDefenseTypes(defenseTypes)
    .reduce((total, defenseType) => total * getEffectiveness(attackType, defenseType), 1)
}

export function formatMultiplier(multiplier: number): string {
  if (multiplier === 0) return '0倍'
  if (multiplier === 0.25) return '1/4倍'
  if (multiplier === 0.5) return '1/2倍'
  return `${multiplier}倍`
}

export function explainMultiplier(multiplier: number): string {
  if (multiplier === 0) return '無効。相手に通りません。'
  if (multiplier < 1) return '半減以下。押し切るには補助や交代読みが必要です。'
  if (multiplier === 1) return '等倍。タイプだけでは有利不利が決まりません。'
  if (multiplier === 2) return '弱点。相手を崩す候補になります。'
  return '4倍弱点。通せるなら大きな圧力になります。'
}

export function typeName(type: PokemonType | '' | undefined): string {
  if (!type) return 'なし'
  return typeLabels[type]
}

export interface TeamSlot {
  name: string
  type1: PokemonType | ''
  type2: PokemonType | ''
}

export interface CoverageRow {
  attackType: PokemonType
  weak: number
  resist: number
  immune: number
  neutral: number
}

export function analyzeCoverage(slots: TeamSlot[]): CoverageRow[] {
  const activeSlots = slots.filter((slot) => slot.type1)

  return pokemonTypes.map(({ id }) => {
    const multipliers = activeSlots.map((slot) => calculateMatchup(id, [slot.type1, slot.type2]))
    return {
      attackType: id,
      weak: multipliers.filter((value) => value > 1).length,
      resist: multipliers.filter((value) => value > 0 && value < 1).length,
      immune: multipliers.filter((value) => value === 0).length,
      neutral: multipliers.filter((value) => value === 1).length,
    }
  })
}
