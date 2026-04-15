import { For, Show, createMemo, createSignal } from 'solid-js'
import type { QuizQuestion } from '../../lib/quiz'

interface QuizBlockProps {
  questions: QuizQuestion[]
}

export default function QuizBlock(props: QuizBlockProps) {
  const [answers, setAnswers] = createSignal<Record<number, number>>({})

  const answeredCount = createMemo(() => Object.keys(answers()).length)
  const score = createMemo(() =>
    props.questions.reduce((total, question, index) => {
      return total + (answers()[index] === question.answerIndex ? 1 : 0)
    }, 0),
  )

  const choose = (questionIndex: number, choiceIndex: number) => {
    setAnswers((current) => ({ ...current, [questionIndex]: choiceIndex }))
  }

  return (
    <section class="dojo-tool dojo-quiz" aria-label="確認テスト">
      <div>
        <h2>確認テスト</h2>
        <p>答えを選ぶと、その場で解説を確認できます。</p>
      </div>

      <For each={props.questions}>
        {(question, questionIndex) => {
          const selected = () => answers()[questionIndex()]
          const isAnswered = () => selected() !== undefined

          return (
            <div class="dojo-question">
              <p>
                <strong>Q{questionIndex() + 1}.</strong> {question.prompt}
              </p>
              <div class="dojo-grid">
                <For each={question.choices}>
                  {(choice, choiceIndex) => {
                    const isSelected = () => selected() === choiceIndex()
                    const isCorrect = () => question.answerIndex === choiceIndex()

                    return (
                      <button
                        type="button"
                        class="dojo-button dojo-choice"
                        classList={{
                          'is-selected': isSelected(),
                          'is-correct': isAnswered() && isCorrect(),
                          'is-wrong': isAnswered() && isSelected() && !isCorrect(),
                        }}
                        onClick={() => choose(questionIndex(), choiceIndex())}
                      >
                        {choice}
                      </button>
                    )
                  }}
                </For>
              </div>

              <Show when={isAnswered()}>
                <p class="dojo-answer">{question.explanation}</p>
              </Show>
            </div>
          )
        }}
      </For>

      <div class="dojo-result">
        <strong>
          {score()} / {props.questions.length} 正解
        </strong>
        <p>
          {answeredCount() === props.questions.length
            ? '次のページへ進む前に、間違えた問題の解説を読み直しましょう。'
            : 'まだ答えていない問題があります。'}
        </p>
        <button type="button" class="dojo-button" onClick={() => setAnswers({})}>
          もう一度解く
        </button>
      </div>
    </section>
  )
}
