# Oncall Scheduler

訪問看護ステーション向けのオンコール当番自動作成ツールです。

## 機能

- 看護師6名の不可日・希望日を月ごとに保存
- 最終更新日の表示
- 日本の祝日を年・月から自動判定
- 平日1点、土日祝2点で公平に割り振り
- Googleカレンダー風の月表示
- Googleカレンダー取り込み用ICSファイルのダウンロード
- この月の保存データ全クリア

## 起動

```bash
npm start
```

または:

```bash
node server.js
```

起動後、以下を開きます。

```text
http://127.0.0.1:4173/index.html
```

## 保存

入力データは `data.json` に月ごとに保存されます。

## 公開運用

GitHub Pagesだけでは `data.json` に書き込めないため、保存機能を使う場合は Render、Railway、Fly.io などの Node.js サーバー対応ホスティングで `node server.js` を起動してください。
