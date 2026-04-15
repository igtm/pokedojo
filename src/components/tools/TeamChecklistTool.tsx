import { For, createMemo, createSignal } from 'solid-js'

const checklist = [
  '物理アタッカーと特殊アタッカーが両方いる',
  '素早いポケモン、先制技、素早さ操作のどれかがある',
  '不利対面で引ける先が最低1つある',
  '相手を崩す手段がある',
  '終盤に通す勝ち筋が言える',
  '状態異常、壁、天候、フィールドなどの展開に触れる手段がある',
  'メガシンカ枠や軸になるポケモンの役割が明確',
  '同じ弱点が3体以上に固まりすぎていない',
]

export default function TeamChecklistTool() {
  const [checked, setChecked] = createSignal<Set<number>>(new Set())
  const [note, setNote] = createSignal('最後に誰で勝つかを書く')

  const score = createMemo(() => checked().size)
  const message = createMemo(() => {
    if (score() >= 7) return '実戦に持ち込みやすい形です。対戦後に負け筋を1つだけメモしましょう。'
    if (score() >= 5) return '基本形はできています。弱い相手のタイプや展開を1つ補いましょう。'
    return 'まだ穴が多い状態です。まずは勝ち筋、引き先、素早さの3つを埋めましょう。'
  })

  const toggle = (index: number) => {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <section class="dojo-tool" aria-label="構築チェックリスト">
      <div>
        <h2>構築チェックリスト</h2>
        <p>強い6体名を探す前に、構築が戦える形になっているかを確認します。</p>
      </div>

      <div class="dojo-checklist">
        <For each={checklist}>
          {(item, index) => (
            <label class="dojo-check">
              <input type="checkbox" checked={checked().has(index())} onChange={() => toggle(index())} />
              <span>{item}</span>
            </label>
          )}
        </For>
      </div>

      <div class="dojo-field">
        <label for="team-note">勝ち筋メモ</label>
        <input
          id="team-note"
          class="dojo-input"
          value={note()}
          onInput={(event) => setNote(event.currentTarget.value)}
        />
      </div>

      <div class="dojo-result">
        <strong>{score()} / {checklist.length}</strong>
        <p>{message()}</p>
        <p>メモ: {note()}</p>
      </div>
    </section>
  )
}
