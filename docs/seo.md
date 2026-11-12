# AT ASAKUSA｜SEO実装

対象URL： https://at-asakusa.pages.dev/

## 実装内容

| 対象 | 内容 |
| --- | --- |
| 本番URL | `src/data/site.mjs`に集約し、Astroのsite設定・canonical・OGP・構造化データ・サイトマップ・robots.txtへ利用 |
| タイトル | AT ASAKUSA｜浅草のアパートメントホテル・最大6名 |
| 説明文 | 施設名・フリガナ、浅草・台東区、2ベッドルーム・約30㎡、キッチン・洗濯機、家族旅行・長期滞在、最寄り駅を自然な文章で掲載 |
| canonical | `https://at-asakusa.pages.dev/`。クエリやページ内アンカーは含めない |
| OGP・X | 本番ドメインの絶対URL、1200×630の客室画像、画像説明・寸法・形式、タイトル・説明文を設定 |
| JSON-LD | WebSite・WebPage・LodgingBusiness・ImageObjectを固定IDで接続 |
| 施設データ | 正式名称・住所・電話、チェックイン・アウト、地図、言語対応、設備、客室面積・寝室数・最大人数を掲載 |
| robots.txt | クロールを許可し、サイトマップの絶対URLを明記 |
| sitemap.xml | 正規トップページ1件を記載。ページ内セクションや404は含めない。根拠のない更新日時も付けない |
| 404 | `src/pages/404.astro`を追加し、Cloudflare Pagesへトップレベルの404.htmlを出力する構成。noindex・followを設定 |
| 本文 | ファーストビューに施設名と施設種別を明示し、施設紹介に最大人数・家族旅行・長期滞在を補足 |
| 画像 | 既存のWebP・サイズ別画像出力を維持し、メイン写真をレスポンシブpreloadで優先取得 |
| ローディング | 全文のvisibility:hiddenを解除し、ローディング画面の背後で本文を描画。待機中の操作抑制はinertとpointer-eventsで行い、終了・スキップ・タイムアウトで解除 |

料金・星評価・口コミ・正確な座標・施設全体の客室数は未提供のため追加していない。約30㎡・2ベッドルーム・最大6名は施設全体の総数ではなく、客室の条件として構造化した。

現在のサイトは日本語1ページのため、未実装の英語等へのhreflangや言語切り替えは追加していない。

## 出力URL

再デプロイ後の出力先：

- 正規トップページ：https://at-asakusa.pages.dev/
- クロール設定：https://at-asakusa.pages.dev/robots.txt
- サイトマップ：https://at-asakusa.pages.dev/sitemap.xml

robots.txtとsitemap.xmlは静的エンドポイントとしてビルド時に生成する。更新時は通常のAstroビルド・Cloudflare Pagesへのデプロイで反映される。

## 公開後の登録

Google Search ConsoleでURLプレフィックスのプロパティ `https://at-asakusa.pages.dev/` を登録し、所有権確認後に `sitemap.xml` を送信する。URL検査からトップページのインデックス登録をリクエストし、以後はページの登録状況・検索パフォーマンス・ウェブに関する主な指標を確認する。

Search Consoleの所有権確認情報は未提供のため、認証タグ・認証ファイルは追加していない。Search Consoleへの登録・送信、およびGoogleビジネスプロフィールの変更は行っていない。

独自ドメインへ変更する際は `src/data/site.mjs` のSITE_URLを変更し、旧ドメインからの転送とSearch Consoleの移行も別途設定する。

## 実施範囲

今回の変更はローカルのソースコードへ反映済み。Cloudflare Pagesへのデプロイは実施していない。公開URLはWeb取得ツールで内容を取得できず、既存公開版のレスポンス・ヘッダー・インデックス状況は未確認。

以前のユーザー指示に従い、ビルド・テスト・実装後のブラウザ確認は行っていない。検索順位や検索結果の表示形式は、公開後のクロールとGoogle側の判断・計測を要する。

## 参照資料

- Googleのcanonical：https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Googleのサイト名：https://developers.google.com/search/docs/appearance/site-names
- Googleのタイトル：https://developers.google.com/search/docs/appearance/title-link
- サイトマップ：https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- 宿泊施設の型：https://schema.org/LodgingBusiness
- Cloudflare Pagesの404：https://developers.cloudflare.com/pages/configuration/serving-pages/
