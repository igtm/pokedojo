import { For, createMemo, createSignal } from 'solid-js'
import {
  calculateMatchup,
  explainMultiplier,
  formatMultiplier,
  pokemonTypes,
  typeName,
  type PokemonType,
} from '../../lib/type-chart'

export default function TypeMatchupTool() {
  const [attackType, setAttackType] = createSignal<PokemonType>('electric')
  const [defenseType1, setDefenseType1] = createSignal<PokemonType>('water')
  const [defenseType2, setDefenseType2] = createSignal<PokemonType | ''>('')

  const multiplier = createMemo(() => calculateMatchup(attackType(), [defenseType1(), defenseType2()]))

  const updateDefenseType1 = (value: PokemonType) => {
    setDefenseType1(value)
    if (defenseType2() === value) setDefenseType2('')
  }

  const updateDefenseType2 = (value: PokemonType | '') => {
    setDefenseType2(value === defenseType1() ? '' : value)
  }

  return (
    <section class="dojo-tool" aria-label="タイプ相性計算">
      <div>
        <h2>タイプ相性計算</h2>
        <p>攻撃タイプと防御タイプを選ぶと、倍率と読み方を確認できます。</p>
      </div>

      <div class="dojo-grid dojo-grid--two">
        <div class="dojo-field">
          <label for="attack-type">攻撃タイプ</label>
          <select
            id="attack-type"
            class="dojo-select"
            value={attackType()}
            onInput={(event) => setAttackType(event.currentTarget.value as PokemonType)}
          >
            <For each={pokemonTypes}>
              {(type) => <option value={type.id}>{type.label}</option>}
            </For>
          </select>
        </div>

        <div class="dojo-field">
          <label for="defense-type-1">防御タイプ1</label>
          <select
            id="defense-type-1"
            class="dojo-select"
            value={defenseType1()}
            onInput={(event) => updateDefenseType1(event.currentTarget.value as PokemonType)}
          >
            <For each={pokemonTypes}>
              {(type) => <option value={type.id}>{type.label}</option>}
            </For>
          </select>
        </div>

        <div class="dojo-field">
          <label for="defense-type-2">防御タイプ2</label>
          <select
            id="defense-type-2"
            class="dojo-select"
            value={defenseType2()}
            onInput={(event) => updateDefenseType2(event.currentTarget.value as PokemonType | '')}
          >
            <option value="">なし</option>
            <For each={pokemonTypes}>
              {(type) => (
                <option value={type.id} disabled={type.id === defenseType1()}>
                  {type.label}
                </option>
              )}
            </For>
          </select>
        </div>
      </div>

      <div class="dojo-result">
        <strong>{formatMultiplier(multiplier())}</strong>
        <p>
          {typeName(attackType())}技 → {typeName(defenseType1())}
          {defenseType2() ? `/${typeName(defenseType2())}` : ''} は {explainMultiplier(multiplier())}
        </p>
      </div>
    </section>
  )
}
