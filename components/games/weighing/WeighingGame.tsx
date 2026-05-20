"use client";

/**
 * 秤重 — 負責人：洪秀蓮
 *
 * 實作重點：
 * - 需背包「紅豆秘方」才能玩（路由層已檢查）
 * - 砝碼與紅豆拖曳，天秤平衡後通關
 * - 獎勵：紅豆、回憶相片
 */

import { DevCompleteButton } from "@/components/shared/DevCompleteButton";
import { PlaceholderScene } from "@/components/shared/PlaceholderScene";
import { useGame } from "@/context/GameProvider";

export function WeighingGame() {
  const { hasItem } = useGame();

  return (
    <div className="space-y-6">
      {!hasItem("red-bean-recipe") && (
        <p className="rounded-lg bg-red-100 px-4 py-2 text-red-900">
          需要「紅豆秘方」才能進行（應由路由擋下，此為雙重提示）。
        </p>
      )}

      <PlaceholderScene
        imagePath="/images/games/weighing/scale.png"
        alt="天秤與砝碼"
      />

      <section className="rounded-xl border border-amber-800/30 bg-white/60 p-4">
        <h2 className="font-bold text-amber-950">待實作</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
          <li>依秘方克重放置砝碼</li>
          <li>勺子撈紅豆至秤盤直到平衡</li>
          <li>
            通關：addItem(&quot;red-beans&quot;)、addItem(&quot;memory-snapshot&quot;)、completeGame(&quot;weighing&quot;)
          </li>
        </ul>
      </section>

      <DevCompleteButton
        game="weighing"
        rewards={["red-beans", "memory-snapshot"]}
      />
    </div>
  );
}
