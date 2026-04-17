import { defineConfig } from 'astro/config'
import solid from '@astrojs/solid-js'
import starlight from '@astrojs/starlight'

const base = '/pokedojo'

export default defineConfig({
  site: 'https://igtm.github.io',
  base,
  integrations: [
    solid(),
    starlight({
      title: 'PokéDojo',
      description: 'ポケモンバトルを1ページずつ覚える日本語ドキュメント',
      defaultLocale: 'root',
      locales: {
        root: {
          label: '日本語',
          lang: 'ja',
        },
      },
      customCss: ['./src/styles/custom.css'],
      pagefind: false,
      components: {
        Search: './src/components/starlight/Search.astro',
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      sidebar: [
        {
          label: '0. はじめに',
          items: [
            { label: '0.1 PokéDojo の使い方', link: '/start/overview/' },
          ],
        },
        {
          label: '1. バトルの基本',
          items: [
            { label: '1.1 バトル画面と1ターン', link: '/basics/battle-flow/' },
            { label: '1.2 まずはシングルから', link: '/basics/singles-doubles/' },
          ],
        },
        {
          label: '2. タイプ相性',
          items: [
            { label: '2.1 タイプ相性の読み方', link: '/type-matchups/' },
          ],
        },
        {
          label: '3. ダメージと行動順',
          items: [
            { label: '3.1 HP・ダメージ・行動順', link: '/damage-speed/' },
          ],
        },
        {
          label: '4. 役割と非公式用語',
          items: [
            { label: '4.1 対戦用語をやさしく読む', link: '/glossary/' },
          ],
        },
        {
          label: '5. 構築の型',
          items: [
            { label: '5.1 最初の構築テンプレ', link: '/building/archetypes/' },
            { label: '5.2 6体を表で組む', link: '/building/checklist/' },
            { label: '5.3 努力値・種族値の読み方', link: '/building/ev-terms/' },
          ],
        },
        {
          label: '6. 試合中の判断',
          items: [
            { label: '6.1 1ターンの選び方', link: '/in-battle/decision/' },
            { label: '6.2 補助技と設置技', link: '/in-battle/utility-moves/' },
          ],
        },
        {
          label: '7. Champions 実戦準備',
          items: [
            { label: '7.1 情報の見方と発展', link: '/champions/advanced/' },
          ],
        },
        {
          label: '8. ツール集',
          items: [
            { label: '8.1 練習ツール', link: '/tools/' },
          ],
        },
      ],
    }),
  ],
})
