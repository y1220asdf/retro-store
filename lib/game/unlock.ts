import type { GameId, GameState, ItemId } from "./types";

export interface UnlockRule {
  game: GameId;
  requiredItems: ItemId[];
  hint: string;
}

/** 進入關卡的前置條件 — 串關時只改這裡 */
export const UNLOCK_RULES: UnlockRule[] = [
  {
    game: "lottery",
    requiredItems: [],
    hint: "可直接遊玩。",
  },
  {
    game: "candy-jar",
    requiredItems: ["sticky-note"],
    hint: "需要背包裡的「關卡提示便條紙」。",
  },
  {
    game: "calendar-puzzle",
    requiredItems: [],
    hint: "點擊垃圾桶發現撕碎的日曆（可直接進入開發）。",
  },
  {
    game: "weighing",
    requiredItems: ["red-bean-recipe"],
    hint: "需要「紅豆秘方」（完成日曆拼圖）。",
  },
  {
    game: "cooking",
    requiredItems: ["red-beans"],
    hint: "需要「紅豆」（完成秤重）。",
  },
];

export function canEnterGame(state: GameState, game: GameId): boolean {
  const rule = UNLOCK_RULES.find((r) => r.game === game);
  if (!rule) return false;
  return rule.requiredItems.every((id) => state.inventory.includes(id));
}

export function getUnlockHint(game: GameId): string {
  return UNLOCK_RULES.find((r) => r.game === game)?.hint ?? "";
}
