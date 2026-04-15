# PokéDojo

ポケモンバトル初心者向けの日本語学習サイトです。Markdown/MDX の教材を Astro Starlight で配信し、タイプ相性やダメージ計算などの練習ツールを Solid で動かします。

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

`pnpm dev` はローカル開発サーバーを起動します。`pnpm build` は Starlight の静的サイトを `dist/` に生成します。

## 図解を書く

MDX ページでは Mermaid と専用図解コンポーネントを使えます。

```mdx
import MermaidDiagram from '../../../components/diagrams/MermaidDiagram.astro'

<MermaidDiagram title="倒し切れるかを見る流れ">
{`
flowchart LR
  A[相手の残りHPを見る] --> B{最小ダメージで倒せる?}
  B -->|はい| C[確定で倒せる]
  B -->|いいえ| D[別の削りを考える]
`}
</MermaidDiagram>
```

よく使う説明図は `src/components/diagrams/` に置きます。現時点では、ダメージ要素用の `DamageFactorsDiagram` と、行動順用の `SpeedOrderDiagram` を用意しています。
