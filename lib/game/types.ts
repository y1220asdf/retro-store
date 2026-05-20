/** 道具 ID — 與簡報一致，新增請同步 lib/game/unlock.ts */
export type ItemId =
  | "sticky-note" // 關卡提示便條紙（進店即得）
  | "memory-photo" // 抽抽樂通關
  | "cassette-tape" // 玻璃糖果罐通關
  | "red-bean-recipe" // 日曆拼圖通關
  | "red-beans" // 秤重通關
  | "memory-snapshot" // 秤重通關
  | "perfect-red-bean-soup"; // 讓他煮！通關

export type GameId =
  | "lottery"
  | "candy-jar"
  | "calendar-puzzle"
  | "weighing"
  | "cooking";

export type GameProgress = Record<GameId, boolean>;

export interface InventoryItem {
  id: ItemId;
  name: string;
  description: string;
}

export interface GameState {
  inventory: ItemId[];
  completed: GameProgress;
}

export type GameAction =
  | { type: "ADD_ITEM"; item: ItemId }
  | { type: "COMPLETE_GAME"; game: GameId }
  | { type: "RESET" };
