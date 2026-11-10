// Generated from html-level1-workbook.json. Edit the JSON source.
export const DEFAULT_WORKBOOK={
  "schemaVersion": 1,
  "revision": "default-1",
  "pages": [
    {
      "id": "p01",
      "title": "教材の使い方とHTMLの基礎",
      "intro": "まずは教材の進め方を読み、HTMLでどのような学習をするか確認しましょう。",
      "editorHint": "実習のページでは、HTMLエディターにコードを入力して表示を確認します。今は教材と画面の使い方を確認しましょう。",
      "sample": "",
      "mode": "introduction",
      "document": {
        "title": "教材の使い方とHTMLの基礎",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                01 / 12          LESSON 01 Webページを作ってみよう\n\n\n\n\nブラウザとHTMLの基本からはじめる、最初のWeb制作。\n\n\n\n 今日のゴール                               ● ● ● 自己紹介 — ブラウザの画面\n\n\n                                          ←　→　↻　     file:///.../index.html\nコードが\n                                     ブラウザが表示する内容\nWebページに        こんにちは！\n\n\n                                 わたしの自己紹介ページへようこそ。変わるしくみを知ろ\nう。\n\n\n「書く道具」と「見る道具」の違いを知り、基本のHTML\nを書いて、ブラウザに表示させます。             好きなものを紹介します\n\n\n ゴールは4つ　① ブラウザとエディターを区別でき\n る　② .htmlファイルを開ける　③ headとbodyの役\n 割が分かる　④ 自己紹介ページを作れる\n\n\n\n 学習の進み方\n\n 01           02           03           04\n Input（学ぶ）        Output（実践する）    Check（確認する）     Reflect（振り返る）\n\n 教材を読む・説明を聞く      コードを書く・動かす       見本・ねらいと比べる       できたことと次の課題\n\n\n\n この教材の使い方\n\n\n  教材を読む                自分で操作する\n\n 説明と図を見ながら、分からない言葉は先生に聞こう。      Learning StudioのWeb開発Lv.1で、HTMLタブに入力し\n                             て実行しよう。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     1 / 12",
        "edited": false
      },
      "tasks": [],
      "introSections": [
        {
          "title": "この教材の進め方",
          "body": "必要に応じて教材に戻り、コードを直してもう一度確認しましょう。\n左の説明や図を読みながら、分からない言葉は先生に聞こう。",
          "steps": [
            {
              "term": "Input（インプット）",
              "description": "教材を読んだり先生の説明を聞いたりして、知識を取り入れる。"
            },
            {
              "term": "Output（アウトプット）",
              "description": "学んだことを使ってコードを書き、実際に動かしてみる。"
            },
            {
              "term": "Check（確認）",
              "description": "表示が教材の見本や自分のねらいに合っているかを確かめる。"
            },
            {
              "term": "Reflect（振り返り）",
              "description": "できたこと・できなかったことを振り返り、次の学習につなげる。"
            }
          ]
        },
        {
          "title": "HTMLのはじめの一歩",
          "body": "HTMLは、Webページの内容や構造を表すために使う言葉です。この教材で、コードが画面に表示されるしくみを学びます。"
        },
        {
          "title": "画面の使い方",
          "body": "上の「前のページ」「次へ」で教材を進めます。\n教材の「表示倍率」で文字や図を読みやすい大きさにします。\n実習では「エディターを開く」からコードを入力し、表示を確認します。"
        }
      ]
    },
    {
      "id": "p02",
      "title": "Webページが見えるしくみ・ブラウザ",
      "intro": "「書く → HTMLファイル → ブラウザで見る」という流れと、ブラウザの操作を覚えよう。",
      "editorHint": "HTMLタブでコードを修正すると、右側のプレビューに新しい表示が出ます。",
      "sample": "",
      "document": {
        "title": "Webページが見えるしくみ・ブラウザ",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                02 / 12          STEP 01 Webページが見えるしくみ\n\n\n\n\nHTMLを書くと、どうして画面に文字が出るのだろう？\n\n\n Webページは「データ」と「表示」の組み合わせ\n\n  ⌨       ▤      \n       →       →     エディター              HTMLファイル            ブラウザ\n    人がHTMLコードを書く                  index.htmlとして保存           コードを読み、ページに表示\n\n\n\n\n 例： HTMLに <h1>こんにちは</h1> と書くと、ブラウザは大きな見出し「こんにちは」を表示します。\n\n\n  ブラウザとは？              エディターとは？\n\n Webページを見る・操作するソフト。Chrome、Edge、   HTMLなどのコードを書く・直すソフト。メモ帳、VS\n Firefoxなど。アドレス欄にURLを入力してWebサイトへ     Code、Learning StudioのHTMLエディターなどがあり\n アクセスします。                     ます。\n\n\n\n ブラウザの画面を見てみよう\n\n\n ● ● ● 　はじめてのWebページ　 ×\n\n ←  →  ↻     https://example.com                 ☆\n\n\n\n ← 戻る           → 進む             ↻ 更新               URL欄\n\n ひとつ前に見ていたページ    戻ったあと、次のページへ。   今のページを読み直す。     Webページの場所（アドレ\n へ。                                              ス）を表示。\n\n\n ネット上とパソコン内は違う\n\n\n インターネット上のWebサイト            自分のパソコンにあるHTML\n\n ブラウザに https://... のURLを入力して表示。サー        index.html をブラウザで開いて表示。アドレス欄が\n バーからページのデータを受け取ります。                  file:///... のようになります。\n\n\n\n 考えてみよう：「HTMLを保存するソフト」と「HTMLを表示するソフト」はそれぞれ何でしょう？\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     2 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p02-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "HTMLコードを書く道具は？",
          "required": true,
          "options": [
            "ブラウザ",
            "エディター",
            "アドレスバー"
          ],
          "correct": 1,
          "why": "エディターはコードを書いたり直したりする道具です。"
        },
        {
          "id": "p02-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "HTMLをWebページとして表示する道具は？",
          "required": true,
          "options": [
            "ブラウザ",
            "フォルダー",
            "メモ帳だけ"
          ],
          "correct": 0,
          "why": "ChromeやEdgeなどがブラウザです。"
        },
        {
          "id": "p02-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "今のページをもう一度読み込むボタンは？",
          "required": true,
          "options": [
            "← 戻る",
            "↻ 更新",
            "→ 進む"
          ],
          "correct": 1,
          "why": "更新は現在のページを読み直します。"
        },
        {
          "id": "p02-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "URLを入力する場所は？",
          "required": true,
          "options": [
            "見出し",
            "アドレスバー",
            "タイトルタグ"
          ],
          "correct": 1,
          "why": "アドレスバーにページの場所を入力します。"
        },
        {
          "id": "p02-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "「file:///」から始まるアドレスは？",
          "required": true,
          "options": [
            "自分のPC内のファイルのことが多い",
            "必ず世界に公開済み",
            "必ず動画サイト"
          ],
          "correct": 0,
          "why": "自分の端末のファイルをブラウザで開いている例です。"
        },
        {
          "id": "p02-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "check",
          "text": "PDFのブラウザ図で「戻る」「進む」「更新」を指さして言えた",
          "required": true
        },
        {
          "id": "p02-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "text",
          "text": "エディターとブラウザの役割の違いを説明しよう",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        },
        {
          "id": "p02-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "URLとファイル名はどう違うと思う？",
          "required": false,
          "hint": "Web上の場所と、ファイルの名前を比べよう。"
        }
      ]
    },
    {
      "id": "p03",
      "title": "HTML・CSS・JavaScriptとエディター",
      "intro": "3つの技術の役割を知り、Learning Studioのボタンを使ってみよう。",
      "editorHint": "フローティングエディターで「HTML」を選び、コードを変更して「プレビューを更新」を押そう。",
      "sample": "<h1>こんにちは！</h1>\n<p>HTMLの練習中です。</p>",
      "document": {
        "title": "HTML・CSS・JavaScriptとエディター",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                03 / 12          STEP 02 エディターとブラウザを使い分ける\n\n\n\n\nLearning Studioでも、ふだんのパソコンでも、役割は同じ。\n\n\n Webページをつくる3つの技術\n\n\n HTML ＝ 内容・構造            CSS ＝ 見た目                    JavaScript ＝ 動作\n\n 見出し、文章、画像、リンクな     色、文字の大きさ、余白、配置な    ボタンで表示を変えるなど、動き\n\n ど、「何があるか」を表します。    どを決めます。            を加えます。\n\n\n   <h1>こんにちは</h1>                           color: blue;                                  alert(\"OK\");\n\n\n\n レベル1では HTMLを中心に練習します。CSS・JavaScriptは後の学習で詳しく扱います。\n\n\n  Learning Studioのエディターでの操作\n\n\n Learning Studio　/　Web開発 Lv.1　/　HTML入門\n\n\n   HTML    CSS     JavaScript                  プレビュー\n\n   <h1>こんにちは！</h1>            こんにちは！\n   <p>HTMLの練習中です。</p>\n\n                                HTMLの練習中です。\n\n\n       ▶ プレビューを更新　｜　☁ 学習内容を保存\n\n\n\n\n   1  HTML タブを選ぶ            2 コードを書きかえる           3 「プレビューを更新」を押      4 「学習内容を保存」を押す\n\n                                    す\n\n\n  Learning Studioの保存               HTMLを保存（ダウンロード）\n\n 「学習内容を保存」は、学習中のコードを生徒の      「HTMLを保存」ボタンを使うと、ブラウザで開ける\n Firebase記録に保存する機能です。HTMLファイルのダ      .html ファイルをダウンロードできます。\n ウンロードとは別です。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     3 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p03-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "HTMLが主に担当するものは？",
          "required": true,
          "options": [
            "Webページの内容と構造",
            "文字の色だけ",
            "クリック後の動作だけ"
          ],
          "correct": 0,
          "why": "HTMLは見出しや文章などの構造を表します。"
        },
        {
          "id": "p03-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "CSSが主に担当するものは？",
          "required": true,
          "options": [
            "ページの保存先",
            "色や文字サイズなど見た目",
            "HTMLファイルの拡張子"
          ],
          "correct": 1,
          "why": "CSSは見た目を整える技術です。"
        },
        {
          "id": "p03-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "JavaScriptが主に担当するものは？",
          "required": true,
          "options": [
            "ページに動きを付ける",
            "PDFを印刷する",
            "HTMLの代わりに文字を入力する"
          ],
          "correct": 0,
          "why": "ボタンなどに動作を加えられます。"
        },
        {
          "id": "p03-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "コードを変更した後、表示を確かめるボタンは？",
          "required": true,
          "options": [
            "学習内容を保存",
            "プレビューを更新",
            "ログアウト"
          ],
          "correct": 1,
          "why": "「プレビューを更新」で変更を表示します。"
        },
        {
          "id": "p03-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "Firebaseに学習中のコードを記録するボタンは？",
          "required": true,
          "options": [
            "学習内容を保存",
            "HTMLを保存（ダウンロード）",
            "最初に戻す"
          ],
          "correct": 0,
          "why": "クラウド保存と .html のダウンロードは別です。"
        },
        {
          "id": "p03-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "code",
          "text": "エディターに見出し <h1> を入れてみよう",
          "required": true,
          "test": "heading",
          "hint": "HTMLタブに <h1>こんにちは！</h1> などを書こう。"
        },
        {
          "id": "p03-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": "HTMLタブとプレビューの場所を確認した",
          "required": true
        },
        {
          "id": "p03-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "「HTMLを保存」と「学習内容を保存」の違いを説明しよう",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    },
    {
      "id": "p04",
      "title": ".html拡張子・保存とブラウザで開く",
      "intro": "index.html を保存して開くまでの手順を理解しよう。",
      "editorHint": "エディターの「HTMLを保存」を使うと、ブラウザで開ける .html ファイルがダウンロードされます。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>はじめてのWebページ</title>\n</head>\n<body>\n  <h1>こんにちは！</h1>\n  <p>わたしはHTMLを勉強しています。</p>\n</body>\n</html>",
      "document": {
        "title": ".html拡張子・保存とブラウザで開く",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                04 / 12          STEP 03 拡張子 .html とファイルの開き方\n\n\n\n\n「HTMLファイル」を保存してブラウザで開く流れを実際に覚えよう。\n\n\n\n ファイル名の最後が「拡張子」\n\n                    index.html\n\n                       ファイル名　＋　HTMLファイルであることを表す拡張子\n\n\n\n  OK：index.html                               NG：index.html.txt\n\n HTMLコードを保存し、ブラウザで表示できます。     最後が .txt なのでテキストファイルです。ファイル名\n\n   index.html                          の表示設定を確認しましょう。index.html.txt\n\n\n\n 自分のパソコンで開く6ステップ\n\n\n  1 メモ帳（またはVS Code）を開きます。\n\n\n  2 下の短いHTMLコードを入力します。\n\n\n  3 名前を付けて保存→ ファイル名をindex.html にします。\n\n\n  4 メモ帳なら「ファイルの種類」をすべてのファイル、「文字コード」をUTF-8 にして保存します。\n\n\n  5  保存したindex.html を右クリック →プログラムから開く→ Chrome/Edgeを選びます。\n\n\n  6  直したらCtrl + S で保存し、ブラウザでCtrl + R を押して確認します。\n\n\n  <!DOCTYPE html>\n  <html lang=\"ja\">\n  <head><meta charset=\"UTF-8\"><title>練習</title></head>\n  <body><h1>はじめてのページ</h1></body>\n  </html>\n\n\n\n 大切：.htmlと名前を付けただけで自動的にWebページになるわけではありません。 ファイルの中に正しい\n HTMLコードが必要です。パソコン内で開けても、インターネット上に公開したことにはなりません。\n\n\n\n 確認：ブラウザのアドレス欄が file:///C:/... なら、ネット上ではなくパソコン内のファイルを開いています。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     4 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p04-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "HTMLファイルとして適切な名前は？",
          "required": true,
          "options": [
            "index.html",
            "index.html.txt",
            "index.png"
          ],
          "correct": 0,
          "why": ".html がファイル名の末尾になります。"
        },
        {
          "id": "p04-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "index.html.txt は何のファイル？",
          "required": true,
          "options": [
            "HTML",
            "拡張子が .txt のテキスト",
            "画像"
          ],
          "correct": 1,
          "why": "末尾の拡張子を確認しましょう。"
        },
        {
          "id": "p04-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "Windowsで保存したHTMLを開く例は？",
          "required": true,
          "options": [
            "右クリック→プログラムから開く→Chrome/Edge",
            "電卓を起動する",
            "PDFに変換しないと開けない"
          ],
          "correct": 0,
          "why": "ブラウザからローカルファイルとして開けます。"
        },
        {
          "id": "p04-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "HTMLを直した後、ブラウザで表示を確認する操作は？",
          "required": true,
          "options": [
            "Ctrl+R（更新）",
            "Ctrl+P（印刷）",
            "Alt+F4（終了）"
          ],
          "correct": 0,
          "why": "エディターで保存した後に更新します。"
        },
        {
          "id": "p04-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "ローカルのHTMLを開いただけでインターネットに公開される？",
          "required": true,
          "options": [
            "公開される",
            "公開されない",
            "必ずURLがhttpsになる"
          ],
          "correct": 1,
          "why": "PC内で表示できても公開されたことにはなりません。"
        },
        {
          "id": "p04-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "check",
          "text": "「HTMLを保存」で .html ファイルを作ってみた",
          "required": true
        },
        {
          "id": "p04-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": "ダウンロードした .html ファイルをブラウザで開いてみた",
          "required": true
        },
        {
          "id": "p04-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "メモ帳で文字化けを防ぐときに確認する文字コードは？",
          "required": false,
          "hint": "PDFの保存手順を見て答えよう。"
        }
      ]
    },
    {
      "id": "p05",
      "title": "HTML文書全体の構造",
      "intro": "DOCTYPE・html・head・bodyがどうつながるか理解しよう。",
      "editorHint": "「このページの見本コードを読み込む」を押したら、headとbodyを探してみよう。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>はじめてのWebページ</title>\n</head>\n<body>\n  <h1>こんにちは！</h1>\n  <p>わたしはHTMLを勉強しています。</p>\n</body>\n</html>",
      "document": {
        "title": "HTML文書全体の構造",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                05 / 12          STEP 04 HTML全体の基本構造\n\n\n\n\nWebページの「外側の入れ物」と「画面に表示する部分」を理解しよう。\n\n\n HTMLは大きく分けて「head」と「body」\n\n\n\n                                                 <!DOCTYPE html>\n           HTML文書\n                                                 <html lang=\"ja\">\n                                                 <head>\n                                                   <meta charset=\"UTF-8\">\n       <head>          <body>                                                   <meta name=\"viewport\" content=\"width=device-width,\n   ページについての    ページに表示する        initial-scale=1.0\">\n      情報          内容            <title>はじめてのWebページ</title>\n    文字コード・タイトル    見出し・文章・画像な        </head>\n        など             ど               <body>\n                                     <h1>こんにちは！</h1>\n                                 <p>わたしはHTMLを勉強しています。</p>\n                                                 </body>\n                                                 </html>\n\n\n\n ① 宣言         <!DOCTYPE html> …… 最初に書く、HTML文書であることの宣言。\n\n\n ② 全体         <html lang=\"ja\"> …… HTML文書全体を囲む。lang=\"ja\" は日本語。\n\n\n ③ head        <meta charset=\"UTF-8\"> …… 日本語などの文字を正しく扱うための設定。\n                 <title>...</title> …… ブラウザのタブなどに表示するタイトル。\n\n\n ④ body        <h1>...</h1> …… ページ上に表示する大きな見出し。\n                 <p>...</p> …… ページ上に表示する文章。\n\n\n 混同しやすい： <title> はブラウザのタブ名、<h1> はページの中の大見出しです。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     5 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p05-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "ページ内の見出しや文章を入れるのは？",
          "required": true,
          "options": [
            "<head>",
            "<body>",
            "<!DOCTYPE html>"
          ],
          "correct": 1,
          "why": "実際に見える主な内容はbodyに書きます。"
        },
        {
          "id": "p05-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "ブラウザのタブに付く名前を書くタグは？",
          "required": true,
          "options": [
            "<title>",
            "<h1>",
            "<p>"
          ],
          "correct": 0,
          "why": "titleはhead内に書くのが基本です。"
        },
        {
          "id": "p05-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "日本語を正しく扱う文字コードの指定は？",
          "required": true,
          "options": [
            "charset=\"UTF-8\"",
            "href=\"index.html\"",
            "alt=\"写真\""
          ],
          "correct": 0,
          "why": "<meta charset=\"UTF-8\"> をhead内に書きます。"
        },
        {
          "id": "p05-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "<!DOCTYPE html> の役割は？",
          "required": true,
          "options": [
            "HTML文書であることの宣言",
            "画像の指定",
            "色の指定"
          ],
          "correct": 0,
          "why": "HTML文書の先頭に書く宣言です。"
        },
        {
          "id": "p05-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "<html lang=\"ja\"> の ja の意味は？",
          "required": true,
          "options": [
            "日本語",
            "JavaScript",
            "画像"
          ],
          "correct": 0,
          "why": "文書の言語が日本語であることを示します。"
        },
        {
          "id": "p05-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "code",
          "text": "エディターに <head> と </head> がある状態にしよう",
          "required": true,
          "test": "head",
          "hint": "見本のHTML文書全体を読み込むと確認できます。"
        },
        {
          "id": "p05-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "code",
          "text": "エディターに <body> と </body> がある状態にしよう",
          "required": true,
          "test": "body",
          "hint": "bodyの中に見出しと文章を書こう。"
        },
        {
          "id": "p05-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "<title> と <h1> の表示場所の違いを説明しよう",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    },
    {
      "id": "p06",
      "title": "タグ・要素・属性を読む",
      "intro": "開始タグと終了タグ、入れ子、属性の役割を学ぼう。",
      "editorHint": "タグを追加したら「プレビューを更新」でどう変わったか確かめましょう。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>はじめてのWebページ</title>\n</head>\n<body>\n  <h1>こんにちは！</h1>\n  <p>わたしはHTMLを勉強しています。</p>\n</body>\n</html>",
      "document": {
        "title": "タグ・要素・属性を読む",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                06 / 12          STEP 04 タグ・要素・属性を読む\n\n\n\n\n\n記号を丸暗記するより「どの部分が何をしているか」を見てみよう。\n\n\n\n タグは内容の役割を伝える目印\n\n\n                    <h1> こんにちは  </h1>\n\n\n        開始タグ           内容（テキスト）           終了タグ\n\n\n\n 入れ子のしくみ                  属性とは？\n\n タグの中に別のタグを入れられます。外側のタグを閉じ   タグに追加する情報です。href はリンク先、src は画像\n る順序にも注意。                         の場所、alt は画像の説明。\n\n\n    <body>                                                       <a href=\"https://example.com/\">\n     <h1>こんにちは</h1>                     サイトへ\n    <p>元気です。</p>                                          </a>\n    </body>\n\n\n\n\n よく使う基本タグ\n\n\n タグ          役割                入力例\n\n\n <h1>          一番大きな見出し              <h1>わたしのページ</h1>\n\n\n <h2>          小さめの見出し                <h2>好きなもの</h2>\n\n\n <p>          文章・段落                   <p>こんにちは</p>\n\n\n <ul> / <li>       箇条書き                       <li>ゲーム</li>\n\n\n <a>          リンク                              <a href=\"...\">開く</a>\n\n\n <img>         画像                                <img src=\"...\" alt=\"...\">\n\n\n <br>          文章内で改行                 1行目<br>2行目\n\n\n  HTMLでは <img> や <br> に終了タグはありません。 タグは半角英数字・半角記号で入力します。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     6 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p06-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "<h1>こんにちは</h1> の「こんにちは」は？",
          "required": true,
          "options": [
            "開始タグ",
            "内容（テキスト）",
            "終了タグ"
          ],
          "correct": 1,
          "why": "タグで囲まれた部分が内容です。"
        },
        {
          "id": "p06-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "終了タグとして正しいのは？",
          "required": true,
          "options": [
            "<h1>",
            "</h1>",
            "<h/1>"
          ],
          "correct": 1,
          "why": "終了タグには / が付きます。"
        },
        {
          "id": "p06-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "リンク先URLを指定する属性は？",
          "required": true,
          "options": [
            "href",
            "src",
            "alt"
          ],
          "correct": 0,
          "why": "a要素のhref属性です。"
        },
        {
          "id": "p06-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "画像ファイルの場所を指定する属性は？",
          "required": true,
          "options": [
            "alt",
            "src",
            "lang"
          ],
          "correct": 1,
          "why": "img要素のsrc属性を使います。"
        },
        {
          "id": "p06-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "終了タグがないのはどれ？",
          "required": true,
          "options": [
            "<p>",
            "<img>",
            "<h1>"
          ],
          "correct": 1,
          "why": "imgやbrには終了タグがありません。"
        },
        {
          "id": "p06-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "choice",
          "text": "箇条書きの項目に使うタグは？",
          "required": true,
          "options": [
            "<li>",
            "<title>",
            "<head>"
          ],
          "correct": 0,
          "why": "ulの中にliを並べます。"
        },
        {
          "id": "p06-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "code",
          "text": "エディターに段落 <p> を書いてみよう",
          "required": true,
          "test": "paragraph",
          "hint": "<p>文章</p> を入れてみよう。"
        },
        {
          "id": "p06-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "「属性」とは何か、hrefかsrcを例に説明しよう",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    },
    {
      "id": "p07",
      "title": "実習① HTMLの骨組みを入力",
      "intro": "PDFのコードをエディターに入力して、表示を確かめよう。",
      "editorHint": "初めは何も見ずに入力に挑戦してもOK。困ったら「このページの見本コードを読み込む」を利用できます。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>はじめてのWebページ</title>\n</head>\n<body>\n  <h1>こんにちは！</h1>\n  <p>わたしはHTMLを勉強しています。</p>\n</body>\n</html>",
      "document": {
        "title": "実習① HTMLの骨組みを入力",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                07 / 12          STEP 05 実習① HTMLの骨組みを入力する\n\n\n\n\nまずは、文章が表示されるまでを確実に体験しよう。\n\n\n  Learning StudioでHTMLタブを開こう\n\n\n ① HTMLタブ     →     ② 下のコードを入力     →     ③ プレビューを更新     →     ④ 学習内容を保存\n\n\n\n   <!DOCTYPE html>\n\n   <html lang=\"ja\">\n   <head>\n\n     <meta charset=\"UTF-8\">\n     <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n\n    <title>はじめてのWebページ</title>\n\n   </head>\n   <body>\n\n   <h1>こんにちは！</h1>\n   <p>わたしはHTMLを勉強しています。</p>\n\n   </body>\n\n   </html>\n\n\n\n コードの中で探してみよう             正しい表示の見本\n\n ① <head> の開始と終了\n ② <title> の文字             こんにちは！\n ③ <body> の中身\n ④ <h1> の見出し                        わたしはHTMLを勉強しています。\n\n\n\n ここを変えると何が起こる？\n\n\n   A 「こんにちは！」を「わたしのページ」に書きかえて実行してみよう。                      □できた\n\n\n\n   B   <title> の中を「HTMLの練習」にしてみよう。                                □できた\n\n\n\n   C   <p> の内容を好きな文章にしてみよう。                                    □できた\n\n\n\n ヒント：見出しや文章が消えたときは、<、>、/、引用符 \" を確認しよう。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     7 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p07-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "code",
          "text": "HTML文書の先頭にDOCTYPEを入れよう",
          "required": true,
          "test": "doctype",
          "hint": "先頭の <!DOCTYPE html> を確認しよう。"
        },
        {
          "id": "p07-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "code",
          "text": "<html lang=\"ja\"> を入れよう",
          "required": true,
          "test": "html",
          "hint": "HTML文書全体の開始・終了を書こう。"
        },
        {
          "id": "p07-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "code",
          "text": "headの中にページタイトルを入れよう",
          "required": true,
          "test": "title",
          "hint": "<title>はじめてのWebページ</title>"
        },
        {
          "id": "p07-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "code",
          "text": "body内に大きな見出しを入れよう",
          "required": true,
          "test": "heading",
          "hint": "<h1>こんにちは！</h1>"
        },
        {
          "id": "p07-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "code",
          "text": "body内に文章を入れよう",
          "required": true,
          "test": "paragraph",
          "hint": "<p>わたしはHTMLを勉強しています。</p>"
        },
        {
          "id": "p07-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "choice",
          "text": "見出しや文章を入れる場所は？",
          "required": true,
          "options": [
            "head",
            "body",
            "DOCTYPE"
          ],
          "correct": 1,
          "why": "表示内容はbodyに入れます。"
        },
        {
          "id": "p07-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": "「プレビューを更新」を押し、見出しが表示された",
          "required": true
        },
        {
          "id": "p07-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "check",
          "text": "「学習内容を保存」を押して保存した",
          "required": true
        }
      ]
    },
    {
      "id": "p08",
      "title": "実習② 自己紹介ページに発展",
      "intro": "見出し、文章、箇条書き、リンクをつないで自己紹介ページを作ろう。",
      "editorHint": "フローティングHTMLエディターを使って自分の自己紹介を作ろう。3つの好きなものとリンクも入れます。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>わたしの自己紹介</title>\n</head>\n<body>\n  <h1>わたしの自己紹介</h1>\n  <p>こんにちは！ わたしは○○です。</p>\n  <h2>好きなもの</h2>\n  <ul>\n    <li>ゲーム</li>\n    <li>音楽</li>\n    <li>ねこ</li>\n  </ul>\n  <p>好きなサイトはこちらです。</p>\n  <a href=\"https://example.com/\">サイトを見る</a>\n</body>\n</html>",
      "document": {
        "title": "実習② 自己紹介ページに発展",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                08 / 12          STEP 05 実習② 自己紹介ページへ発展\n\n\n\n\n\n見出しと文章だけから、リスト・リンクのあるページにしよう。\n\n\n\n 見出しを増やす → リストにする → リンクをつける\n\n\n ① 見出し               ② 箇条書き              ③ リンク\n\n                     ゲーム\n                                                 サイトを見る ↗\n  わたしの自己紹介        音楽\n                     ねこ\n  好きなもの\n\n\n\n\n 次の完成版を入力しよう\n\n\n  <!DOCTYPE html>\n  <html lang=\"ja\">\n  <head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n   <title>わたしの自己紹介</title>\n  </head>\n  <body>\n   <h1>わたしの自己紹介</h1>\n   <p>こんにちは！ わたしは○○です。</p>\n   <h2>好きなもの</h2>\n    <ul>\n     <li>ゲーム</li>\n     <li>音楽</li>\n     <li>ねこ</li>\n    </ul>\n   <p>好きなサイトはこちらです。</p>\n    <a href=\"https://example.com/\">サイトを見る</a>\n  </body>\n  </html>\n\n\n\n 自分だけのページに変える             リンクについて\n\n  「○○」を自分のニックネームに変える                 href=\"https://example.com/\" がリンク先。クリック先\n   好きなものを3つ考える                 のURLが正しいか確認しよう。知らないサイトへのリン\n  見出しを「わたしのすきな〇〇」に変える        クは先生と確認してから使おう。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     8 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p08-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "code",
          "text": "<h1>で自己紹介のタイトルを表示しよう",
          "required": true,
          "test": "heading",
          "hint": "<h1>わたしの自己紹介</h1>"
        },
        {
          "id": "p08-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "code",
          "text": "<p>で自己紹介文を表示しよう",
          "required": true,
          "test": "paragraph",
          "hint": "<p>こんにちは！ わたしは○○です。</p>"
        },
        {
          "id": "p08-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "code",
          "text": "<h2>で「好きなもの」の見出しを作ろう",
          "required": true,
          "test": "h2",
          "hint": "<h2>好きなもの</h2>"
        },
        {
          "id": "p08-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "code",
          "text": "<ul>と<li>で3項目のリストを作ろう",
          "required": true,
          "test": "list3",
          "hint": "li要素を3つ入れよう。"
        },
        {
          "id": "p08-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "code",
          "text": "<a>を使ってリンクを作ろう",
          "required": true,
          "test": "link",
          "hint": "<a href=\"https://example.com/\">サイトを見る</a>"
        },
        {
          "id": "p08-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "choice",
          "text": "リンク先の指定に使う属性は？",
          "required": true,
          "options": [
            "alt",
            "href",
            "charset"
          ],
          "correct": 1,
          "why": "a要素にhref属性を付けます。"
        },
        {
          "id": "p08-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": "プレビューで自分の自己紹介を確認した",
          "required": true
        },
        {
          "id": "p08-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "自分のページに入れた好きなものを3つ書こう",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    },
    {
      "id": "p09",
      "title": "画像の表示・ファイルとパス",
      "intro": "画像タグを学び、画像の置き場所とHTMLの関係を考えよう。",
      "editorHint": "画像タグの書き方は試せますが、Learning Studioの安全なプレビューではローカル画像は表示されません。PDFのフォルダー図を見て理解しよう。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head><meta charset=\"UTF-8\"><title>好きな動物</title></head>\n<body>\n  <h1>好きな動物</h1>\n  <p>わたしはねこが好きです。</p>\n  <img src=\"images/cat.svg\" alt=\"草原で休むねこ\" width=\"300\">\n</body>\n</html>",
      "document": {
        "title": "画像の表示・ファイルとパス",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                09 / 12          STEP 06 画像を入れる・ファイルを整理する\n\n\n\n\n画像はHTMLコードに書くだけでなく、実際の画像データも必要です。\n\n\n 画像は <img> タグで表示\n\n\n                                        ブラウザの表示\n 画像のファイル           HTMLのコード\n                                                好きな動物\n                               <h2>好きな動物</h2>\n                         <p>わたしはねこが好きです。</p>      →         →                                         <img src=\"images/cat.svg\" alt=\"草原\n                       で休むねこ\" width=\"300\">\n\n\n\n\n\n ファイルの置き場所とパス\n\n\n フォルダーの例                  画像の場所の指定\n\n                                                          src=\"images/cat.svg\" は「HTMLと同じフォルダーの中\n   my-first-page\n                             にある images フォルダーの cat.svg」という意味。\n    index.html\n    images\n                                                          alt は画像が読めないときにも役立つ説明文です。\n       cat.svg\n\n\n\n  Learning Studioとの違い： 現在のWebエディターは安全のため外部画像やパソコン上の画像ファイルを直接読\n み込めない設定です。そのため src=\"images/cat.svg\" を入力しても、Learning Studio内のプレビューでは画像が\n 出ない場合があります。\n\n 付属の「ローカル実習サンプル」をパソコンで開くと、画像の仕組みを確認できます。\n\n\n\n よくあるミス： 画像が見えないときは、①画像が存在する？ ②名前と拡張子は一致？ ③フォルダーの場所は正しい？\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                     9 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p09-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "画像を表示するHTMLタグは？",
          "required": true,
          "options": [
            "<img>",
            "<p>",
            "<a>"
          ],
          "correct": 0,
          "why": "画像にはimgを使います。"
        },
        {
          "id": "p09-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "画像ファイルを指定する属性は？",
          "required": true,
          "options": [
            "src",
            "alt",
            "href"
          ],
          "correct": 0,
          "why": "srcで画像の場所を指定します。"
        },
        {
          "id": "p09-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "画像の内容を文字で説明する属性は？",
          "required": true,
          "options": [
            "title",
            "alt",
            "lang"
          ],
          "correct": 1,
          "why": "altは画像の代替テキストです。"
        },
        {
          "id": "p09-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "images/cat.svg が意味するのは？",
          "required": true,
          "options": [
            "HTMLの隣のimages内にあるcat.svg",
            "必ずネットのトップページ",
            "PDFのファイル名"
          ],
          "correct": 0,
          "why": "相対パスはHTMLファイルからの位置を示します。"
        },
        {
          "id": "p09-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "画像が表示されないときの確認として正しいのは？",
          "required": true,
          "options": [
            "名前・拡張子・フォルダーの位置",
            "マウスの色",
            "画面の明るさだけ"
          ],
          "correct": 0,
          "why": "ファイルの存在とパスが一致するか確認します。"
        },
        {
          "id": "p09-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "code",
          "text": "<img>にsrcとaltを付けてみよう",
          "required": true,
          "test": "image",
          "hint": "<img src=\"images/cat.svg\" alt=\"草原で休むねこ\">"
        },
        {
          "id": "p09-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": "PDFでindex.htmlとimages/cat.svgの場所を確認した",
          "required": true
        },
        {
          "id": "p09-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "Learning Studioのプレビューに画像が出ないことがあるのはなぜ？",
          "required": false,
          "hint": "PDFの注意書きを参考に説明しよう。"
        }
      ]
    },
    {
      "id": "p10",
      "title": "自分で考えて改善・デバッグ",
      "intro": "一か所ずつ変更し、表示を確認しながら自分のページを改善しよう。",
      "editorHint": "7〜8ページで作ったHTMLを使い、好きなテーマに変更してみましょう。",
      "sample": "<!DOCTYPE html>\n<html lang=\"ja\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>わたしの自己紹介</title>\n</head>\n<body>\n  <h1>わたしの自己紹介</h1>\n  <p>こんにちは！ わたしは○○です。</p>\n  <h2>好きなもの</h2>\n  <ul>\n    <li>ゲーム</li>\n    <li>音楽</li>\n    <li>ねこ</li>\n  </ul>\n  <p>好きなサイトはこちらです。</p>\n  <a href=\"https://example.com/\">サイトを見る</a>\n</body>\n</html>",
      "document": {
        "title": "自分で考えて改善・デバッグ",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                10 / 12          STEP 07 自分で考えて改善する\n\n\n\n\n\n答えをコピーするだけでなく、考えてコードを変えてみよう。\n\n\n\n\n    MISSION 1  自分を紹介しよう\n\n  <h1> の見出しと <p> の文章を、オリジナルに変更する。\n\n どんなタイトルにする？\n\n\n\n\n    MISSION 2  好きなものを3つ追加\n\n  <ul> と <li> を使って、好きなゲーム・動物・食べ物などを紹介する。\n\n どんな3つを紹介する？\n\n\n\n\n    MISSION 3  ページの構造を説明する\n\n  <head> には何を、<body> には何を書くか、自分の言葉で説明してみよう。\n\n head：　　　　　　　　　body：\n\n\n\n デバッグ：表示がおかしい！ どこが間違っている？\n\n\n 問題 A：終了タグがない              問題 B：タグがずれている\n\n\n   <h1>こんにちは！                                             <ul>\n   <p>好きなものはゲームです。</p>                           <li>ねこ</li>\n                                                     <li>ゲーム</ul>\n  修正する場所：___________________\n                                           修正する場所：___________________\n\n\n\n むずかしくなったら、最初に動いた状態に戻して1か所ずつ変更し、プレビューで確かめよう。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                    10 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p10-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "code",
          "text": "大きな見出しの文字を自分らしく変えよう",
          "required": true,
          "test": "customHeading",
          "hint": "「こんにちは！」以外の自分の見出しにしよう。"
        },
        {
          "id": "p10-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "code",
          "text": "自己紹介文を自分の言葉に変えよう",
          "required": true,
          "test": "customParagraph",
          "hint": "初期の「わたしはHTMLを勉強しています。」から変更しよう。"
        },
        {
          "id": "p10-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "code",
          "text": "好きなものを3つリストにしよう",
          "required": true,
          "test": "list3",
          "hint": "<li>を3つ以上入れよう。"
        },
        {
          "id": "p10-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "<h1>こんにちは！ の問題点は？",
          "required": true,
          "options": [
            "終了タグがない",
            "タグが英語",
            "文字が短い"
          ],
          "correct": 0,
          "why": "</h1>を忘れずに書きます。"
        },
        {
          "id": "p10-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "<ul><li>ねこ</li><li>ゲーム</ul> の問題点は？",
          "required": true,
          "options": [
            "<li>の閉じタグが足りない",
            "<ul>は使えない",
            "見出しがない"
          ],
          "correct": 0,
          "why": "後半のliを先に閉じてからulを閉じます。"
        },
        {
          "id": "p10-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "choice",
          "text": "表示がおかしいときに最初に行うべきことは？",
          "required": true,
          "options": [
            "一か所ずつ直して確認",
            "全コードを消す",
            "適当にタグを増やす"
          ],
          "correct": 0,
          "why": "動いていた状態から少しずつ変更すると原因を探しやすいです。"
        },
        {
          "id": "p10-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": "問題Aと問題Bの誤りをPDFで見つけた",
          "required": true
        },
        {
          "id": "p10-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "text",
          "text": "改善したところと、工夫した理由を書こう",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    },
    {
      "id": "p11",
      "title": "確認テスト（10問）",
      "intro": "PDFの10問をシステム上でも確かめよう。選択問題はその場で答え合わせできます。",
      "editorHint": "最後に作ったHTMLを確認し、必要ならプレビューを更新しよう。",
      "sample": "",
      "document": {
        "title": "確認テスト（10問）",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                11 / 12          STEP 08 確認テスト\n\n\n\n\n\n答えを選んだ理由も、先生に説明できるとすばらしい。\n\n\n\n    Webページを表示するソフトはどれ？   1\n    □ ブラウザ　□ エディター　□ 電卓\n\n\n    HTMLファイルとして正しい名前は？   2\n    □ index.txt　□ index.html　□ index.html.txt\n\n\n    HTMLコードを書いたり編集したりする道具は？   3\n    □ ブラウザ　□ エディター　□ カメラ\n\n\n\n    ページに表示する見出しや文章を入れる場所は？\n   4\n    □ head　□ body　□ title\n\n\n\n    ブラウザのタブ名を書くタグは？\n   5\n    □ <h1>　□ <title>　□ <p>\n\n\n\n    見出しを書くタグは？\n   6\n    □ <h1>　□ <p>　□ <img>\n\n\n\n    ほかのページに移動できるリンクのタグは？\n   7\n    □ <a>　□ <br>　□ <body>\n\n\n    HTMLを変更したあと、ブラウザで新しい表示を確認する基本操作は？   8\n    □ 更新　□ 印刷　□ 戻る\n\n\n 記述問題（短く答えよう）\n\n\n   9  <head> と <body> の役割の違いを書こう。\n\n\n\n\n\n   10 自分のパソコンの index.html をブラウザで開く方法を書こう。\n\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML                                                                    11 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p11-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "choice",
          "text": "Webページを表示するソフトはどれ？",
          "required": true,
          "options": [
            "ブラウザ",
            "エディター",
            "電卓"
          ],
          "correct": 0,
          "why": "Webページを表示するのはブラウザです。"
        },
        {
          "id": "p11-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "choice",
          "text": "HTMLファイルとして正しい名前は？",
          "required": true,
          "options": [
            "index.txt",
            "index.html",
            "index.html.txt"
          ],
          "correct": 1,
          "why": "拡張子は .html です。"
        },
        {
          "id": "p11-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "choice",
          "text": "HTMLコードを書いたり編集したりする道具は？",
          "required": true,
          "options": [
            "ブラウザ",
            "エディター",
            "カメラ"
          ],
          "correct": 1,
          "why": "コードを書く道具はエディターです。"
        },
        {
          "id": "p11-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "choice",
          "text": "ページに表示する見出しや文章を入れる場所は？",
          "required": true,
          "options": [
            "head",
            "body",
            "title"
          ],
          "correct": 1,
          "why": "見出しや文章などはbodyに入れます。"
        },
        {
          "id": "p11-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "choice",
          "text": "ブラウザのタブ名を書くタグは？",
          "required": true,
          "options": [
            "<h1>",
            "<title>",
            "<p>"
          ],
          "correct": 1,
          "why": "titleはhead内で使います。"
        },
        {
          "id": "p11-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "choice",
          "text": "見出しを書くタグは？",
          "required": true,
          "options": [
            "<h1>",
            "<p>",
            "<img>"
          ],
          "correct": 0,
          "why": "h1はページの見出しです。"
        },
        {
          "id": "p11-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "choice",
          "text": "ほかのページへのリンクのタグは？",
          "required": true,
          "options": [
            "<a>",
            "<br>",
            "<body>"
          ],
          "correct": 0,
          "why": "リンクはa要素で作ります。"
        },
        {
          "id": "p11-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "choice",
          "text": "HTML変更後にブラウザで更新する操作は？",
          "required": true,
          "options": [
            "更新",
            "印刷",
            "戻る"
          ],
          "correct": 0,
          "why": "更新で新しい表示を確認します。"
        },
        {
          "id": "p11-task-9",
          "version": 1,
          "storageKey": "8",
          "type": "text",
          "text": "<head>と<body>の役割の違いを書こう",
          "required": true,
          "hint": "headはページ情報、bodyは見える内容。"
        },
        {
          "id": "p11-task-10",
          "version": 1,
          "storageKey": "9",
          "type": "text",
          "text": "自分のPC内のindex.htmlをブラウザで開く方法を書こう",
          "required": true,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    },
    {
      "id": "p12",
      "title": "完成チェック・振り返り",
      "intro": "ここまでできたことをチェックして、次のCSS学習につなげよう。",
      "editorHint": "作品を最後に確認し、「学習内容を保存」を押そう。「HTMLを保存」でPCに持ち帰ることもできます。",
      "sample": "",
      "document": {
        "title": "完成チェック・振り返り",
        "body": "学びの教室 × Learning Studio  WEB開発 / レベル1\n   </>                                                12 / 12            FINISH 振り返り・完成チェック\n\n\n\n\n\n「できた！」を確かめて、次につなげよう。\n\n\n\n 作品完成チェックリスト\n\n\n □ HTMLタブにコードを入力できた           □ プレビューを更新できた\n\n\n □ headとbodyの違いが分かった            □ h1とpを書きかえた\n\n\n □ リストを追加できた                 □ 学習内容を保存した\n\n\n □ .htmlファイルの意味を説明できる          □ ブラウザで開く方法が分かった\n\n\n 3つの振り返り\n\n\n 今日、できるようにな\n\n ったこと\n\n\n\n\n\n まだむずかしいこと・\n\n 質問したいこと\n\n\n\n\n 次に作ってみたいWeb\n ページ\n\n\n\n\n 次の学習へ\n\n\n レベル1をもう一度                   次のテーマ：CSS\n\n 自己紹介の内容を変えたり、別の題材で新しいページを   HTMLで作ったページに、色や文字の大きさを付けてみ\n 作ろう。                        よう。\n\n\n\n\n     完成おめでとう！\n\n        エディターで書く → ブラウザで確かめる → 直してみる。これがWeb制作の基本です。★\n\n\n\n\nHTML入門｜第1回：WebページのしくみとHTML学習に役立つ参考サイト　MDN「HTML: コンテンツの作成」「基本的なHTMLの構文」「ファイルの扱い」／ サルワカ「初心者向けHTML入門」             12 / 12",
        "edited": false
      },
      "tasks": [
        {
          "id": "p12-task-1",
          "version": 1,
          "storageKey": "0",
          "type": "check",
          "text": "HTMLタブにコードを入力できた",
          "required": true
        },
        {
          "id": "p12-task-2",
          "version": 1,
          "storageKey": "1",
          "type": "check",
          "text": "プレビューを更新し、表示を確認できた",
          "required": true
        },
        {
          "id": "p12-task-3",
          "version": 1,
          "storageKey": "2",
          "type": "check",
          "text": "headとbodyの違いが説明できる",
          "required": true
        },
        {
          "id": "p12-task-4",
          "version": 1,
          "storageKey": "3",
          "type": "check",
          "text": "h1とpの文字を変更できた",
          "required": true
        },
        {
          "id": "p12-task-5",
          "version": 1,
          "storageKey": "4",
          "type": "check",
          "text": "liを使ったリストを追加できた",
          "required": true
        },
        {
          "id": "p12-task-6",
          "version": 1,
          "storageKey": "5",
          "type": "check",
          "text": "学習内容を保存した",
          "required": true
        },
        {
          "id": "p12-task-7",
          "version": 1,
          "storageKey": "6",
          "type": "check",
          "text": ".htmlという拡張子の意味を説明できる",
          "required": true
        },
        {
          "id": "p12-task-8",
          "version": 1,
          "storageKey": "7",
          "type": "check",
          "text": "HTMLファイルをブラウザで開く方法を説明できる",
          "required": true
        },
        {
          "id": "p12-task-9",
          "version": 1,
          "storageKey": "8",
          "type": "text",
          "text": "今日、できるようになったことは？",
          "required": true,
          "hint": "自分の言葉で短く書こう。"
        },
        {
          "id": "p12-task-10",
          "version": 1,
          "storageKey": "9",
          "type": "text",
          "text": "まだ難しいこと・先生に質問したいことは？",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        },
        {
          "id": "p12-task-11",
          "version": 1,
          "storageKey": "10",
          "type": "text",
          "text": "次に作ってみたいWebページは？",
          "required": false,
          "hint": "自分の言葉で短く書こう。"
        }
      ]
    }
  ],
  "finalQuestions": [
    {
      "id": "final-q01",
      "version": 1,
      "prompt": "HTMLは何を表すための言葉ですか。",
      "kind": "text"
    },
    {
      "id": "final-q02",
      "version": 1,
      "prompt": "ブラウザとエディターの役割の違いを説明してください。",
      "kind": "text"
    },
    {
      "id": "final-q03",
      "version": 1,
      "prompt": "HTML・CSS・JavaScriptは、それぞれ何を担当しますか。",
      "kind": "text"
    },
    {
      "id": "final-q04",
      "version": 1,
      "prompt": "HTML文書でDOCTYPEを書く理由を説明してください。",
      "kind": "text"
    },
    {
      "id": "final-q05",
      "version": 1,
      "prompt": "headとbodyの役割の違いを説明してください。",
      "kind": "text"
    },
    {
      "id": "final-q06",
      "version": 1,
      "prompt": "titleとh1は、それぞれどこに表示されますか。",
      "kind": "text"
    },
    {
      "id": "final-q07",
      "version": 1,
      "prompt": "日本語の文字化けを防ぐために、どのような指定をしますか。",
      "kind": "text"
    },
    {
      "id": "final-q08",
      "version": 1,
      "prompt": "見出しと段落を使った短いHTMLを書いてください。",
      "kind": "code"
    },
    {
      "id": "final-q09",
      "version": 1,
      "prompt": "好きなものを3つ並べる箇条書きのHTMLを書いてください。",
      "kind": "code"
    },
    {
      "id": "final-q10",
      "version": 1,
      "prompt": "リンクを作るHTMLを書き、hrefの役割を説明してください。",
      "kind": "code"
    },
    {
      "id": "final-q11",
      "version": 1,
      "prompt": "画像を表示するHTMLを書き、srcとaltの役割を説明してください。",
      "kind": "code"
    },
    {
      "id": "final-q12",
      "version": 1,
      "prompt": "HTMLを保存してブラウザで確認する手順と、表示が変わらないときの確認方法を書いてください。",
      "kind": "text"
    }
  ]
};
