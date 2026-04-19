import { For, Show, createEffect, createMemo, createSignal, onMount } from 'solid-js'
import {
  calculateMatchup,
  formatMultiplier,
  pokemonTypes,
  type PokemonType,
} from '../../lib/type-chart'

type DamageCategory = 'physical' | 'special'
type Weather = 'none' | 'sun' | 'rain'
type Terrain = 'none' | 'electric' | 'grassy' | 'psychic' | 'misty'

interface CalcTab {
  id: string
  name: string
  attackerName: string
  defenderName: string
  moveName: string
  level: number
  category: DamageCategory
  movePower: number
  moveType: PokemonType
  attackerType1: PokemonType | ''
  attackerType2: PokemonType | ''
  teraType: PokemonType | ''
  attackerBaseAtk: number
  attackerBaseSpa: number
  attackerEv: number
  attackerNature: number
  attackerStage: number
  defenderType1: PokemonType | ''
  defenderType2: PokemonType | ''
  defenderBaseHp: number
  defenderBaseDef: number
  defenderBaseSpd: number
  defenderHpEv: number
  defenderEv: number
  defenderNature: number
  defenderStage: number
  hpPercent: number
  weather: Weather
  terrain: Terrain
  isBurned: boolean
  ignoreBurn: boolean
  isSpread: boolean
  isCritical: boolean
  isScreen: boolean
  otherModifier: number
  stealthRock: boolean
  spikeLayers: number
  grounded: boolean
  fixedChip: number
}

interface DamageResult {
  tab: CalcTab
  attackerStat: number
  defenderStat: number
  hp: number
  currentHp: number
  requiredHp: number
  chipDamage: number
  hazardDamage: number
  fixedChip: number
  typeEffectiveness: number
  stab: number
  totalModifier: number
  min: number
  max: number
  minPercent: number
  maxPercent: number
  rolls: number[]
  koText: string
  rollKOs: number
}

interface HistoryEntry {
  id: string
  createdAt: string
  label: string
  detail: string
  min: number
  max: number
  minPercent: number
  maxPercent: number
  koText: string
  checked: boolean
  tab: CalcTab
}

const rollFactors = [85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100]
const historyKey = 'pokedojo-damage-history-v1'

const presets: Array<{ label: string; patch: Partial<CalcTab> }> = [
  {
    label: '物理弱点: ガブリアスのじしん',
    patch: {
      name: 'じしん確認',
      attackerName: 'ガブリアス',
      defenderName: 'ヒードラン',
      moveName: 'じしん',
      category: 'physical',
      movePower: 100,
      moveType: 'ground',
      attackerType1: 'dragon',
      attackerType2: 'ground',
      attackerBaseAtk: 130,
      attackerBaseSpa: 80,
      defenderType1: 'fire',
      defenderType2: 'steel',
      defenderBaseHp: 91,
      defenderBaseDef: 106,
      defenderBaseSpd: 106,
    },
  },
  {
    label: '特殊4倍: 10まんボルト',
    patch: {
      name: '4倍確認',
      attackerName: 'ピカチュウ',
      defenderName: 'ギャラドス',
      moveName: '10まんボルト',
      category: 'special',
      movePower: 90,
      moveType: 'electric',
      attackerType1: 'electric',
      attackerType2: '',
      attackerBaseAtk: 55,
      attackerBaseSpa: 50,
      defenderType1: 'water',
      defenderType2: 'flying',
      defenderBaseHp: 95,
      defenderBaseDef: 79,
      defenderBaseSpd: 100,
    },
  },
  {
    label: '先制技: しんそく圏内',
    patch: {
      name: '終盤確認',
      attackerName: 'カイリュー',
      defenderName: 'パオジアン',
      moveName: 'しんそく',
      category: 'physical',
      movePower: 80,
      moveType: 'normal',
      attackerType1: 'dragon',
      attackerType2: 'flying',
      attackerBaseAtk: 134,
      attackerBaseSpa: 100,
      defenderType1: 'dark',
      defenderType2: 'ice',
      defenderBaseHp: 80,
      defenderBaseDef: 80,
      defenderBaseSpd: 65,
      hpPercent: 55,
    },
  },
]

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.floor(value)))
}

function clampDecimal(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function createDefaultTab(name = '計算1'): CalcTab {
  return {
    id: createId('calc'),
    name,
    attackerName: '攻撃側',
    defenderName: '防御側',
    moveName: '技',
    level: 50,
    category: 'physical',
    movePower: 80,
    moveType: 'fire',
    attackerType1: 'fire',
    attackerType2: '',
    teraType: '',
    attackerBaseAtk: 100,
    attackerBaseSpa: 100,
    attackerEv: 252,
    attackerNature: 1.1,
    attackerStage: 0,
    defenderType1: 'grass',
    defenderType2: '',
    defenderBaseHp: 100,
    defenderBaseDef: 100,
    defenderBaseSpd: 100,
    defenderHpEv: 252,
    defenderEv: 0,
    defenderNature: 1,
    defenderStage: 0,
    hpPercent: 100,
    weather: 'none',
    terrain: 'none',
    isBurned: false,
    ignoreBurn: false,
    isSpread: false,
    isCritical: false,
    isScreen: false,
    otherModifier: 1,
    stealthRock: false,
    spikeLayers: 0,
    grounded: true,
    fixedChip: 0,
  }
}

function hpStat(base: number, ev: number, level: number): number {
  return Math.floor(((2 * base + 31 + Math.floor(ev / 4)) * level) / 100) + level + 10
}

function battleStat(base: number, ev: number, level: number, nature: number): number {
  const raw = Math.floor(((2 * base + 31 + Math.floor(ev / 4)) * level) / 100) + 5
  return Math.floor(raw * nature)
}

function stageMultiplier(stage: number): number {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage)
}

function stabModifier(tab: CalcTab): number {
  const hasOriginalStab = tab.attackerType1 === tab.moveType || tab.attackerType2 === tab.moveType

  if (tab.teraType && tab.teraType === tab.moveType) return hasOriginalStab ? 2 : 1.5
  return hasOriginalStab ? 1.5 : 1
}

function weatherModifier(tab: CalcTab): number {
  if (tab.weather === 'sun' && tab.moveType === 'fire') return 1.5
  if (tab.weather === 'sun' && tab.moveType === 'water') return 0.5
  if (tab.weather === 'rain' && tab.moveType === 'water') return 1.5
  if (tab.weather === 'rain' && tab.moveType === 'fire') return 0.5
  return 1
}

function terrainModifier(tab: CalcTab): number {
  if (tab.terrain === 'electric' && tab.moveType === 'electric') return 1.3
  if (tab.terrain === 'grassy' && tab.moveType === 'grass') return 1.3
  if (tab.terrain === 'psychic' && tab.moveType === 'psychic') return 1.3
  if (tab.terrain === 'misty' && tab.moveType === 'dragon') return 0.5
  return 1
}

function hazardPercent(tab: CalcTab): number {
  const rock = tab.stealthRock ? 12.5 * calculateMatchup('rock', [tab.defenderType1, tab.defenderType2]) : 0
  if (!tab.grounded) return rock

  const spikes = tab.spikeLayers === 1 ? 12.5 : tab.spikeLayers === 2 ? 100 / 6 : tab.spikeLayers === 3 ? 25 : 0
  return rock + spikes
}

function koText(rolls: number[], requiredHp: number): { text: string; rollKOs: number } {
  if (requiredHp <= 0) return { text: '設置技・固定ダメージで倒れる', rollKOs: 16 }

  const min = Math.min(...rolls)
  const max = Math.max(...rolls)
  const rollKOs = rolls.filter((damage) => damage >= requiredHp).length

  if (rollKOs === 16) return { text: '確定1発', rollKOs }
  if (rollKOs > 0) return { text: `乱数1発 ${rollKOs}/16`, rollKOs }
  if (min * 2 >= requiredHp) return { text: '確定2発', rollKOs }
  if (max * 2 >= requiredHp) return { text: '乱数2発', rollKOs }
  if (min * 3 >= requiredHp) return { text: '確定3発', rollKOs }
  if (max * 3 >= requiredHp) return { text: '乱数3発', rollKOs }
  return { text: '4発以上', rollKOs }
}

function calculateDamage(tab: CalcTab): DamageResult {
  const level = clamp(tab.level, 1, 100)
  const attackerBase = tab.category === 'physical' ? tab.attackerBaseAtk : tab.attackerBaseSpa
  const defenderBase = tab.category === 'physical' ? tab.defenderBaseDef : tab.defenderBaseSpd
  const rawAttack = battleStat(attackerBase, tab.attackerEv, level, tab.attackerNature)
  const rawDefense = battleStat(defenderBase, tab.defenderEv, level, tab.defenderNature)
  const attackerStage = tab.isCritical && tab.attackerStage < 0 ? 0 : tab.attackerStage
  const defenderStage = tab.isCritical && tab.defenderStage > 0 ? 0 : tab.defenderStage
  const attackerStat = Math.max(1, Math.floor(rawAttack * stageMultiplier(attackerStage)))
  const defenderStat = Math.max(1, Math.floor(rawDefense * stageMultiplier(defenderStage)))
  const hp = hpStat(tab.defenderBaseHp, tab.defenderHpEv, level)
  const typeEffectiveness = calculateMatchup(tab.moveType, [tab.defenderType1, tab.defenderType2])
  const burn = tab.category === 'physical' && tab.isBurned && !tab.ignoreBurn ? 0.5 : 1
  const screen = tab.isScreen ? 0.5 : 1
  const spread = tab.isSpread ? 0.75 : 1
  const critical = tab.isCritical ? 1.5 : 1
  const stab = stabModifier(tab)
  const totalModifier =
    stab *
    typeEffectiveness *
    weatherModifier(tab) *
    terrainModifier(tab) *
    burn *
    screen *
    spread *
    critical *
    tab.otherModifier
  const baseDamage =
    tab.movePower <= 0
      ? 0
      : Math.floor(Math.floor(Math.floor(((Math.floor((2 * level) / 5) + 2) * tab.movePower * attackerStat) / defenderStat) / 50) + 2)
  const rolls = rollFactors.map((roll) => Math.max(0, Math.floor(baseDamage * totalModifier * (roll / 100))))
  const currentHp = Math.max(1, Math.floor(hp * (tab.hpPercent / 100)))
  const hazardDamage = Math.floor(hp * (hazardPercent(tab) / 100))
  const fixedChip = Math.max(0, tab.fixedChip)
  const chipDamage = Math.min(currentHp, hazardDamage + fixedChip)
  const requiredHp = Math.max(0, currentHp - chipDamage)
  const min = Math.min(...rolls)
  const max = Math.max(...rolls)
  const ko = koText(rolls, requiredHp)

  return {
    tab,
    attackerStat,
    defenderStat,
    hp,
    currentHp,
    requiredHp,
    chipDamage,
    hazardDamage,
    fixedChip,
    typeEffectiveness,
    stab,
    totalModifier,
    min,
    max,
    minPercent: Math.round((min / hp) * 1000) / 10,
    maxPercent: Math.round((max / hp) * 1000) / 10,
    rolls,
    koText: ko.text,
    rollKOs: ko.rollKOs,
  }
}

function TypeSelect(props: {
  id: string
  label: string
  value: PokemonType | ''
  includeNone?: boolean
  onInput: (value: PokemonType | '') => void
}) {
  return (
    <label class="damage-field" for={props.id}>
      <span>{props.label}</span>
      <select
        id={props.id}
        class="dojo-select"
        value={props.value}
        onInput={(event) => props.onInput(event.currentTarget.value as PokemonType | '')}
      >
        <Show when={props.includeNone}>
          <option value="">なし</option>
        </Show>
        <For each={pokemonTypes}>{(type) => <option value={type.id}>{type.label}</option>}</For>
      </select>
    </label>
  )
}

function NumberField(props: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onInput: (value: number) => void
}) {
  return (
    <label class="damage-field" for={props.id}>
      <span>{props.label}</span>
      <div class="damage-field__inline">
        <input
          id={props.id}
          class="dojo-input"
          type="number"
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={props.value}
          onInput={(event) => props.onInput(Number(event.currentTarget.value))}
        />
        <Show when={props.suffix}>
          <small>{props.suffix}</small>
        </Show>
      </div>
    </label>
  )
}

export default function DamageCalcApp() {
  const firstTab = createDefaultTab()
  const [tabs, setTabs] = createSignal<CalcTab[]>([firstTab])
  const [activeId, setActiveId] = createSignal(firstTab.id)
  const [history, setHistory] = createSignal<HistoryEntry[]>([])
  const [historyLoaded, setHistoryLoaded] = createSignal(false)

  const activeTab = createMemo(() => tabs().find((tab) => tab.id === activeId()) ?? tabs()[0])
  const result = createMemo(() => calculateDamage(activeTab()))
  const selectedHistory = createMemo(() => history().filter((entry) => entry.checked))
  const selectedTotal = createMemo(() => {
    const entries = selectedHistory()
    return {
      min: entries.reduce((total, entry) => total + entry.min, 0),
      max: entries.reduce((total, entry) => total + entry.max, 0),
    }
  })

  onMount(() => {
    try {
      const stored = localStorage.getItem(historyKey)
      if (stored) setHistory(JSON.parse(stored) as HistoryEntry[])
    } catch {
      setHistory([])
    }
    setHistoryLoaded(true)
  })

  createEffect(() => {
    if (!historyLoaded()) return
    if (typeof localStorage === 'undefined') return

    localStorage.setItem(historyKey, JSON.stringify(history().slice(0, 30)))
  })

  const updateActive = (patch: Partial<CalcTab>) => {
    setTabs((current) => current.map((tab) => (tab.id === activeId() ? { ...tab, ...patch } : tab)))
  }

  const applyPreset = (patch: Partial<CalcTab>) => updateActive(patch)

  const duplicateTab = () => {
    const current = activeTab()
    const next = {
      ...current,
      id: createId('calc'),
      name: `計算${tabs().length + 1}`,
    }
    setTabs((currentTabs) => [...currentTabs, next])
    setActiveId(next.id)
  }

  const closeTab = (id: string) => {
    setTabs((current) => {
      if (current.length === 1) return current
      const next = current.filter((tab) => tab.id !== id)
      if (activeId() === id) setActiveId(next[0].id)
      return next
    })
  }

  const saveLog = () => {
    const current = result()
    const entry: HistoryEntry = {
      id: createId('history'),
      createdAt: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      label: `${current.tab.attackerName} ${current.tab.moveName} → ${current.tab.defenderName}`,
      detail: `${current.min}-${current.max} / ${current.minPercent}-${current.maxPercent}% / ${current.koText}`,
      min: current.min,
      max: current.max,
      minPercent: current.minPercent,
      maxPercent: current.maxPercent,
      koText: current.koText,
      checked: true,
      tab: { ...current.tab },
    }
    setHistory((currentHistory) => [entry, ...currentHistory].slice(0, 30))
  }

  const restoreLog = (entry: HistoryEntry) => {
    const restored = { ...entry.tab, id: createId('calc'), name: `復元${tabs().length + 1}` }
    setTabs((current) => [...current, restored])
    setActiveId(restored.id)
  }

  const clearHistory = () => setHistory([])

  return (
    <section class="damage-app" aria-label="ダメージ計算アプリ">
      <header class="damage-app__header">
        <div>
          <p class="damage-app__eyebrow">Damage Calculator</p>
          <h2>ダメージ計算</h2>
        </div>
        <div class="damage-app__headline">
          <strong>
            {result().min} - {result().max}
          </strong>
          <span>
            {result().minPercent}% - {result().maxPercent}% / {result().koText}
          </span>
        </div>
        <div class="damage-app__actions">
          <button type="button" class="dojo-button dojo-button--primary" onClick={saveLog}>
            ログ保存
          </button>
          <button type="button" class="dojo-button" onClick={duplicateTab}>
            タブ複製
          </button>
        </div>
      </header>

      <nav class="damage-app__tabs" aria-label="計算タブ">
        <For each={tabs()}>
          {(tab) => (
            <div class="damage-app__tab" classList={{ 'is-active': tab.id === activeId() }}>
              <button type="button" onClick={() => setActiveId(tab.id)}>
                {tab.name}
              </button>
              <Show when={tabs().length > 1}>
                <button
                  type="button"
                  class="damage-app__tab-close"
                  aria-label={`${tab.name}を閉じる`}
                  onClick={(event) => {
                    event.stopPropagation()
                    closeTab(tab.id)
                  }}
                >
                  ×
                </button>
              </Show>
            </div>
          )}
        </For>
      </nav>

      <main class="damage-app__workspace">
        <div id="damage-input" class="damage-app__input">
          <section class="damage-app__section">
            <div class="damage-app__section-head">
              <h3>入力</h3>
              <p>ポケモン名はメモ用です。数値は種族値と努力値を手で合わせます。</p>
            </div>

            <div class="damage-app__quick">
              <For each={presets}>
                {(preset) => (
                  <button type="button" class="dojo-button" onClick={() => applyPreset(preset.patch)}>
                    {preset.label}
                  </button>
                )}
              </For>
            </div>

            <div class="damage-grid damage-grid--three">
              <label class="damage-field" for="damage-tab-name">
                <span>タブ名</span>
                <input
                  id="damage-tab-name"
                  class="dojo-input"
                  value={activeTab().name}
                  onInput={(event) => updateActive({ name: event.currentTarget.value })}
                />
              </label>
              <NumberField
                id="damage-level"
                label="レベル"
                min={1}
                max={100}
                value={activeTab().level}
                onInput={(value) => updateActive({ level: clamp(value, 1, 100) })}
              />
              <NumberField
                id="damage-hp-percent"
                label="相手の残りHP"
                min={1}
                max={100}
                suffix="%"
                value={activeTab().hpPercent}
                onInput={(value) => updateActive({ hpPercent: clamp(value, 1, 100) })}
              />
            </div>
          </section>

          <section class="damage-app__section">
            <div class="damage-app__section-head">
              <h3>攻撃側</h3>
              <p>物理ならA、特殊ならCを使います。性格補正とランク補正もここで反映します。</p>
            </div>

            <div class="damage-grid damage-grid--three">
              <label class="damage-field" for="damage-attacker">
                <span>攻撃側</span>
                <input
                  id="damage-attacker"
                  class="dojo-input"
                  value={activeTab().attackerName}
                  onInput={(event) => updateActive({ attackerName: event.currentTarget.value })}
                />
              </label>
              <TypeSelect
                id="damage-attacker-type1"
                label="タイプ1"
                value={activeTab().attackerType1}
                onInput={(value) => updateActive({ attackerType1: value })}
              />
              <TypeSelect
                id="damage-attacker-type2"
                label="タイプ2"
                includeNone
                value={activeTab().attackerType2}
                onInput={(value) => updateActive({ attackerType2: value })}
              />
              <label class="damage-field" for="damage-category">
                <span>分類</span>
                <select
                  id="damage-category"
                  class="dojo-select"
                  value={activeTab().category}
                  onInput={(event) => updateActive({ category: event.currentTarget.value as DamageCategory })}
                >
                  <option value="physical">物理</option>
                  <option value="special">特殊</option>
                </select>
              </label>
              <NumberField
                id="damage-base-atk"
                label="A種族値"
                min={1}
                max={255}
                value={activeTab().attackerBaseAtk}
                onInput={(value) => updateActive({ attackerBaseAtk: clamp(value, 1, 255) })}
              />
              <NumberField
                id="damage-base-spa"
                label="C種族値"
                min={1}
                max={255}
                value={activeTab().attackerBaseSpa}
                onInput={(value) => updateActive({ attackerBaseSpa: clamp(value, 1, 255) })}
              />
              <NumberField
                id="damage-attacker-ev"
                label="A/C努力値"
                min={0}
                max={252}
                step={4}
                value={activeTab().attackerEv}
                onInput={(value) => updateActive({ attackerEv: clamp(value, 0, 252) })}
              />
              <label class="damage-field" for="damage-attacker-nature">
                <span>性格補正</span>
                <select
                  id="damage-attacker-nature"
                  class="dojo-select"
                  value={activeTab().attackerNature}
                  onInput={(event) => updateActive({ attackerNature: Number(event.currentTarget.value) })}
                >
                  <option value="1.1">上昇 1.1</option>
                  <option value="1">補正なし</option>
                  <option value="0.9">下降 0.9</option>
                </select>
              </label>
              <NumberField
                id="damage-attacker-stage"
                label="A/Cランク"
                min={-6}
                max={6}
                value={activeTab().attackerStage}
                onInput={(value) => updateActive({ attackerStage: clamp(value, -6, 6) })}
              />
            </div>
          </section>

          <section class="damage-app__section">
            <div class="damage-app__section-head">
              <h3>技</h3>
              <p>タイプ一致、テラスタル、タイプ相性、天候、フィールドをまとめて見ます。</p>
            </div>

            <div class="damage-grid damage-grid--three">
              <label class="damage-field" for="damage-move">
                <span>技名</span>
                <input
                  id="damage-move"
                  class="dojo-input"
                  value={activeTab().moveName}
                  onInput={(event) => updateActive({ moveName: event.currentTarget.value })}
                />
              </label>
              <NumberField
                id="damage-power"
                label="威力"
                min={0}
                max={250}
                value={activeTab().movePower}
                onInput={(value) => updateActive({ movePower: clamp(value, 0, 250) })}
              />
              <TypeSelect
                id="damage-move-type"
                label="技タイプ"
                value={activeTab().moveType}
                onInput={(value) => updateActive({ moveType: (value || 'normal') as PokemonType })}
              />
              <TypeSelect
                id="damage-tera-type"
                label="テラスタル"
                includeNone
                value={activeTab().teraType}
                onInput={(value) => updateActive({ teraType: value })}
              />
              <label class="damage-field" for="damage-weather">
                <span>天候</span>
                <select
                  id="damage-weather"
                  class="dojo-select"
                  value={activeTab().weather}
                  onInput={(event) => updateActive({ weather: event.currentTarget.value as Weather })}
                >
                  <option value="none">なし</option>
                  <option value="sun">晴れ</option>
                  <option value="rain">雨</option>
                </select>
              </label>
              <label class="damage-field" for="damage-terrain">
                <span>フィールド</span>
                <select
                  id="damage-terrain"
                  class="dojo-select"
                  value={activeTab().terrain}
                  onInput={(event) => updateActive({ terrain: event.currentTarget.value as Terrain })}
                >
                  <option value="none">なし</option>
                  <option value="electric">エレキ</option>
                  <option value="grassy">グラス</option>
                  <option value="psychic">サイコ</option>
                  <option value="misty">ミスト</option>
                </select>
              </label>
            </div>
          </section>

          <section class="damage-app__section">
            <div class="damage-app__section-head">
              <h3>防御側</h3>
              <p>物理ならB、特殊ならDを使います。Hだけ振る、HBDに振る確認もここでできます。</p>
            </div>

            <div class="damage-grid damage-grid--three">
              <label class="damage-field" for="damage-defender">
                <span>防御側</span>
                <input
                  id="damage-defender"
                  class="dojo-input"
                  value={activeTab().defenderName}
                  onInput={(event) => updateActive({ defenderName: event.currentTarget.value })}
                />
              </label>
              <TypeSelect
                id="damage-defender-type1"
                label="タイプ1"
                value={activeTab().defenderType1}
                onInput={(value) => updateActive({ defenderType1: value })}
              />
              <TypeSelect
                id="damage-defender-type2"
                label="タイプ2"
                includeNone
                value={activeTab().defenderType2}
                onInput={(value) => updateActive({ defenderType2: value })}
              />
              <NumberField
                id="damage-base-hp"
                label="H種族値"
                min={1}
                max={255}
                value={activeTab().defenderBaseHp}
                onInput={(value) => updateActive({ defenderBaseHp: clamp(value, 1, 255) })}
              />
              <NumberField
                id="damage-base-def"
                label="B種族値"
                min={1}
                max={255}
                value={activeTab().defenderBaseDef}
                onInput={(value) => updateActive({ defenderBaseDef: clamp(value, 1, 255) })}
              />
              <NumberField
                id="damage-base-spd"
                label="D種族値"
                min={1}
                max={255}
                value={activeTab().defenderBaseSpd}
                onInput={(value) => updateActive({ defenderBaseSpd: clamp(value, 1, 255) })}
              />
              <NumberField
                id="damage-hp-ev"
                label="H努力値"
                min={0}
                max={252}
                step={4}
                value={activeTab().defenderHpEv}
                onInput={(value) => updateActive({ defenderHpEv: clamp(value, 0, 252) })}
              />
              <NumberField
                id="damage-defender-ev"
                label="B/D努力値"
                min={0}
                max={252}
                step={4}
                value={activeTab().defenderEv}
                onInput={(value) => updateActive({ defenderEv: clamp(value, 0, 252) })}
              />
              <label class="damage-field" for="damage-defender-nature">
                <span>性格補正</span>
                <select
                  id="damage-defender-nature"
                  class="dojo-select"
                  value={activeTab().defenderNature}
                  onInput={(event) => updateActive({ defenderNature: Number(event.currentTarget.value) })}
                >
                  <option value="1.1">上昇 1.1</option>
                  <option value="1">補正なし</option>
                  <option value="0.9">下降 0.9</option>
                </select>
              </label>
              <NumberField
                id="damage-defender-stage"
                label="B/Dランク"
                min={-6}
                max={6}
                value={activeTab().defenderStage}
                onInput={(value) => updateActive({ defenderStage: clamp(value, -6, 6) })}
              />
            </div>

            <div class="damage-app__quick">
              <button type="button" class="dojo-button" onClick={() => updateActive({ defenderHpEv: 252, defenderEv: 0 })}>
                Hぶっぱ
              </button>
              <button
                type="button"
                class="dojo-button"
                onClick={() => updateActive({ defenderHpEv: 252, defenderEv: 252, defenderNature: 1.1 })}
              >
                HBD厚め
              </button>
              <button type="button" class="dojo-button" onClick={() => updateActive({ attackerEv: 32 })}>
                A/C 32
              </button>
            </div>
          </section>

          <section class="damage-app__section">
            <div class="damage-app__section-head">
              <h3>補正と削り</h3>
              <p>やけど、壁、ダブル補正、設置技、固定ダメージを足して倒せるか見ます。</p>
            </div>

            <div class="damage-switches">
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().isBurned}
                  onInput={(event) => updateActive({ isBurned: event.currentTarget.checked })}
                />
                やけど
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().ignoreBurn}
                  onInput={(event) => updateActive({ ignoreBurn: event.currentTarget.checked })}
                />
                やけど補正なし
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().isScreen}
                  onInput={(event) => updateActive({ isScreen: event.currentTarget.checked })}
                />
                壁あり
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().isSpread}
                  onInput={(event) => updateActive({ isSpread: event.currentTarget.checked })}
                />
                範囲技
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().isCritical}
                  onInput={(event) => updateActive({ isCritical: event.currentTarget.checked })}
                />
                急所
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().stealthRock}
                  onInput={(event) => updateActive({ stealthRock: event.currentTarget.checked })}
                />
                ステルスロック
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={activeTab().grounded}
                  onInput={(event) => updateActive({ grounded: event.currentTarget.checked })}
                />
                まきびしを受ける
              </label>
            </div>

            <div class="damage-grid damage-grid--three">
              <label class="damage-field" for="damage-spikes">
                <span>まきびし</span>
                <select
                  id="damage-spikes"
                  class="dojo-select"
                  value={activeTab().spikeLayers}
                  onInput={(event) => updateActive({ spikeLayers: Number(event.currentTarget.value) })}
                >
                  <option value="0">なし</option>
                  <option value="1">1回</option>
                  <option value="2">2回</option>
                  <option value="3">3回</option>
                </select>
              </label>
              <NumberField
                id="damage-fixed-chip"
                label="固定ダメージ"
                min={0}
                max={999}
                value={activeTab().fixedChip}
                onInput={(value) => updateActive({ fixedChip: clamp(value, 0, 999) })}
              />
              <NumberField
                id="damage-other-modifier"
                label="その他補正"
                min={0}
                max={4}
                step={0.05}
                suffix="倍"
                value={activeTab().otherModifier}
                onInput={(value) => updateActive({ otherModifier: clampDecimal(value, 0, 4) })}
              />
            </div>
          </section>
        </div>

        <aside id="damage-result" class="damage-app__result" aria-label="計算結果">
          <div class="damage-result__top">
            <p>{result().tab.moveName}</p>
            <strong>
              {result().min} - {result().max}
            </strong>
            <span>
              {result().minPercent}% - {result().maxPercent}% / {result().koText}
            </span>
          </div>

          <dl class="damage-result__stats">
            <div>
              <dt>攻撃実数値</dt>
              <dd>{result().attackerStat}</dd>
            </div>
            <div>
              <dt>防御実数値</dt>
              <dd>{result().defenderStat}</dd>
            </div>
            <div>
              <dt>相手HP</dt>
              <dd>{result().currentHp} / {result().hp}</dd>
            </div>
            <div>
              <dt>削り後HP</dt>
              <dd>{result().requiredHp}</dd>
            </div>
            <div>
              <dt>タイプ相性</dt>
              <dd>{formatMultiplier(result().typeEffectiveness)}</dd>
            </div>
            <div>
              <dt>一致補正</dt>
              <dd>{result().stab}倍</dd>
            </div>
          </dl>

          <div class="damage-result__meter" aria-label="ダメージ幅">
            <span style={{ width: `${Math.min(100, result().minPercent)}%` }} />
            <span style={{ width: `${Math.min(100, result().maxPercent)}%` }} />
          </div>

          <div class="damage-rolls">
            <For each={result().rolls}>
              {(damage, index) => (
                <span classList={{ 'is-ko': damage >= result().requiredHp && result().requiredHp > 0 }}>
                  {rollFactors[index()]}: {damage}
                </span>
              )}
            </For>
          </div>

          <p class="damage-app__note">
            乱数は85から100までの16段階で表示しています。厳密な作品固有処理と違う時は、その他補正で調整してください。
          </p>
        </aside>
      </main>

      <section id="damage-history" class="damage-app__history">
        <div class="damage-app__section-head">
          <h3>履歴と合算</h3>
          <p>削り候補を保存し、チェックしたログだけを合算します。復元すると別タブで開きます。</p>
        </div>

        <div class="damage-history__summary">
          <strong>
            {selectedTotal().min} - {selectedTotal().max}
          </strong>
          <span>
            選択中 {selectedHistory().length}件 / 現在の相手HP {result().hp} に対して{' '}
            {Math.round((selectedTotal().min / result().hp) * 1000) / 10}% -{' '}
            {Math.round((selectedTotal().max / result().hp) * 1000) / 10}%
          </span>
          <button type="button" class="dojo-button" onClick={clearHistory}>
            履歴を消す
          </button>
        </div>

        <Show when={history().length} fallback={<p class="damage-app__empty">まだ履歴がありません。</p>}>
          <div class="damage-history__list">
            <For each={history()}>
              {(entry) => (
                <article class="damage-history__item">
                  <label>
                    <input
                      type="checkbox"
                      checked={entry.checked}
                      onInput={(event) =>
                        setHistory((current) =>
                          current.map((item) =>
                            item.id === entry.id ? { ...item, checked: event.currentTarget.checked } : item,
                          ),
                        )
                      }
                    />
                    <span>
                      <strong>{entry.label}</strong>
                      <small>
                        {entry.createdAt} / {entry.detail}
                      </small>
                    </span>
                  </label>
                  <button type="button" class="dojo-button" onClick={() => restoreLog(entry)}>
                    復元
                  </button>
                </article>
              )}
            </For>
          </div>
        </Show>
      </section>

      <footer class="damage-app__footer-tabs">
        <a href="#damage-input">入力</a>
        <a href="#damage-result">結果</a>
        <a href="#damage-history">履歴</a>
      </footer>
    </section>
  )
}
