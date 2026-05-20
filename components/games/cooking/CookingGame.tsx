"use client";

/**
 * 讓他煮！ — 負責人：陳昱銓
 *
 * 實作重點：
 * - 從背包放入紅豆、拖曳加水、蓋鍋蓋、開關計時
 * - 默數約 {COOKING_TARGET_SECONDS} 秒開蓋，時間決定紅豆湯品質
 * - 僅「完美紅豆湯」算通關
 */

import { DevCompleteButton } from "@/components/shared/DevCompleteButton";
import { PlaceholderScene } from "@/components/shared/PlaceholderScene";
import { COOKING_TARGET_SECONDS } from "@/lib/game/constants";
import { useGame } from "@/context/GameProvider";

export function CookingGame() {
  const { hasItem } = useGame();

  return (
    <div className="space-y-6">
      {!hasItem("red-beans") && (
        <p className="rounded-lg bg-red-100 px-4 py-2 text-red-900">
          需要「紅豆」才能進行（應由路由擋下）。
        </p>
      )}

      <PlaceholderScene
        imagePath="/images/games/cooking/pot.png"
        alt="電鍋"
      />

      <section className="rounded-xl border border-amber-800/30 bg-white/60 p-4">
        <h2 className="font-bold text-amber-950">待實作</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
          <li>材料放入、蓋蓋、按下開關開始計時</li>
          <li>目標默數：約 {COOKING_TARGET_SECONDS} 秒（見 constants.ts）</li>
          <li>
            通關：addItem(&quot;perfect-red-bean-soup&quot;)、completeGame(&quot;cooking&quot;)
          </li>
        </ul>
      </section>

      <DevCompleteButton
        game="cooking"
        rewards={["perfect-red-bean-soup"]}
      />
    </div>
  );
}
