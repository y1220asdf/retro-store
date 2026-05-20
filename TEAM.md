# 時光柑仔店 — 第七組分工說明

## 快速開始

```bash
npm install
npm run dev
```

瀏覽器開啟 http://localhost:3000 →「進入柑仔店」→ 點各機關熱點。

## 目錄與負責人（請主要只改自己的資料夾）

| 組員 | 機關 | 主要程式 | 美術路徑 |
|------|------|----------|----------|
| 林芮竫 | 抽抽樂 | `components/games/lottery/LotteryGame.tsx` | `public/images/games/lottery/` |
| 黃品恩 | 玻璃糖果罐 + 電話 | `components/games/candy-jar/CandyJarGame.tsx` | `public/images/games/candy-jar/` |
| 盧家愛 | 日曆拼圖 | `components/games/calendar-puzzle/CalendarPuzzleGame.tsx` | `public/images/games/calendar-puzzle/` |
| 洪秀蓮 | 秤重 | `components/games/weighing/WeighingGame.tsx` | `public/images/games/weighing/` |
| 陳昱銓 | 讓他煮！ | `components/games/cooking/CookingGame.tsx` | `public/images/games/cooking/` |

共用（需協調再改）：

- `lib/game/unlock.ts` — 關卡解鎖條件
- `lib/game/constants.ts` — 密碼、秒數、道具文案
- `context/GameProvider.tsx` + `lib/game/*` — 背包與通關狀態
- `components/shared/` — 背包、場景外框
- `app/store/page.tsx` — 主場景熱點位置

## 通關時必須呼叫的 API

在各自關卡邏輯完成時：

```tsx
import { useGame } from "@/context/GameProvider";

const { addItem, completeGame } = useGame();

// 例：日曆拼圖通關
addItem("red-bean-recipe");
completeGame("calendar-puzzle");
```

道具 ID 見 `lib/game/types.ts`。完成實作後請**刪除**各頁的 `DevCompleteButton`（僅開發用）。

## 關卡依賴（簡報）

1. 進店即有「關卡提示便條紙」
2. 糖果罐：需便條紙 → 密碼 → 電話 **4271** → 錄音帶
3. 日曆拼圖：拼完 → 紅豆秘方
4. 秤重：需紅豆秘方 → 紅豆 + 回憶相片
5. 讓他煮：需紅豆 → 默數約 18 秒 → 好喝紅豆湯

## Git 建議

每人一條 branch，例如 `feat/lottery-lrj`，只改自己的 `components/games/xxx/` 與對應 `public/images/games/xxx/`，減少衝突。

## 圖片

AI 圖請依 `public/images/README.md` 路徑命名放入；程式已用 `<img src="...">` 預留，放好即顯示。
