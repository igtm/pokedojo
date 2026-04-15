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
            { label: '1.1 勝敗とターン', link: '/basics/battle-flow/' },
            { label: '1.2 シングルとダブル', link: '/basics/singles-doubles/' },
          ],
        },
        {
          label: '2. タイプ相性',
          items: [
            { label: '2.1 倍率で考える', link: '/type-matchups/' },
          ],
        },
        {
          label: '3. ダメージと行動順',
          items: [
            { label: '3.1 乱数・素早さ・優先度', link: '/damage-speed/' },
          ],
        },
        {
          label: '4. 役割と非公式用語',
          items: [
            { label: '4.1 対戦用語を読む', link: '/glossary/' },
          ],
        },
        {
          label: '5. 構築の型',
          items: [
            { label: '5.1 構築タイプを選ぶ', link: '/building/archetypes/' },
            { label: '5.2 6体を組む', link: '/building/checklist/' },
          ],
        },
        {
          label: '6. 試合中の判断',
          items: [
            { label: '6.1 選出・交換・勝ち筋', link: '/in-battle/decision/' },
          ],
        },
        {
          label: '7. Champions 実戦準備',
          items: [
            { label: '7.1 発展と環境の見方', link: '/champions/advanced/' },
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
