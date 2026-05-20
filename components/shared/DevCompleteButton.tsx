"use client";

import type { GameId, ItemId } from "@/lib/game/types";
import { useGame } from "@/context/GameProvider";

interface DevCompleteButtonProps {
  game: GameId;
  /** 通關時要加入背包的道具 */
  rewards: ItemId[];
  label?: string;
}

/**
 * 開發用：各組員實作完邏輯後請刪除此按鈕，
 * 改在通關條件成立時呼叫 addItem / completeGame。
 */
export function DevCompleteButton({
  game,
  rewards,
  label = "【開發】模擬通關",
}: DevCompleteButtonProps) {
  const { addItem, completeGame, isGameCompleted } = useGame();

  if (isGameCompleted(game)) {
    return (
      <p className="rounded-lg border border-green-700/30 bg-green-50 px-4 py-2 text-green-900">
        此關已通關
      </p>
    );
  }

  return (
    <button
      type="button"
      className="rounded-lg border-2 border-dashed border-amber-700 bg-amber-100/50 px-4 py-2 text-sm text-amber-900 hover:bg-amber-200"
      onClick={() => {
        rewards.forEach((item) => addItem(item));
        completeGame(game);
      }}
    >
      {label}
    </button>
  );
}
