import type { GameId, InventoryItem, ItemId } from "./types";

/** 道具顯示名稱 — 美術與文案可在此調整 */
export const ITEM_CATALOG: Record<ItemId, InventoryItem> = {
  "sticky-note": {
    id: "sticky-note",
    name: "關卡提示便條紙",
    description: "寫著各機關的線索，先從這裡開始探索。",
  },
  "memory-photo": {
    id: "memory-photo",
    name: "回憶照片",
    description: "抽抽樂機關獲得的回憶碎片。",
  },
  "cassette-tape": {
    id: "cassette-tape",
    name: "錄音帶",
    description: "阿嬤的聲音，來自復古轉盤電話。",
  },
  "red-bean-recipe": {
    id: "red-bean-recipe",
    name: "紅豆秘方",
    description: "完整日曆背面的秘方。",
  },
  "red-beans": {
    id: "red-beans",
    name: "紅豆",
    description: "秤重後得到的紅豆。",
  },
  "memory-snapshot": {
    id: "memory-snapshot",
    name: "回憶相片",
    description: "秤重關卡獲得的另一段回憶。",
  },
  "perfect-red-bean-soup": {
    id: "perfect-red-bean-soup",
    name: "好喝紅豆湯",
    description: "完美火候煮出的紅豆湯。",
  },
};

/** 各關卡在柑仔店場景的入口標籤 */
export const GAME_LABELS: Record<GameId, string> = {
  lottery: "抽抽樂",
  "candy-jar": "玻璃糖果罐",
  "calendar-puzzle": "日曆拼圖",
  weighing: "秤重",
  cooking: "讓他煮！",
};

/** 糖果罐正確密碼（紅→黃→綠→藍 軟糖數量）— 黃品恩可改 */
export const CANDY_JAR_PASSWORD = "4271";

/** 讓他煮！目標默數秒數 — 陳昱銓可改 */
export const COOKING_TARGET_SECONDS = 18;
