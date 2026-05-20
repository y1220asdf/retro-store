"use client";

/**
 * 抽抽樂 — 負責人：林芮竫
 *
 * 實作重點（簡報）：
 * - 網格翻牌，非目標格顯示指向目標的箭頭
 * - 翻到目標格獲得線索 / 通關
 *
 * 建議只改此檔與 public/images/games/lottery/
 */

import { DevCompleteButton } from "@/components/shared/DevCompleteButton";
import { PlaceholderScene } from "@/components/shared/PlaceholderScene";

export function LotteryGame() {
  return (
    <div className="space-y-6">
      <PlaceholderScene
        imagePath="/images/games/lottery/wall.png"
        alt="牆上抽抽樂"
      />

      <section className="rounded-xl border border-amber-800/30 bg-white/60 p-4">
        <h2 className="font-bold text-amber-950">待實作</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
          <li>初始化網格（建議 4×4 或依 wireframe）</li>
          <li>隨機翻牌與箭頭方向邏輯</li>
          <li>目標格翻開後：addItem(&quot;memory-photo&quot;) + completeGame(&quot;lottery&quot;)</li>
        </ul>
      </section>

      <DevCompleteButton
        game="lottery"
        rewards={["memory-photo"]}
      />
    </div>
  );
}
