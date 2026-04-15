import { For, createMemo, createSignal } from 'solid-js'
import {
  analyzeCoverage,
  pokemonTypes,
  typeLabels,
  type PokemonType,
  type TeamSlot,
} from '../../lib/type-chart'

const initialSlots: TeamSlot[] = [
  { name: '1体目', type1: 'fire', type2: '' },
  { name: '2体目', type1: 'water', type2: '' },
  { name: '3体目', type1: 'grass', type2: '' },
  { name: '4体目', type1: '', type2: '' },
  { name: '5体目', type1: '', type2: '' },
  { name: '6体目', type1: '', type2: '' },
]

export default function CoverageTool() {
  const [slots, setSlots] = createSignal<TeamSlot[]>(initialSlots)

  const updateSlot = (index: number, patch: Partial<TeamSlot>) => {
    setSlots((current) =>
      current.map((slot, slotIndex) => {
        if (slotIndex !== index) return slot

        const nextSlot = { ...slot, ...patch }
        if (patch.type1 && patch.type1 === nextSlot.type2) nextSlot.type2 = ''
        if (patch.type2 && patch.type2 === nextSlot.type1) nextSlot.type2 = ''

        return nextSlot
      }),
    )
  }

  const coverage = createMemo(() =>
    analyzeCoverage(slots()).sort((a, b) => b.weak - a.weak || a.resist + a.immune - (b.resist + b.immune)),
  )

  const pressureTypes = createMemo(() => coverage().filter((row) => row.weak >= 2 && row.resist + row.immune <= 1))

  return (
    <section class="dojo-tool" aria-label="タイプ補完チェック">
      <div>
        <h2>タイプ補完チェック</h2>
        <p>6体のタイプを入れて、弱点が重なりすぎていないかを確認します。</p>
      </div>

      <div class="dojo-grid">
        <For each={slots()}>
          {(slot, index) => (
            <div class="dojo-team-row">
              <input
                class="dojo-input"
                value={slot.name}
                aria-label={`${index() + 1}体目の名前`}
                onInput={(event) => updateSlot(index(), { name: event.currentTarget.value })}
              />
              <select
                class="dojo-select"
                value={slot.type1}
                aria-label={`${index() + 1}体目のタイプ1`}
                onInput={(event) => updateSlot(index(), { type1: event.currentTarget.value as PokemonType | '' })}
              >
                <option value="">タイプ1</option>
                <For each={pokemonTypes}>
                  {(type) => <option value={type.id}>{type.label}</option>}
                </For>
              </select>
              <select
                class="dojo-select"
                value={slot.type2}
                aria-label={`${index() + 1}体目のタイプ2`}
                onInput={(event) => updateSlot(index(), { type2: event.currentTarget.value as PokemonType | '' })}
              >
                <option value="">タイプ2</option>
                <For each={pokemonTypes}>
                  {(type) => (
                    <option value={type.id} disabled={type.id === slot.type1}>
                      {type.label}
                    </option>
                  )}
                </For>
              </select>
            </div>
          )}
        </For>
      </div>

      <div class="dojo-result">
        <strong>一貫しやすい攻撃タイプ</strong>
        <ul class="dojo-badges">
          <For each={pressureTypes()}>
            {(row) => (
              <li class="dojo-badge dojo-badge--danger">
                {typeLabels[row.attackType]}: 弱点{row.weak} / 半減以下{row.resist + row.immune}
              </li>
            )}
          </For>
        </ul>
        <p>弱点が2体以上に重なり、半減以下で受けられる数が少ないタイプは、対戦中に通されやすくなります。</p>
      </div>
    </section>
  )
}
