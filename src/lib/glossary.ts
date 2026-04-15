export interface GlossaryTerm {
  term: string
  category: string
  isOfficial: boolean
  description: string
  example: string
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: '対面',
    category: '盤面',
    isOfficial: false,
    description: '今、場に出ているポケモン同士の関係。目の前の1対1で勝てるかを考える時に使う。',
    example: '「この対面は素早さで勝っていて、弱点技も押せる」',
  },
  {
    term: 'サイクル',
    category: '構築',
    isOfficial: false,
    description: '交換を使って有利な対面を作り直し、少しずつ相手を削る考え方。',
    example: '「みず技を受けられるポケモンへ引いてサイクルを回す」',
  },
  {
    term: '積み',
    category: '勝ち筋',
    isOfficial: false,
    description: '能力を上げる技を使い、後のターンで一気に倒し切る準備をすること。',
    example: '「相手が交換しそうなターンにこうげきを積む」',
  },
  {
    term: '展開',
    category: '勝ち筋',
    isOfficial: false,
    description: '壁、天候、フィールド、素早さ操作などで、味方が動きやすい状態を作ること。',
    example: '「先発で壁を展開して、後続の積み技につなぐ」',
  },
  {
    term: '受け',
    category: '役割',
    isOfficial: false,
    description: '相手の攻撃を耐えて、回復や状態異常、交換で試合を長く使う役割。',
    example: '「物理受けで相手のこうげき技を止める」',
  },
  {
    term: '受け出し',
    category: '交換',
    isOfficial: false,
    description: '相手の攻撃を予想して、耐えられるポケモンへ交代すること。',
    example: '「じめん技読みでひこうタイプへ受け出しする」',
  },
  {
    term: '引き先',
    category: '交換',
    isOfficial: false,
    description: '不利対面になった時に交代して出せるポケモン。',
    example: '「でんき技の引き先を構築に入れておく」',
  },
  {
    term: '一貫',
    category: '攻撃',
    isOfficial: false,
    description: '相手の複数体に同じタイプや技が通りやすい状態。',
    example: '「相手のパーティーにはこおり技が一貫している」',
  },
  {
    term: '起点',
    category: '勝ち筋',
    isOfficial: false,
    description: '相手がこちらを止めにくく、積み技や展開の準備に使いやすい相手やターン。',
    example: '「回復しかできない相手を起点にする」',
  },
  {
    term: '切る',
    category: '判断',
    isOfficial: false,
    description: '勝ち筋を残すため、あえて1体を倒される前提で動かすこと。',
    example: '「このポケモンを切って、安全にエースを出す」',
  },
  {
    term: '択',
    category: '判断',
    isOfficial: false,
    description: '複数の選択肢があり、相手の行動次第で正解が変わる場面。',
    example: '「攻撃するか交換するかの択になる」',
  },
  {
    term: '安定択',
    category: '判断',
    isOfficial: false,
    description: '最大リターンではなくても、外した時の損が小さい選択。',
    example: '「相手が居座っても交代しても悪くない技を押す」',
  },
  {
    term: '勝ち筋',
    category: '判断',
    isOfficial: false,
    description: 'ここから勝つために必要な手順。誰を残し、誰で倒し切るかまで含む。',
    example: '「最後は素早いエースを通す勝ち筋を残す」',
  },
  {
    term: '詰め筋',
    category: '判断',
    isOfficial: false,
    description: '終盤に相手の選択肢を減らし、勝ちへ近づける手順。',
    example: '「先制技圏内まで削って詰め筋を作る」',
  },
  {
    term: '行動保証',
    category: '役割',
    isOfficial: false,
    description: 'きあいのタスキ、耐久、特性などにより、最低1回は行動しやすい性質。',
    example: '「行動保証がある先発で場作りをする」',
  },
  {
    term: '縛り',
    category: '攻撃',
    isOfficial: false,
    description: '相手が次の攻撃で倒されるため、自由に動きにくい状態。',
    example: '「先制技で縛れているので、相手は交換しづらい」',
  },
  {
    term: '役割集中',
    category: '構築',
    isOfficial: false,
    description: '同じ受け先に負担を集め、どこかで崩す考え方。',
    example: '「2体の物理アタッカーで相手の物理受けに役割集中する」',
  },
]
