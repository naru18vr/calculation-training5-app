# 計算トレーニングアプリ (Calculation Training App)

An interactive web application for students in Japan to practice and improve their math calculation skills, from elementary to junior high school levels. Users can select their grade, choose a specific math topic, and take a quiz. The app provides instant feedback, tracks results, and keeps a history of performance.

---

## ✅ GitHub Pages 公開前の最終確認リスト

### 1. ビルド設定まわり

* [ ] **vite.config.ts**
  `base: process.env.BASE_PATH ?? '/'` になっているか
  （＝Workflowから自動注入される）

* [ ] **GitHub Actions（deploy.yml）**
  `BASE_PATH: "/${{ github.event.repository.name }}/"` が `Build` ステップに設定されているか

* [ ] **package.json scripts**
  `dev` = `"vite"`, `build` = `"vite build"` になっているか（`gh-pages` は不要）

---

### 2. CSS/Tailwind

* [ ] **src/main.tsx** で `import './index.css'` が読み込まれているか
* [ ] **tailwind.config.js** →
  `content: ['./index.html', './src/**/*.{ts,tsx}']` になっているか
* [ ] **index.css** が `@tailwind base; @tailwind components; @tailwind utilities;` だけになっているか
* [ ] Google Fonts を使うなら、`index.html` の `<head>` に `<link>` で入れているか（`@import` はNG）

---

### 3. アセットまわり

* [ ] 画像・アイコンが **絶対パス `/assets/...` ではなく相対 import** になっているか

  ```ts
  import logo from './assets/logo.png'
  // or
  const url = new URL('./assets/logo.png', import.meta.url).href
  ```
* [ ] Favicon も相対パス指定になっているか（例：`<link rel="icon" href="./favicon.ico">`）

---

### 4. React/TypeScript

* [ ] `src/index.tsx` は削除済みで、**`src/main.tsx` が唯一のエントリ**になっているか
* [ ] `tsconfig.json` に `jsx: "react-jsx"` が入っているか
* [ ] SVGをTSXで書く場合、属性はキャメルケース（例：`strokeWidth`, `viewBox`, `textAnchor`）

---

### 5. GitHub Pages デプロイ後チェック

* [ ] Actions に **“Deploy to GitHub Pages”** が緑で完了しているか
* [ ] Settings → Pages → 公開URLが出ているか
* [ ] 公開URLでJS/CSSが 404 になっていないか（＝`/<リポ名>/assets/...` で取れている）
* [ ] ブラウザコンソールに赤エラーが出ていないか
