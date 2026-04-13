# Pokemon-Battle-Dashboard

## 快速啟動與部署

- 開發：`npm install` 後執行 `npm run dev`
- 建置：`npm run build`
- 手動部署到 GitHub Pages（gh-pages 分支）：`npm run deploy`
- 自動部署：已提供 `.github/workflows/deploy.yml`，推送到 `main` 會自動部署到 GitHub Pages

> Vite `base` 會依 `GITHUB_REPOSITORY` 自動設定，部署到任何 repo 名稱都可正確產生路徑。

## 📋 專案開發計畫書：寶可夢對戰即時輔助工具

### 一、 核心目標 (Project Goals)
打造一個專為**快節奏對戰**設計的輔助工具，解決傳統百科查詢太慢的問題。
* **極速響應：** 在 60 秒選招時間內完成「選怪、速度判定、傷害預估」。
* **零後端負擔：** 透過 GitHub Pages 部署，利用 URL 參數實現隊伍分享與跨設備存取。
* **數據可視化：** 直觀顯示屬性克制（4x/2x/0.5x）與出手順序。

---

## 二、 技術棧統整 (Tech Stack)

### 1. 前端框架：**Vue 3 (Composition API)**
* **優勢：** 利用 `ref` 與 `computed` 實現響應式計算。當你切換對手或修改努力值時，傷害數值與速度判定會即時更新，無需手動刷新。
* **UI 組件庫：** 建議搭配 **Tailwind CSS**，便於快速構建適合行動端點擊的大按鈕介面。

### 2. 資料管理與持久化
* **狀態管理：** **Pinia**。用於儲存當前對戰中的「我方 6 隻」與「敵方 3-4 隻」的暫存狀態。
* **持久化：** * **LocalStorage：** 儲存使用者的常用隊伍。
    * **URL State Encoding：** 使用 `pako` 或 `LZ-string` 壓縮隊伍 JSON，並轉為 Base64 嵌入 URL，實現「無帳號跨設備」同步。

### 3. 對戰計算核心 (The Engine)
* **數據來源：** **PokeAPI**。
    * *優化策略：* 開發階段透過腳本預先抓取 JSON 並存於本地 `/src/assets/data/`，避免對戰中因網路延遲導致無法讀取資料。
* **計算邏輯：** **`@smogon/calc`** (JS Library)。
    * 這是業界標準公式，自動處理 $Level$、$Nature$、$Ability$、$Item$ 對數值的修正。

---

## 三、 系統架構 (System Architecture)

### 1. 資料編碼流程 (The "No-Backend" Logic)
當使用者點擊「產生同步連結」時：
> **隊伍物件** $\rightarrow$ **JSON 字串** $\rightarrow$ **Zlib 壓縮** $\rightarrow$ **Base64 編碼** $\rightarrow$ **URL 參數**

### 2. 介面模組化設計
* **`TeamSelector.vue`：** 戰前設定，輸入努力值 (EVs) 與個體值 (IVs)。
* **`BattleScreen.vue`：** 核心對戰頁面。
    * **SpeedLine 模組：** 顯示雙方實數，自動標示誰擁有先手權。
    * **TypeCoverage 模組：** 根據對手屬性，高亮我方招式的克制倍率。
    * **DamageCalc 模組：** 顯示「確一」、「確二」機率區間。

---

## 四、 關鍵開發步驟 (Roadmap)

| 階段 | 任務重點 |
| :--- | :--- |
| **第一階段：資料整備** | 編寫 Python/Node 腳本從 PokeAPI 抓取種族值與屬性表，存為本地 JSON。 |
| **第二階段：UI 建置** | 使用 Vue 3 建立基礎選怪介面，實作屬性相剋的邏輯矩陣。 |
| **第三階段：引擎整合** | 引入 `@smogon/calc`，串接我方與敵方數據，產出傷害數值。 |
| **第四階段：URL 邏輯** | 實作 Base64 編碼功能，讓使用者能透過一串字串載入整支隊伍。 |
| **第五階段：部署** | 透過 GitHub Actions 自動部署至 GitHub Pages，開啟 HTTPS 存取。 |

---

## 五、 預期功能亮点 (Features)

* **「一鍵熱門」：** 內建《寶可夢冠軍》當前賽季 Top 30 的常用努力值配點，點擊對手頭像直接帶入，省去手動調整時間。
* **「速度預警」：** 若對手速度實數可能因為「順風」或「圍巾」超過我方，系統會發出顏色預警。
* **離線支援：** 由於是純前端，配置 PWA 後，就算在訊號不佳的賽場也能流暢運轉。

---