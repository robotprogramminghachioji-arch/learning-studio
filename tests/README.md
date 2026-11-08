# ブラウザ回帰テスト

Node.js 20以上とChromiumを使用します。アプリ自体にはnpm依存もビルドも不要です。npm依存はテスト専用です。

```sh
npm ci
# Chromiumが未導入の場合
npx playwright install chromium
npm test
```

Linuxでは `/usr/bin/chromium` があれば使用し、それ以外ではPlaywrightのChromiumを使用します。別の実行ファイルを使う場合は `CHROMIUM_PATH` で指定できます。現在のクラウド環境でnpmキャッシュに書き込めない場合は `npm --cache /tmp/learning-studio-npm-cache ci` を使えます。

テストは一時的なHTTPサーバーを起動し、実際の `index.html`、アプリのJavaScript/CSS、教材画像、sandbox付きプレビューをChromiumで操作します。Firebase SDKの通信境界のみを代替し、ログイン済み生徒・先生と保存成功・失敗・応答遅延を再現します。本番Firebaseへの書き込みやアカウント作成は行いません。

確認項目：12ページと問題の対応、125/150/200％拡大、ページ移動・最小化・再読み込み時のコード/回答保持、マウス・タッチ・キーボードでの移動とサイズ変更、画面サイズ変更、HTML/CSS/JavaScriptの実行、クラウド保存のドキュメントとmerge指定、クラウド読込とローカル下書きの競合、見本コードの上書き確認、7コース・先生用管理画面・通常Web教材の表示。

画面確認用スクリーンショットは `/tmp/learning-studio-{pdf,desktop,floating,mobile}.png` に出力します。スマートフォンの確認はChromiumのモバイル・タッチエミュレーションです。実機のソフトウェアキーボードの挙動、および本番Firebaseの認証・Firestoreルールはこのテストの検証対象に含みません。
