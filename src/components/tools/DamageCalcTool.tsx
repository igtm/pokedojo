import { For, createMemo, createSignal } from 'solid-js'
import { Move, Pokemon, calculate } from '@smogon/calc'
import type { StatID } from '@smogon/calc'

type OffensiveStat = Extract<StatID, 'atk' | 'spa'>
type DefensiveStat = Extract<StatID, 'def' | 'spd'>

interface DamagePreset {
  label: string
  attacker: string
  attackerJa: string
  attackerNature: string
  attackerStat: OffensiveStat
  defender: string
  defenderJa: string
  defenderNature: string
  defenderStat: DefensiveStat
  move: string
  moveJa: string
  note: string
}

const presets: DamagePreset[] = [
  {
    label: 'ピカチュウの10まんボルト → ギャラドス',
    attacker: 'Pikachu',
    attackerJa: 'ピカチュウ',
    attackerNature: 'Timid',
    attackerStat: 'spa',
    defender: 'Gyarados',
    defenderJa: 'ギャラドス',
    defenderNature: 'Careful',
    defenderStat: 'spd',
    move: 'Thunderbolt',
    moveJa: '10まんボルト',
    note: '4倍弱点は、多少の耐久があっても試合を動かす圧力になります。',
  },
  {
    label: 'ガブリアスのじしん → ヒードラン',
    attacker: 'Garchomp',
    attackerJa: 'ガブリアス',
    attackerNature: 'Jolly',
    attackerStat: 'atk',
    defender: 'Heatran',
    defenderJa: 'ヒードラン',
    defenderNature: 'Bold',
    defenderStat: 'def',
    move: 'Earthquake',
    moveJa: 'じしん',
    note: 'タイプ相性と高威力技が重なると、交代先まで制限できます。',
  },
  {
    label: 'カイリューのしんそく → パオジアン',
    attacker: 'Dragonite',
    attackerJa: 'カイリュー',
    attackerNature: 'Adamant',
    attackerStat: 'atk',
    defender: 'Chien-Pao',
    defenderJa: 'パオジアン',
    defenderNature: 'Jolly',
    defenderStat: 'def',
    move: 'Extreme Speed',
    moveJa: 'しんそく',
    note: '先制技は、素早さで負けていても終盤の詰め筋になります。',
  },
]

function clampEv(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(252, Math.max(0, Math.floor(value)))
}

function describeHitCount(min: number, max: number, hp: number): string {
  if (max === 0) return 'ダメージなし'
  if (min >= hp) return '確定1発'
  if (max >= hp) return '乱数1発'
  if (min * 2 >= hp) return '確定2発'
  if (max * 2 >= hp) return '乱数2発'
  if (min * 3 >= hp) return '確定3発'
  if (max * 3 >= hp) return '乱数3発'
  return '4発以上'
}

export default function DamageCalcTool() {
  const [presetIndex, setPresetIndex] = createSignal(0)
  const [level, setLevel] = createSignal(50)
  const [attackerEv, setAttackerEv] = createSignal(252)
  const [defenderHpEv, setDefenderHpEv] = createSignal(252)
  const [defenderEv, setDefenderEv] = createSignal(0)

  const preset = createMemo(() => presets[presetIndex()] ?? presets[0])

  const result = createMemo(() => {
    try {
      const current = preset()
      const attacker = new Pokemon(9, current.attacker, {
        level: level(),
        nature: current.attackerNature,
        evs: { [current.attackerStat]: attackerEv() },
      })
      const defender = new Pokemon(9, current.defender, {
        level: level(),
        nature: current.defenderNature,
        evs: { hp: defenderHpEv(), [current.defenderStat]: defenderEv() },
      })
      const move = new Move(9, current.move)
      const calcResult = calculate(9, attacker, defender, move)
      const [min, max] = calcResult.range()
      const hp = defender.maxHP()
      return {
        ok: true as const,
        min,
        max,
        minPercent: Math.round((min / hp) * 1000) / 10,
        maxPercent: Math.round((max / hp) * 1000) / 10,
        hp,
        ko: describeHitCount(min, max, hp),
      }
    } catch (error) {
      return {
        ok: false as const,
        message: error instanceof Error ? error.message : '計算できませんでした。',
      }
    }
  })

  return (
    <section class="dojo-tool" aria-label="ダメージ計算">
      <div>
        <h2>ダメージ計算</h2>
        <p>まずは固定例で、乱数と確定数の感覚をつかみます。</p>
      </div>

      <div class="dojo-grid dojo-grid--two">
        <div class="dojo-field">
          <label for="damage-preset">例</label>
          <select
            id="damage-preset"
            class="dojo-select"
            value={presetIndex()}
            onInput={(event) => setPresetIndex(Number(event.currentTarget.value))}
          >
            <For each={presets}>
              {(item, index) => <option value={index()}>{item.label}</option>}
            </For>
          </select>
        </div>

        <div class="dojo-field">
          <label for="damage-level">レベル</label>
          <input
            id="damage-level"
            class="dojo-input"
            type="number"
            min="1"
            max="100"
            value={level()}
            onInput={(event) => setLevel(Math.min(100, Math.max(1, Number(event.currentTarget.value))))}
          />
        </div>

        <div class="dojo-field">
          <label for="attacker-ev">攻撃側の努力値</label>
          <input
            id="attacker-ev"
            class="dojo-input"
            type="number"
            min="0"
            max="252"
            step="4"
            value={attackerEv()}
            onInput={(event) => setAttackerEv(clampEv(Number(event.currentTarget.value)))}
          />
        </div>

        <div class="dojo-field">
          <label for="defender-hp-ev">防御側HP努力値</label>
          <input
            id="defender-hp-ev"
            class="dojo-input"
            type="number"
            min="0"
            max="252"
            step="4"
            value={defenderHpEv()}
            onInput={(event) => setDefenderHpEv(clampEv(Number(event.currentTarget.value)))}
          />
        </div>

        <div class="dojo-field">
          <label for="defender-ev">防御側の防御/特防努力値</label>
          <input
            id="defender-ev"
            class="dojo-input"
            type="number"
            min="0"
            max="252"
            step="4"
            value={defenderEv()}
            onInput={(event) => setDefenderEv(clampEv(Number(event.currentTarget.value)))}
          />
        </div>
      </div>

      <div class="dojo-result">
        <strong>
          {preset().attackerJa} の {preset().moveJa} → {preset().defenderJa}
        </strong>
        {result().ok ? (
          <>
            <p>
              {result().min} - {result().max} ダメージ / 最大HP {result().hp}
            </p>
            <p>
              {result().minPercent}% - {result().maxPercent}% / {result().ko}
            </p>
            <p>{preset().note}</p>
          </>
        ) : (
          <p>{result().message}</p>
        )}
      </div>

      <p class="dojo-note">
        <strong>使い方:</strong> このツールは基礎学習用です。細かい場の状態、レギュレーション差、作品固有の仕様は
        実戦前にゲーム内情報で確認してください。
      </p>
    </section>
  )
}
