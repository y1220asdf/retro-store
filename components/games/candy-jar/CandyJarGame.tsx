"use client";

/**
 * 玻璃糖果罐 + 復古轉盤電話 — 負責人：黃品恩
 *
 * 實作重點：
 * - 依便條紙順序（紅→黃→綠→藍）清點軟糖 → 四位數密碼
 * - 轉盤電話撥號（正確為 4271，見 lib/game/constants.ts）
 * - 通關獲得錄音帶
 */

import { useState } from "react";
import { DevCompleteButton } from "@/components/shared/DevCompleteButton";
import { PlaceholderScene } from "@/components/shared/PlaceholderScene";
import { CANDY_JAR_PASSWORD } from "@/lib/game/constants";
import { useGame } from "@/context/GameProvider";

export function CandyJarGame() {
  const { addItem, completeGame, isGameCompleted } = useGame();
  const [dialed, setDialed] = useState("");

  const handleDial = (digit: string) => {
    if (isGameCompleted("candy-jar")) return;
    const next = (dialed + digit).slice(-4);
    setDialed(next);
    if (next === CANDY_JAR_PASSWORD) {
      addItem("cassette-tape");
      completeGame("candy-jar");
    }
  };

  return (
    <div className="space-y-6">
      <PlaceholderScene
        imagePath="/images/games/candy-jar/jar.png"
        alt="玻璃糖果罐"
      />

      <section className="rounded-xl border border-amber-800/30 bg-white/60 p-4">
        <h2 className="font-bold text-amber-950">糖果清點（待完善 UI）</h2>
        <p className="mt-1 text-sm text-amber-900">
          在此實作四色軟糖點選／計數，組成密碼後再到下方電話撥號。
        </p>
      </section>

      <section className="rounded-xl border border-amber-800/30 bg-white/60 p-4">
        <h2 className="font-bold text-amber-950">復古轉盤電話</h2>
        <p className="mb-3 font-mono text-lg tracking-widest text-amber-950">
          {dialed.padEnd(4, "·")}
        </p>
        <div className="flex flex-wrap gap-2">
          {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              className="h-12 w-12 rounded-full border-2 border-amber-900 bg-amber-100 font-bold hover:bg-amber-200"
              onClick={() => handleDial(d)}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            className="rounded-lg px-3 text-sm text-amber-800 underline"
            onClick={() => setDialed("")}
          >
            清除
          </button>
        </div>
        {isGameCompleted("candy-jar") && (
          <p className="mt-3 text-green-800">已撥通，獲得錄音帶。</p>
        )}
      </section>

      <DevCompleteButton game="candy-jar" rewards={["cassette-tape"]} />
    </div>
  );
}
