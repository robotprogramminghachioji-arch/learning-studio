# Roblox Studio LEVEL1：最初のオビーを作る

Learning Studioの「Roblox Studio → Lv.1」に、初心者向けの全8教材を追加しています。1教材75分、合計10時間は授業設計上の目安です。導入10分・用語10分・制作35分・比較10分・保存と振り返り10分を想定し、インストールや操作の習熟に応じて分割してください。

| 回 | 内容 | 保存する作品 | 時間 |
| --- | --- | --- | --- |
| 1 | Studioの準備、公式Classic Obby、カメラ、Explorer、Properties、Play／Stop、保存・再読込 | L1-01-見本.rbxl | 75分 |
| 2 | 新しいBaseplate、SpawnLocation、Block3個、位置・大きさ・固定・衝突 | L1-02-マイオビー.rbxl | 75分 |
| 3 | Move／Scale／Rotate、位置・幅・向きを1つずつ変更して比較 | L1-03-マイオビー.rbxl | 75分 |
| 4 | Color／Material／Transparency、遊びやすい見た目を比較 | L1-04-マイオビー.rbxl | 75分 |
| 5 | 公式の落下動画、AnchoredとCanCollideを別々に試す | L1-05-マイオビー.rbxl | 75分 |
| 6 | Duplicate、部品名、足場6個、Modelと子の選択 | L1-06-マイオビー.rbxl | 75分 |
| 7 | Goal、床を外す前のバックアップ、開始・到着・落下・復活の確認 | L1-07-マイオビー.rbxl | 75分 |
| 8 | 遊び方、4項目のテスト表、友だちの感想、1か所改善、保存・再読込・発表 | L1-08-完成オビー.rbxl | 75分 |

第1回は公式見本を使い、第2回から別の新規作品を制作します。以降は前回ファイルを開いて続きを作ります。`.rbxlx`で保存した場合も、その形式のまま使えます。PCの保存先を先生と決め、授業前に前回の作品を開けるか確認してください。

## 授業と登録・公開

先生がホームから8教材をプレビューできます。「先生用管理 → 教材・問題管理 → Roblox LEVEL1の8教材を非公開で登録」で不足分を登録し、確認後に「確認済みのRoblox LEVEL1をまとめて公開」で生徒の一覧へ表示します。新しいID `roblox-studio-l1-lesson01`〜`08` を使い、既存の `roblox-1` 等は補助教材として残します。既存原稿・問題・公開設定・採点基準を登録処理で上書きしません。生徒には既存の受講権限と公開設定が適用されます。

各教材は「ゴールと準備 → 用語 → 操作① → 操作②・比較 → テスト・保存・振り返り」の5ページです。同じページの本文からチェック項目を作り、上部と下部のページ送りを同期します。公式画像は100〜200%に拡大でき、原本を超える解像度の補間は行いません。印刷では全5学習セクションを説明量に応じた枚数で出力します。

WindowsまたはMacのRoblox Studioで制作します。スマホは教材閲覧用です。LEVEL1はコードを必須にせず、Goalへの到着を遊び方で定義します。自動クリア判定・チェックポイントのスクリプトはまだありません。LEVEL2〜5の内容は学習予定として明示し、今回の実装には含めません。

作品保存はStudioのFile → Save to File／Download a Copyで行います。Learning Studioの回答提出は操作結果・予想との比較・保存ファイル名を先生へ送る記述式です。作品の自動取得・アップロードは行いません。先生は実作品を見て、保存済みの採点基準で回答を確認してください。インターネットへの公開はLEVEL1の必須課題に含めません。

先生が通常編集画面で変えた説明・課題は「先生の原稿」に表示します。番号付きの標準手順・画像・チェックを編集する場合は、`assets/roblox-course.json` の各ステップを変更します。確認問題は現在保存されている問題を表示・印刷します。

## 本物の画像・動画と出典

画像18点・MP4動画1点（約3秒）は、Roblox Corporationが公開するCreator Hubの実画面・操作画像・実演の原本です。生成画像や架空のStudio画面を使わず、画素・音声・映像の加工をしていません。公式操作例と自分の制作物の配置・色・設定値は異なるため、入力には本文の指定値を使うと教材内に案内しています。

- [Studioの画面を知る](https://create.roblox.com/docs/ja-jp/tutorials/curriculums/studio/explore-ui)
- [Classic Obbyから始める](https://create.roblox.com/docs/ja-jp/tutorials/curriculums/building/get-started)
- [パーツで作る・固定の落下実演](https://create.roblox.com/docs/ja-jp/tutorials/curriculums/building/work-with-parts)
- [テストと保存](https://create.roblox.com/docs/ja-jp/tutorials/curriculums/building/test-and-save)
- [パーツと移動・拡大・回転](https://create.roblox.com/docs/parts)
- [Propertiesの入力欄・色の設定](https://create.roblox.com/docs/studio/properties)
- [材質](https://create.roblox.com/docs/parts/materials)・[Model](https://create.roblox.com/docs/parts/models)
- [ファイルとして保存する](https://create.roblox.com/docs/projects/place-files)

素材ごとの原本URL・掲載ページ・作者・権利表示・変更なしの表示・SHA-256・実寸・バイト数は [roblox-media.json](../assets/roblox-media.json) に記録しています。画面と印刷物でも出典、Roblox Corporation、CC BY 4.0、原本リンクを表示します。[配布元リポジトリ](https://github.com/Roblox/creator-docs) の [CC BY 4.0](https://github.com/Roblox/creator-docs/blob/main/LICENSE) に基づき引用・再配布し、ライセンス本文を [素材フォルダー](../assets/roblox-level1-media/LICENSE-CC-BY-4.0.txt) に収録しています。Robloxの公式教材そのものの翻訳・認定コースを名乗るものではなく、公式資料を参照した独自の日本語授業手順です。

## 更新・検証

本文原稿は `assets/roblox-course.json`、素材台帳は `assets/roblox-media.json`、生成モジュールは `assets/roblox-course-data.js` です。標準の説明・実践課題の文章にも同じ手順を掲載します。更新後は `npm run version:assets`、`npm test` を実行します。素材の原本ハッシュ・バイト数とローカルファイルが違う場合は生成チェックで失敗します。

ブラウザテストではPC・スマホの全8教材×5ページ、画像の実読込、動画の実再生、ページとチェックの対応、320px・375px・横向きの操作と拡大、ヘルプ往復、提出・下書き保持、登録・公開・権限、全8教材の実PDF出力を検証します。Firebase通信だけを代替し、本番データへ書き込みません。

このLinux検証環境ではWindows／Mac専用のRoblox Studioを実行できないため、本文の設定値による実作品の制作・ジャンプ距離・復活・ファイル保存はネイティブStudioでの確認が必要です。授業前に先生のPCで次を確かめてください。

1. 公式見本をEdit in Studioで開き、Explorer／Properties、Test／Stop、保存・再読込が使える。
2. 第2〜7回の値で新規Baseplateから制作し、足場01〜06とGoalへ渡れる。難しい場合は教材の手順に沿って幅・間隔を1か所ずつ調整する。
3. 第5回の固定／衝突の実験を行い、Stopで位置が戻ることと、最後に両方オンへ戻すことを確認する。
4. 第7回でBaseplateだけを外し、落下・復活と最初からの再テストを確認する。
5. 完成ファイルを再読込して遊び、先生・友だちが説明だけで操作できるか確かめる。

設定値は授業用の出発点で、全アバター・Studio版でのプレイを保証する値ではありません。ネイティブ操作の実測とブラウザ側の検証範囲を区別します。
