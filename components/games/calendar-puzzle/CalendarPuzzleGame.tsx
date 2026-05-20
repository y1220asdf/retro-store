"use client";

/**
 * 日曆拼圖 — 負責人：盧家愛
 *
 * 實作重點：
 * - 3×4 格子，點兩格交換位置
 * - 拼完顯示背面線索「紅豆秘方」並通關
 */

import { DevCompleteButton } from "@/components/shared/DevCompleteButton";
import { PlaceholderScene } from "@/components/shared/PlaceholderScene";

const GRID_ROWS = 3;
const GRID_COLS = 4;

export function CalendarPuzzleGame() {
  return (
    <div className="space-y-6">
      <PlaceholderScene
        imagePath="/images/games/calendar-puzzle/trash.png"
        alt="垃圾桶與日曆碎片"
      />

      <section className="rounded-xl border border-amber-800/30 bg-white/60 p-4">
        <h2 className="font-bold text-amber-950">拼圖區（骨架）</h2>
        <div
          className="mt-4 grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GRID_ROWS * GRID_COLS }, (_, i) => (
            <button
              key={i}
              type="button"
              className="aspect-[3/4] rounded border-2 border-dashed border-amber-700/50 bg-amber-100/80 text-xs text-amber-800"
            >
              片 {i + 1}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-amber-900">
          實作交換邏輯後，通關請呼叫 addItem(&quot;red-bean-recipe&quot;) 與
          completeGame(&quot;calendar-puzzle&quot;)。
        </p>
      </section>

      <DevCompleteButton
        game="calendar-puzzle"
        rewards={["red-bean-recipe"]}
      />
    </div>
  );
}
