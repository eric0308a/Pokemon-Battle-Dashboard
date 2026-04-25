# Pokemon Battle Dashboard

一個以 Vue 3 + Vite 製作的寶可夢對戰速查面板，提供隊伍選取、屬性克制、速度線與 Mega 狀態切換等功能。

## 線上網址

https://eric0308a.github.io/Pokemon-Battle-Dashboard/

## 快速使用

1. 左側選擇我方寶可夢，右側選擇敵方寶可夢。
2. 可用中文、英文或編號搜尋。
3. 加入後可調整招式、性格、速度階級與天氣條件。
4. 介面會即時顯示屬性克制、速度排序與聯防盲點。

## 本機開發

- 安裝依賴：`npm install`
- 開發模式：`npm run dev`
- 建置：`npm run build`
- 預覽建置：`npm run preview`

## 檔案架構

```text
Pokemon-Battle-Dashboard/
├─ index.html
├─ package.json
├─ package-lock.json
├─ vite.config.js
├─ README.md
├─ skills-lock.json
├─ public/
│  ├─ favicon.svg
│  └─ icons.svg
├─ src/
│  ├─ main.js
│  ├─ App.vue
│  ├─ style.css
│  ├─ assets/
│  │  └─ allowedPokemonIds.json
│  ├─ components/
│  │  └─ HelloWorld.vue
│  └─ i18n/
│     ├─ translations.js
│     ├─ typeEffectiveness.js
│     ├─ pokemonNameTranslations.json
│     └─ moveTranslations.json
├─ app/
│  └─ src/
│     ├─ App.vue
│     └─ style.css
├─ .github/
│  └─ workflows/
│     └─ deploy.yml
├─ 工作規劃/
│  └─ 實作計劃.md
├─ 參考文件/
│  ├─ 寶可夢冠軍允許寶可夢.md
│  ├─ 屬性克制.md
│  ├─ 招式.md
│  └─ pokeapi-js-wrapper.md
```

## 主要檔案用途

- `index.html`：Vite 入口頁，掛載 Vue 應用。
- `package.json`：專案腳本與相依套件設定。
- `vite.config.js`：Vite 設定（含 GitHub Pages 相容 base）。
- `public/favicon.svg`：網站分頁圖示。
- `public/icons.svg`：圖示素材（目前主要給範例元件使用）。

- `src/main.js`：Vue 啟動點，載入全域樣式與根元件。
- `src/App.vue`：主要畫面與互動邏輯。
- `src/style.css`：主頁面樣式。
- `src/assets/allowedPokemonIds.json`：允許名單的寶可夢 ID 資料。
- `src/i18n/translations.js`：中英文文案、名稱轉換與顯示邏輯。
- `src/i18n/typeEffectiveness.js`：屬性相剋倍率與攻防關係計算。
- `src/i18n/pokemonNameTranslations.json`：寶可夢名稱翻譯資料。
- `src/i18n/moveTranslations.json`：招式翻譯與屬性資料。

- `src/components/HelloWorld.vue`：Vite 初始範例元件，非主流程核心。
- `app/src/*`：舊版本/備份性質的頁面檔案，不在目前主入口流程中。
- `.github/workflows/deploy.yml`：GitHub Pages 自動部署流程。

- `工作規劃/實作計劃.md`：開發規劃文件。
- `學習對象/學習檔案.md`：學習與整理筆記。
- `寶可夢冠軍允許寶可夢.md`：允許寶可夢名單來源文件。
- `屬性克制.md`：屬性克制整理文件。
- `招式.md`：招式整理文件。
- `pokeapi-js-wrapper.md`：PokeAPI 套件使用筆記。

## 部署說明

- 目前透過 GitHub Actions 自動部署到 GitHub Pages。
- 推送到 `main` 後會觸發 `.github/workflows/deploy.yml` 進行建置與發布。

---