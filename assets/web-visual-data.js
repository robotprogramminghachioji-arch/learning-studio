// Generated from web-course-visuals.json and web-visual-manifest.json.
export const WEB_VISUALS={
  "web1-l1-lesson01": {
    "kind": "flow",
    "headline": "コードが画面になるまで",
    "nodes": [
      "HTML\n内容を作る",
      "CSS\n見た目を作る",
      "JavaScript\n動きを付ける"
    ],
    "notes": [
      "見出しとボタンはHTMLに書く。",
      "色や余白はCSSで整える。",
      "クリックした後の加点はJavaScript。"
    ],
    "change": {
      "language": "HTML",
      "before": "<h1>まずは星集めゲームを動かそう</h1>",
      "after": "<h1>わたしの星集め</h1>",
      "instruction": "HTMLのh1で囲まれた文字だけを変える。idは変えない。",
      "expected": "ゲーム名が変わり、ボタンを押すと1点ずつ増える。"
    },
    "lookFor": [
      [
        "h1",
        "① ゲーム名"
      ],
      [
        "#score",
        "② 得点"
      ],
      [
        "#collect",
        "③ 押すボタン"
      ]
    ],
    "sourceHash": "86e15f283a10",
    "width": 608,
    "height": 308,
    "pixelWidth": 2432,
    "pixelHeight": 1236,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l1-lesson01-preview.png",
    "diagram": "assets/web-course-visuals/web1-l1-lesson01-diagram.svg",
    "code": "assets/web-course-visuals/web1-l1-lesson01-code.svg"
  },
  "web1-l1-lesson02": {
    "kind": "layers",
    "headline": "自己紹介とゲームの入れ物",
    "nodes": [
      "h1\n作品のタイトル",
      "p・ul・li\n紹介と好きなもの",
      "a → #game\nゲームへの入口"
    ],
    "notes": [
      "タグは文章の役割を伝える。",
      "ulの中へliを3つ入れる。",
      "リンクのhrefと移動先のidをそろえる。"
    ],
    "change": {
      "language": "HTML",
      "before": "<li>ゲーム</li>",
      "after": "<li>サッカー</li>",
      "instruction": "好きなもののliを自分の内容に変える。",
      "expected": "箇条書きの1項目が変わり、ゲームはそのまま動く。"
    },
    "lookFor": [
      [
        "h1",
        "① 作品名"
      ],
      [
        "ul",
        "② 好きなもの"
      ],
      [
        "#collect",
        "③ ゲーム"
      ]
    ],
    "sourceHash": "455d9cad292d",
    "width": 608,
    "height": 596,
    "pixelWidth": 2432,
    "pixelHeight": 2384,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l1-lesson02-preview.png",
    "diagram": "assets/web-course-visuals/web1-l1-lesson02-diagram.svg",
    "code": "assets/web-course-visuals/web1-l1-lesson02-code.svg"
  },
  "web1-l1-lesson03": {
    "kind": "state",
    "headline": "5点に届いたらクリア",
    "nodes": [
      "0点\nスタート",
      "1〜4点\nまだ押せる",
      "5点\nクリアで止まる"
    ],
    "notes": [
      "scoreは今の点数、goalは目標。",
      "score >= goalで目標以上か調べる。",
      "目標を変えたら、直前とクリア後も試す。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "const goal = 5;",
      "after": "const goal = 3;",
      "instruction": "goalの数字を5から3へ変える。",
      "expected": "2点では続けられ、3点でクリアして押せなくなる。"
    },
    "lookFor": [
      [
        "#score",
        "① 今の得点"
      ],
      [
        "#message",
        "② 目標と結果"
      ],
      [
        "#collect",
        "③ クリアで止まる"
      ]
    ],
    "sourceHash": "1a3e2ccceabd",
    "width": 608,
    "height": 308,
    "pixelWidth": 2432,
    "pixelHeight": 1236,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l1-lesson03-preview.png",
    "diagram": "assets/web-course-visuals/web1-l1-lesson03-diagram.svg",
    "code": "assets/web-course-visuals/web1-l1-lesson03-code.svg"
  },
  "web1-l1-lesson04": {
    "kind": "storage",
    "headline": "2つの保存を使い分ける",
    "nodes": [
      "学習コード\nHTML・CSS・JS",
      "クラウド保存\n続きから学ぶ",
      "HTMLファイル\n端末で遊ぶ"
    ],
    "notes": [
      "「学習内容を保存」はログイン中の学習記録。",
      "「HTMLを保存」は単独で開くファイル。",
      "ファイルで開けてもネット公開とは別。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "score = 0; render();",
      "after": "score = 0; render();",
      "instruction": "やり直しの処理で、点数と表示の両方を戻す場所を探す。",
      "expected": "クリア後でも0点になり、もう一度ボタンを押せる。"
    },
    "lookFor": [
      [
        "#score",
        "① 得点"
      ],
      [
        "#collect",
        "② 遊ぶ"
      ],
      [
        "#reset",
        "③ やり直す"
      ]
    ],
    "sourceHash": "f7f96871187d",
    "width": 608,
    "height": 352,
    "pixelWidth": 2432,
    "pixelHeight": 1412,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l1-lesson04-preview.png",
    "diagram": "assets/web-course-visuals/web1-l1-lesson04-diagram.svg",
    "code": "assets/web-course-visuals/web1-l1-lesson04-code.svg"
  },
  "web1-l1-lesson05": {
    "kind": "image",
    "headline": "画像の3つの指定",
    "nodes": [
      "src\n画像の場所",
      "alt\n内容の説明",
      "width・height\n表示の大きさ"
    ],
    "notes": [
      "見本は星の画像をHTMLに埋め込んでいる。",
      "altは読み上げや画像を読めない場合にも役立つ。",
      "実際のファイルを使うときは画像とパスをそろえる。"
    ],
    "change": {
      "language": "HTML",
      "before": "alt=\"黄色い星\" width=\"100\" height=\"100\"",
      "after": "alt=\"得点になる星\" width=\"50\" height=\"50\"",
      "instruction": "srcはそのままで、説明と縦横の大きさを変える。",
      "expected": "星が半分の大きさになり、説明も内容に合う。"
    },
    "lookFor": [
      [
        "img",
        "① 埋め込み画像"
      ],
      [
        "#score",
        "② 得点"
      ],
      [
        "#collect",
        "③ 遊ぶ"
      ]
    ],
    "sourceHash": "86d2e11ec9b9",
    "width": 608,
    "height": 429,
    "pixelWidth": 2432,
    "pixelHeight": 1720,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l1-lesson05-preview.png",
    "diagram": "assets/web-course-visuals/web1-l1-lesson05-diagram.svg",
    "code": "assets/web-course-visuals/web1-l1-lesson05-code.svg"
  },
  "web1-l1-lesson06": {
    "kind": "flow",
    "headline": "作ったことを伝えよう",
    "nodes": [
      "作る\n紹介＋ゲーム",
      "確かめる\nクリアとリセット",
      "発表する\n感想から直す"
    ],
    "notes": [
      "見出し・文章・リスト・画像を組み合わせる。",
      "変更した場所と理由を説明する。",
      "感想から1か所直し、もう一度試す。"
    ],
    "change": {
      "language": "HTML",
      "before": "<p>作者：スター</p>",
      "after": "<p>作者：わたしのニックネーム</p>",
      "instruction": "作者の紹介をニックネームに変える。個人情報は載せない。",
      "expected": "紹介を読んだ人が、遊び方を理解して始められる。"
    },
    "lookFor": [
      [
        "h1",
        "① 作品名"
      ],
      [
        "img",
        "② 世界観を伝える絵"
      ],
      [
        "#reset",
        "③ 繰り返し遊ぶ"
      ]
    ],
    "sourceHash": "a9cf8cfb2dc6",
    "width": 608,
    "height": 661,
    "pixelWidth": 2432,
    "pixelHeight": 2648,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l1-lesson06-preview.png",
    "diagram": "assets/web-course-visuals/web1-l1-lesson06-diagram.svg",
    "code": "assets/web-course-visuals/web1-l1-lesson06-code.svg"
  },
  "web1-l2-lesson01": {
    "kind": "box",
    "headline": "CSSは内側と外側を分けて考える",
    "nodes": [
      "margin\n外側の余白",
      "border\n要素の枠",
      "padding\n内側の余白"
    ],
    "notes": [
      "colorは文字色、backgroundは背景。",
      "paddingとmarginの場所は違う。",
      "見た目を変えてもidと動作は保つ。"
    ],
    "change": {
      "language": "CSS",
      "before": "background: #eef4ff;",
      "after": "background: #fff9e8;",
      "instruction": "bodyの背景色を薄い青からクリーム色へ変える。",
      "expected": "背景が変わっても、文字が読めてゲームが動く。"
    },
    "lookFor": [
      [
        "h1",
        "① 見出し"
      ],
      [
        "#collect",
        "② ボタンの形"
      ],
      [
        "main",
        "③ 余白と背景"
      ]
    ],
    "sourceHash": "a660154129de",
    "width": 608,
    "height": 308,
    "pixelWidth": 2432,
    "pixelHeight": 1236,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l2-lesson01-preview.png",
    "diagram": "assets/web-course-visuals/web1-l2-lesson01-diagram.svg",
    "code": "assets/web-course-visuals/web1-l2-lesson01-code.svg"
  },
  "web1-l2-lesson02": {
    "kind": "grid",
    "headline": "Gridで宝箱をそろえる",
    "nodes": [
      "3列\n幅を3等分",
      "gap\n箱の間を空ける",
      "箱を押す\n宝かを判定"
    ],
    "notes": [
      ".mapが箱全体、.map buttonが各ボタン。",
      "repeat(3, ...)で3列にする。",
      "狭い幅の2列指定は@mediaで切り替える。"
    ],
    "change": {
      "language": "CSS",
      "before": "gap: 12px;",
      "after": "gap: 20px;",
      "instruction": "mapのgapを広くし、ボタンの間隔を比べる。",
      "expected": "箱の間隔が広がり、押し間違えにくくなる。"
    },
    "lookFor": [
      [
        ".map",
        "① グリッド"
      ],
      [
        "[data-box=\"1\"]",
        "② 宝の箱"
      ],
      [
        "#message",
        "③ 結果の文字"
      ]
    ],
    "sourceHash": "a728993c1405",
    "width": 608,
    "height": 295,
    "pixelWidth": 2432,
    "pixelHeight": 1184,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l2-lesson02-preview.png",
    "diagram": "assets/web-course-visuals/web1-l2-lesson02-diagram.svg",
    "code": "assets/web-course-visuals/web1-l2-lesson02-code.svg"
  },
  "web1-l2-lesson03": {
    "kind": "state",
    "headline": "見た目と操作できる状態をそろえる",
    "nodes": [
      "未発見\nどの箱も押せる",
      "発見\nfoundの印＋文字",
      "やり直し\n印と無効を戻す"
    ],
    "notes": [
      "foundクラスは見た目の印。",
      "disabledは押せるかどうか。",
      "リセットでは両方とメッセージを戻す。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "box.classList.remove('found');",
      "after": "box.classList.remove('found');",
      "instruction": "リセットでfoundを外す処理とdisabledをfalseへ戻す処理を見つける。",
      "expected": "宝発見の印が消え、もう一度箱を押せる。"
    },
    "lookFor": [
      [
        ".map",
        "① 選べる箱"
      ],
      [
        "#message",
        "② 色以外でも伝える"
      ],
      [
        "#reset",
        "③ 状態を戻す"
      ]
    ],
    "sourceHash": "271cd09396ba",
    "width": 608,
    "height": 339,
    "pixelWidth": 2432,
    "pixelHeight": 1360,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l2-lesson03-preview.png",
    "diagram": "assets/web-course-visuals/web1-l2-lesson03-diagram.svg",
    "code": "assets/web-course-visuals/web1-l2-lesson03-code.svg"
  },
  "web1-l2-lesson04": {
    "kind": "responsive",
    "headline": "画面幅に合わせて列数を変える",
    "nodes": [
      "PC・広い画面\n3列",
      "480px以下\n2列",
      "どちらも\n同じゲーム"
    ],
    "notes": [
      "viewportはスマホの幅を正しく使う指定。",
      "@mediaで幅の条件を書く。",
      "小さい画面でも押せる大きさを保つ。"
    ],
    "change": {
      "language": "CSS",
      "before": "max-width: 480px",
      "after": "max-width: 600px",
      "instruction": "画面幅の切り替え条件を480pxから600pxへ変える。",
      "expected": "600px以下で2列になり、広い画面は3列のまま。"
    },
    "lookFor": [
      [
        ".map",
        "① 6つの箱"
      ],
      [
        "[data-box=\"1\"]",
        "② 同じ宝の判定"
      ],
      [
        "#reset",
        "③ 再スタート"
      ]
    ],
    "sourceHash": "8c309a153f61",
    "width": 608,
    "height": 431,
    "pixelWidth": 2432,
    "pixelHeight": 1728,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l2-lesson04-preview.png",
    "diagram": "assets/web-course-visuals/web1-l2-lesson04-diagram.svg",
    "code": "assets/web-course-visuals/web1-l2-lesson04-code.svg"
  },
  "web1-l2-lesson05": {
    "kind": "flex",
    "headline": "Flexboxは順番に並べて折り返す",
    "nodes": [
      "説明1\n箱を選ぶ",
      "説明2\n宝を探す",
      "説明3\nもう一度"
    ],
    "notes": [
      "display:flexで一方向に並べる。",
      "flex-wrap:wrapで幅に合わせて折り返す。",
      "箱の行と列はGrid、説明パネルはFlexbox。"
    ],
    "change": {
      "language": "CSS",
      "before": ".instructions { display: flex; flex-wrap: wrap; gap: 8px; }",
      "after": ".instructions { display: flex; flex-wrap: wrap; gap: 16px; }",
      "instruction": "説明パネルの間隔を広げ、狭い幅で折り返すか試す。",
      "expected": "カードが重ならず、読む順番と表示順がそろう。"
    },
    "lookFor": [
      [
        ".instructions",
        "① 説明パネル"
      ],
      [
        ".map",
        "② 宝箱のGrid"
      ],
      [
        "#reset",
        "③ やり直し"
      ]
    ],
    "sourceHash": "453f45bf9ac5",
    "width": 608,
    "height": 435,
    "pixelWidth": 2432,
    "pixelHeight": 1744,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l2-lesson05-preview.png",
    "diagram": "assets/web-course-visuals/web1-l2-lesson05-diagram.svg",
    "code": "assets/web-course-visuals/web1-l2-lesson05-code.svg"
  },
  "web1-l2-lesson06": {
    "kind": "access",
    "headline": "見える・読める・操作できる",
    "nodes": [
      "文字と枠\n色だけに頼らない",
      "フォーカス\n操作位置を示す",
      "動きを減らす\n端末設定に対応"
    ],
    "notes": [
      "発見のメッセージと枠を両方使う。",
      "Tabで移動して現在位置を確かめる。",
      "動きを減らす設定でも意味が通るようにする。"
    ],
    "change": {
      "language": "CSS",
      "before": "transition: background .2s, transform .2s;",
      "after": "transition: background .4s, transform .4s;",
      "instruction": "変化の時間を少し長くして、動きを減らす指定も確認する。",
      "expected": "発見時の変化がゆっくりになり、動きを減らす設定では止まる。"
    },
    "lookFor": [
      [
        ".map",
        "① 押しやすい箱"
      ],
      [
        "#message",
        "② 文字で結果を伝える"
      ],
      [
        "#reset",
        "③ キーボードでも操作"
      ]
    ],
    "sourceHash": "bee72b66fcc5",
    "width": 608,
    "height": 339,
    "pixelWidth": 2432,
    "pixelHeight": 1360,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l2-lesson06-preview.png",
    "diagram": "assets/web-course-visuals/web1-l2-lesson06-diagram.svg",
    "code": "assets/web-course-visuals/web1-l2-lesson06-code.svg"
  },
  "web1-l3-lesson01": {
    "kind": "variable",
    "headline": "得点の箱に2ずつ足す",
    "nodes": [
      "score = 0\n最初の値",
      "score + 2\n押すたびに加算",
      "score >= goal\n目標以上で終了"
    ],
    "notes": [
      "letは変わる値、constは再代入しない値。",
      "=は代入、>=は比較。",
      "目標を超える場合も含めてテストする。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "score = score + 2;",
      "after": "score = score + 3;",
      "instruction": "加点を2から3に変え、目標10点までの回数を予想する。",
      "expected": "3・6・9・12点と増え、4回目で止まる。"
    },
    "lookFor": [
      [
        "#score",
        "① 変わる値"
      ],
      [
        "#message",
        "② 目標との比較"
      ],
      [
        "#reset",
        "③ 初期化"
      ]
    ],
    "sourceHash": "194691bf506e",
    "width": 608,
    "height": 352,
    "pixelWidth": 2432,
    "pixelHeight": 1412,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l3-lesson01-preview.png",
    "diagram": "assets/web-course-visuals/web1-l3-lesson01-diagram.svg",
    "code": "assets/web-course-visuals/web1-l3-lesson01-code.svg"
  },
  "web1-l3-lesson02": {
    "kind": "branch",
    "headline": "じゃんけんの3つの道",
    "nodes": [
      "同じ手？\nあいこ",
      "勝つ組み合わせ？\n勝ち",
      "それ以外\n負け"
    ],
    "notes": [
      "手の番号はグー0・チョキ1・パー2。",
      "乱数で相手の番号を選ぶ。",
      "相手を固定すると全分岐を確実に試せる。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "Math.floor(Math.random() * 3)",
      "after": "0",
      "instruction": "相手の手を一時的にグーの0へ固定する。",
      "expected": "グーであいこ、チョキで負け、パーで勝ち。確認後は乱数へ戻す。"
    },
    "lookFor": [
      [
        "[data-hand=\"0\"]",
        "① 自分の手"
      ],
      [
        "[data-hand=\"2\"]",
        "② 別の手も試す"
      ],
      [
        "#message",
        "③ 相手と勝敗"
      ]
    ],
    "sourceHash": "3802a5a7f7f3",
    "width": 608,
    "height": 259,
    "pixelWidth": 2432,
    "pixelHeight": 1040,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l3-lesson02-preview.png",
    "diagram": "assets/web-course-visuals/web1-l3-lesson02-diagram.svg",
    "code": "assets/web-course-visuals/web1-l3-lesson02-code.svg"
  },
  "web1-l3-lesson03": {
    "kind": "function",
    "headline": "入力・判定・表示を分ける",
    "nodes": [
      "引数\n自分と相手の手",
      "judge\n勝敗を返す",
      "render\n数と結果を表示"
    ],
    "notes": [
      "関数に処理の役割ごとの名前を付ける。",
      "勝ち数と対戦数は別の変数。",
      "リセットで変数と表示を両方戻す。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "if (player === computer) return 'あいこ';",
      "after": "if (player === computer) return '同じ手だね';",
      "instruction": "judge関数の戻り値を変更し、表示に届くまでを追う。",
      "expected": "同じ手のときの表示だけが変わり、勝ち数は増えない。"
    },
    "lookFor": [
      [
        "[data-hand=\"0\"]",
        "① 手を入力"
      ],
      [
        "#rounds",
        "② 対戦数"
      ],
      [
        "#score",
        "③ 勝った回数"
      ]
    ],
    "sourceHash": "d7221328d177",
    "width": 608,
    "height": 352,
    "pixelWidth": 2432,
    "pixelHeight": 1412,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l3-lesson03-preview.png",
    "diagram": "assets/web-course-visuals/web1-l3-lesson03-diagram.svg",
    "code": "assets/web-course-visuals/web1-l3-lesson03-code.svg"
  },
  "web1-l3-lesson04": {
    "kind": "array",
    "headline": "問題を配列から1つずつ取り出す",
    "nodes": [
      "questions[0]\n1問目",
      "questions[1]\n2問目",
      "questions[2]\n3問目"
    ],
    "notes": [
      "配列の番号は0から始まる。",
      "問題文・選択肢・正解をセットにする。",
      "回答後は選択肢を止め、次へ進む。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "text: '見出しのタグは？'",
      "after": "text: '大きな見出しに使うタグは？'",
      "instruction": "1問目の問題文だけを書き換え、選択肢との対応を確かめる。",
      "expected": "1問目の文だけが変わり、正解番号0はh1のまま。"
    },
    "lookFor": [
      [
        "#question",
        "① 今の問題"
      ],
      [
        "#choices",
        "② 選択肢"
      ],
      [
        "#next",
        "③ 次へ進む"
      ]
    ],
    "sourceHash": "9e38a342adc7",
    "width": 608,
    "height": 352,
    "pixelWidth": 2432,
    "pixelHeight": 1412,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l3-lesson04-preview.png",
    "diagram": "assets/web-course-visuals/web1-l3-lesson04-diagram.svg",
    "code": "assets/web-course-visuals/web1-l3-lesson04-code.svg"
  },
  "web1-l3-lesson05": {
    "kind": "validation",
    "headline": "入力を先に確かめてから判定する",
    "nodes": [
      "入力\n文字から数へ",
      "検証\n整数・1〜10？",
      "判定\n大きい・小さい・正解"
    ],
    "notes": [
      "空欄は数に直す前にも調べる。",
      "範囲外と小数では回数を増やさない。",
      "正解を固定すると大小と正解を試せる。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "Math.floor(Math.random() * 10) + 1",
      "after": "7",
      "instruction": "最初のsecretを一時的に7へ固定し、6・8・7を入力する。",
      "expected": "もっと大きい・もっと小さい・正解の順に表示される。"
    },
    "lookFor": [
      [
        "#guess",
        "① 数字の入力"
      ],
      [
        "#checkGuess",
        "② 判定する"
      ],
      [
        "#message",
        "③ 大小のヒント"
      ]
    ],
    "sourceHash": "5c5355aeea4c",
    "width": 608,
    "height": 352,
    "pixelWidth": 2432,
    "pixelHeight": 1412,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l3-lesson05-preview.png",
    "diagram": "assets/web-course-visuals/web1-l3-lesson05-diagram.svg",
    "code": "assets/web-course-visuals/web1-l3-lesson05-code.svg"
  },
  "web1-l3-lesson06": {
    "kind": "history",
    "headline": "直近5回を残す配列",
    "nodes": [
      "push\n新しい記録を追加",
      "5件を超えたら\nshiftで古い記録を外す",
      "forEach\n画面に並べ直す"
    ],
    "notes": [
      "対戦数は6でも履歴は最大5件。",
      "配列の内容からリストを描き直す。",
      "リセットで配列の中身も空にする。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "history.length > 5",
      "after": "history.length > 3",
      "instruction": "履歴の上限を5から3へ変える。",
      "expected": "4回目に最初の記録が外れ、対戦数は4のまま残る。"
    },
    "lookFor": [
      [
        "#rounds",
        "① 全対戦数"
      ],
      [
        "#history",
        "② 直近の記録"
      ],
      [
        "#reset",
        "③ 履歴も戻す"
      ]
    ],
    "sourceHash": "1229408be6ca",
    "width": 608,
    "height": 428,
    "pixelWidth": 2432,
    "pixelHeight": 1716,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l3-lesson06-preview.png",
    "diagram": "assets/web-course-visuals/web1-l3-lesson06-diagram.svg",
    "code": "assets/web-course-visuals/web1-l3-lesson06-code.svg"
  },
  "web1-l4-lesson01": {
    "kind": "timeline",
    "headline": "終了時刻から残り時間を計算する",
    "nodes": [
      "開始\n今＋10秒",
      "プレイ中\n残り時間を表示",
      "期限\n0秒で加点を止める"
    ],
    "notes": [
      "Date.nowで現在時刻を調べる。",
      "再開始の前に古いタイマーを止める。",
      "終了後のクリックでも期限を確認する。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "Date.now() + 10000",
      "after": "Date.now() + 5000",
      "instruction": "制限時間を10秒から5秒へ変える。",
      "expected": "5秒で終了し、その後は得点が増えない。"
    },
    "lookFor": [
      [
        "#time",
        "① 残り時間"
      ],
      [
        "#start",
        "② 開始・やり直し"
      ],
      [
        "#collect",
        "③ 期限内だけ加点"
      ]
    ],
    "sourceHash": "3c70d8b64c4a",
    "width": 608,
    "height": 268,
    "pixelWidth": 2432,
    "pixelHeight": 1076,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l4-lesson01-preview.png",
    "diagram": "assets/web-course-visuals/web1-l4-lesson01-diagram.svg",
    "code": "assets/web-course-visuals/web1-l4-lesson01-code.svg"
  },
  "web1-l4-lesson02": {
    "kind": "mole",
    "headline": "出ている1匹だけをたたく",
    "nodes": [
      "9つの穴\n番号0〜8",
      "active\n今いる穴の番号",
      "たたいた後\n-1で出現なし"
    ],
    "notes": [
      "forで9つのボタンを作る。",
      "押した番号とactiveが同じときだけ加点。",
      "同じ1匹を連打しても1点だけ。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "let speed = 800;",
      "after": "let speed = 1200;",
      "instruction": "出現間隔を800から1200ミリ秒へ変える。",
      "expected": "同じ15秒でも、もぐらの移動がゆっくりになる。"
    },
    "lookFor": [
      [
        "#score",
        "① 得点"
      ],
      [
        "#holes",
        "② 9つの穴"
      ],
      [
        "#time",
        "③ 制限時間"
      ]
    ],
    "sourceHash": "992db6b4e529",
    "width": 608,
    "height": 492,
    "pixelWidth": 2432,
    "pixelHeight": 1972,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l4-lesson02-preview.png",
    "diagram": "assets/web-course-visuals/web1-l4-lesson02-diagram.svg",
    "code": "assets/web-course-visuals/web1-l4-lesson02-code.svg"
  },
  "web1-l4-lesson03": {
    "kind": "coordinates",
    "headline": "行と列の両方で当たりを調べる",
    "nodes": [
      "x\n右へ進むと増える",
      "y\n下へ進むと増える",
      "xもyも一致\n宝を獲得"
    ],
    "notes": [
      "左上は(0,0)、右下は(4,4)。",
      "端では0〜4の外へ出ない。",
      "&&は横と縦の両方が一致する条件。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "gemX = 4, gemY = 2",
      "after": "gemX = 3, gemY = 1",
      "instruction": "最初の宝の座標を(3,1)へ変える。",
      "expected": "右に3回、下に1回で最初の宝を取れる。"
    },
    "lookFor": [
      [
        "#board",
        "① 5×5の盤面"
      ],
      [
        "#player",
        "② 自分の位置"
      ],
      [
        "#gem",
        "③ 宝の位置"
      ]
    ],
    "sourceHash": "112b8e5b4739",
    "width": 608,
    "height": 620,
    "pixelWidth": 2432,
    "pixelHeight": 2484,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l4-lesson03-preview.png",
    "diagram": "assets/web-course-visuals/web1-l4-lesson03-diagram.svg",
    "code": "assets/web-course-visuals/web1-l4-lesson03-code.svg"
  },
  "web1-l4-lesson04": {
    "kind": "difficulty",
    "headline": "速さだけを変えて難しさを比べる",
    "nodes": [
      "簡単\n1200ms",
      "普通\n800ms",
      "難しい\n500ms"
    ],
    "notes": [
      "selectのvalueは文字なのでNumberで数へ。",
      "同じ制限時間で速さだけを比べる。",
      "変更は次のスタートから反映する。"
    ],
    "change": {
      "language": "HTML",
      "before": "value=\"1200\"",
      "after": "value=\"1500\"",
      "instruction": "簡単の出現間隔を1500ミリ秒へ変える。",
      "expected": "簡単を選んでスタートすると、さらにゆっくり出る。"
    },
    "lookFor": [
      [
        "#difficulty",
        "① 難易度を選ぶ"
      ],
      [
        "#start",
        "② 設定を反映"
      ],
      [
        "#holes",
        "③ 速さを比較"
      ]
    ],
    "sourceHash": "fa9f494e883b",
    "width": 608,
    "height": 550,
    "pixelWidth": 2432,
    "pixelHeight": 2204,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l4-lesson04-preview.png",
    "diagram": "assets/web-course-visuals/web1-l4-lesson04-diagram.svg",
    "code": "assets/web-course-visuals/web1-l4-lesson04-code.svg"
  },
  "web1-l4-lesson05": {
    "kind": "walls",
    "headline": "移動先を検証してから進む",
    "nodes": [
      "候補\n次のx・y",
      "壁と一致？\nその場で止まる",
      "壁でなければ\n位置を更新"
    ],
    "notes": [
      "壁も表示も同じ座標データを使う。",
      "someで壁に当たる候補を調べる。",
      "宝は壁と重ならない場所に置く。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "{x: 2, y: 0}",
      "after": "{x: 3, y: 0}",
      "instruction": "最初の壁を(2,0)から(3,0)へ移す。",
      "expected": "右に2回進め、3回目は壁の手前で止まる。"
    },
    "lookFor": [
      [
        "#board",
        "① 盤面"
      ],
      [
        ".wall",
        "② 通れない壁"
      ],
      [
        "#gem",
        "③ 宝まで回り道"
      ]
    ],
    "sourceHash": "deb34912575b",
    "width": 608,
    "height": 620,
    "pixelWidth": 2432,
    "pixelHeight": 2484,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l4-lesson05-preview.png",
    "diagram": "assets/web-course-visuals/web1-l4-lesson05-diagram.svg",
    "code": "assets/web-course-visuals/web1-l4-lesson05-code.svg"
  },
  "web1-l4-lesson06": {
    "kind": "state",
    "headline": "開始前・プレイ中・終了後を分ける",
    "nodes": [
      "開始前\n動かさない",
      "playing = true\n移動して集める",
      "playing = false\n期限で止める"
    ],
    "notes": [
      "移動前にも残り時間を調べる。",
      "終了後は移動も得点も進めない。",
      "再開始で位置・宝・時間・得点を戻す。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "Date.now() + 15000",
      "after": "Date.now() + 20000",
      "instruction": "終了時刻を15秒後から20秒後へ変える。",
      "expected": "20秒間遊べて、終了後は方向ボタンでも動かない。"
    },
    "lookFor": [
      [
        "#time",
        "① 時間"
      ],
      [
        "#board",
        "② 移動と当たり判定"
      ],
      [
        "#start",
        "③ 全状態を戻す"
      ]
    ],
    "sourceHash": "932330eb7448",
    "width": 608,
    "height": 729,
    "pixelWidth": 2432,
    "pixelHeight": 2920,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l4-lesson06-preview.png",
    "diagram": "assets/web-course-visuals/web1-l4-lesson06-diagram.svg",
    "code": "assets/web-course-visuals/web1-l4-lesson06-code.svg"
  },
  "web1-l5-lesson01": {
    "kind": "plan",
    "headline": "企画を小さなルールに落とす",
    "nodes": [
      "誰が遊ぶ？\n使う人を決める",
      "必須は3つ\n加点・終了・やり直し",
      "rules\n目標と加点を設定"
    ],
    "notes": [
      "まず動く最小の作品を完成させる。",
      "完成条件は操作で確かめられる文にする。",
      "入力した名前はtextContentで表示する。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "{ goal: 5, point: 1 }",
      "after": "{ goal: 8, point: 2 }",
      "instruction": "企画の目標を8点、1回の加点を2点へ変える。",
      "expected": "4回でクリアする。操作で確認できる完成条件になる。"
    },
    "lookFor": [
      [
        "#gameName",
        "① 作品名"
      ],
      [
        "#goal",
        "② 企画した目標"
      ],
      [
        "#collect",
        "③ ルールを試す"
      ]
    ],
    "sourceHash": "afc15ea26231",
    "width": 608,
    "height": 375,
    "pixelWidth": 2432,
    "pixelHeight": 1504,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l5-lesson01-preview.png",
    "diagram": "assets/web-course-visuals/web1-l5-lesson01-diagram.svg",
    "code": "assets/web-course-visuals/web1-l5-lesson01-code.svg"
  },
  "web1-l5-lesson02": {
    "kind": "storage",
    "headline": "ゲームの記録と学習コードは別々",
    "nodes": [
      "ゲームの最高得点\n同じブラウザに保存",
      "プレビュー\n保存できなくても遊ぶ",
      "学習コード\nログインしてクラウドへ"
    ],
    "notes": [
      "localStorageは別端末へ自動共有されない。",
      "try/catchで保存失敗を受け止める。",
      "公開後のサイトで再読み込みを試す。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "Math.max(best, score)",
      "after": "Math.max(best, score)",
      "instruction": "最高得点は下がらないことを、やり直し前後で確かめる。",
      "expected": "得点を0へ戻しても最高得点は残り、保存失敗でもゲームは動く。"
    },
    "lookFor": [
      [
        "#score",
        "① 今回の得点"
      ],
      [
        "#best",
        "② 最高得点"
      ],
      [
        "#storageStatus",
        "③ 保存できる環境か"
      ]
    ],
    "sourceHash": "496a4529d5ba",
    "width": 608,
    "height": 464,
    "pixelWidth": 2432,
    "pixelHeight": 1860,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l5-lesson02-preview.png",
    "diagram": "assets/web-course-visuals/web1-l5-lesson02-diagram.svg",
    "code": "assets/web-course-visuals/web1-l5-lesson02-code.svg"
  },
  "web1-l5-lesson03": {
    "kind": "test",
    "headline": "境界を確かめてから直す",
    "nodes": [
      "4点\nまだ遊べる",
      "5点\nクリアする",
      "クリア後\n加点しない"
    ],
    "notes": [
      "操作・期待・実際・修正を分けて書く。",
      "PCとスマホ、キーとタップで確認する。",
      "直した後は同じ操作で再テストする。"
    ],
    "change": {
      "language": "JavaScript",
      "before": "{ goal: 5, point: 1 }",
      "after": "{ goal: 3, point: 1 }",
      "instruction": "目標を3点にして、2点・3点・その後のテスト表を作る。",
      "expected": "境界の前後で、得点・文字・押せる状態を比べられる。"
    },
    "lookFor": [
      [
        "#score",
        "① 境界の得点"
      ],
      [
        "#collect",
        "② 押せるかを確認"
      ],
      [
        "#reset",
        "③ 再開始もテスト"
      ]
    ],
    "sourceHash": "00ac0962949f",
    "width": 608,
    "height": 464,
    "pixelWidth": 2432,
    "pixelHeight": 1860,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l5-lesson03-preview.png",
    "diagram": "assets/web-course-visuals/web1-l5-lesson03-diagram.svg",
    "code": "assets/web-course-visuals/web1-l5-lesson03-code.svg"
  },
  "web1-l5-lesson04": {
    "kind": "publish",
    "headline": "ファイルを公開URLへ届ける",
    "nodes": [
      "index.html\n作品ファイル",
      "GitHub・Actions\n登録して公開処理",
      "公開URL\n別の端末で確認"
    ],
    "notes": [
      "file:///で開くこととネット公開は違う。",
      "素材と個人情報を先生と確認する。",
      "更新後も公開成功を待って再確認する。"
    ],
    "change": {
      "language": "HTML",
      "before": "<p>作者：スター（ニックネーム）</p>",
      "after": "<p>作者：自分のニックネーム</p>",
      "instruction": "作者の紹介と遊び方を、自分の作品に合わせて書き換える。",
      "expected": "公開URLを開いた人が、説明を読んで遊べる。"
    },
    "lookFor": [
      [
        "h1",
        "① 作品名"
      ],
      [
        "#collect",
        "② 遊べる作品"
      ],
      [
        "#best",
        "③ 公開後に保存を確認"
      ]
    ],
    "sourceHash": "51cc9a84a569",
    "width": 608,
    "height": 704,
    "pixelWidth": 2432,
    "pixelHeight": 2816,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l5-lesson04-preview.png",
    "diagram": "assets/web-course-visuals/web1-l5-lesson04-diagram.svg",
    "code": "assets/web-course-visuals/web1-l5-lesson04-code.svg"
  },
  "web1-l5-lesson05": {
    "kind": "theme",
    "headline": "見た目だけを切り替える",
    "nodes": [
      "感想\nまぶしい・読みにくい",
      "テーマ選択\nday / night",
      "CSSと保存\nルールは変えない"
    ],
    "notes": [
      "設定の保存は最高得点と別のキー。",
      "両テーマで文字とフォーカスを確認。",
      "感想をくれた人にもう一度試してもらう。"
    ],
    "change": {
      "language": "CSS",
      "before": "background:#0e1930;",
      "after": "background:#17283c;",
      "instruction": "夜テーマの背景を変更し、文字との読みやすさを比べる。",
      "expected": "夜テーマの背景だけが変わり、得点ルールは同じまま。"
    },
    "lookFor": [
      [
        "#theme",
        "① テーマ選択"
      ],
      [
        "#collect",
        "② 操作性を保つ"
      ],
      [
        "#best",
        "③ ゲームの記録"
      ]
    ],
    "sourceHash": "91979d83c74f",
    "width": 608,
    "height": 522,
    "pixelWidth": 2432,
    "pixelHeight": 2092,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l5-lesson05-preview.png",
    "diagram": "assets/web-course-visuals/web1-l5-lesson05-diagram.svg",
    "code": "assets/web-course-visuals/web1-l5-lesson05-code.svg"
  },
  "web1-l5-lesson06": {
    "kind": "publish",
    "headline": "変更・確認・公開の履歴を残す",
    "nodes": [
      "作業ブランチ\n変更を分ける",
      "PR\n差分とテストを確認",
      "マージ・Actions\n公開して版を確認"
    ],
    "notes": [
      "前の動く版を残してから変更する。",
      "何を直し、何を試したかを書く。",
      "公開後の版と動作を確かめる。"
    ],
    "change": {
      "language": "HTML",
      "before": "id=\"version\">1.0.0",
      "after": "id=\"version\">1.0.1",
      "instruction": "表示する版を1.0.1へ更新し、変更履歴にも理由を追記する。",
      "expected": "公開した版を見分けられ、変更とテストをたどれる。"
    },
    "lookFor": [
      [
        "#version",
        "① 作品の版"
      ],
      [
        "#collect",
        "② 更新後も遊べる"
      ],
      [
        "#releaseNotes",
        "③ 変更履歴"
      ]
    ],
    "sourceHash": "e5ec7412f455",
    "width": 608,
    "height": 604,
    "pixelWidth": 2432,
    "pixelHeight": 2420,
    "density": 4,
    "format": "png",
    "poster": "assets/web-course-visuals/web1-l5-lesson06-preview.png",
    "diagram": "assets/web-course-visuals/web1-l5-lesson06-diagram.svg",
    "code": "assets/web-course-visuals/web1-l5-lesson06-code.svg"
  }
};
