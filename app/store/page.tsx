"use client";

import Link from "next/link";
import { Backpack } from "@/components/shared/Backpack";
import { GAME_LABELS } from "@/lib/game/constants";
import type { GameId } from "@/lib/game/types";
import { useGame } from "@/context/GameProvider";

const GAME_ROUTES: Record<GameId, string> = {
  lottery: "/games/lottery",
  "candy-jar": "/games/candy-jar",
  "calendar-puzzle": "/games/calendar-puzzle",
  weighing: "/games/weighing",
  cooking: "/games/cooking",
};

const HOTSPOTS: { game: GameId; label: string; position: string }[] = [
  { game: "lottery", label: "牆上抽抽樂", position: "left-[8%] top-[25%]" },
  { game: "candy-jar", label: "糖果罐", position: "right-[12%] top-[35%]" },
  {
    game: "calendar-puzzle",
    label: "垃圾桶",
    position: "left-[15%] bottom-[20%]",
  },
  { game: "weighing", label: "磅秤", position: "right-[20%] bottom-[25%]" },
  { game: "cooking", label: "電鍋", position: "right-[8%] top-[55%]" },
];

export default function StorePage() {
  const { canEnter, isGameCompleted, unlockHint, resetGame } = useGame();

  return (
    <div className="relative min-h-screen bg-amber-100">
      <Backpack />

      <div className="relative mx-auto min-h-screen max-w-5xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/store/main.png"
          alt="柑仔店主場景"
          className="min-h-[70vh] w-full object-cover opacity-30"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <div className="absolute inset-0 flex flex-col p-4 md:p-8">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link
                href="/"
                className="text-sm text-amber-800 hover:underline"
              >
                ← 首頁
              </Link>
              <h1 className="text-2xl font-bold text-amber-950 md:text-3xl">
                時光柑仔店
              </h1>
              <p className="text-sm text-amber-800">
                點擊場景熱點進入各機關（主場景圖請放到
                public/images/store/main.png）
              </p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="text-xs text-amber-700 underline"
            >
              重置進度（測試用）
            </button>
          </header>

          <div className="relative flex-1 rounded-xl border-4 border-amber-900/20 bg-amber-200/30">
            {HOTSPOTS.map(({ game, label, position }) => {
              const unlocked = canEnter(game);
              const done = isGameCompleted(game);
              return (
                <Link
                  key={game}
                  href={GAME_ROUTES[game]}
                  className={`absolute ${position} rounded-lg border-2 px-3 py-2 text-sm font-semibold shadow-md transition hover:scale-105 ${
                    done
                      ? "border-green-800 bg-green-100 text-green-900"
                      : unlocked
                        ? "border-amber-900 bg-amber-50 text-amber-950 hover:bg-amber-100"
                        : "border-amber-700/50 bg-amber-100/80 text-amber-700"
                  }`}
                  title={unlocked ? GAME_LABELS[game] : unlockHint(game)}
                >
                  {label}
                  {done && " ✓"}
                </Link>
              );
            })}
          </div>

          <nav className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(GAME_ROUTES) as GameId[]).map((game) => (
              <Link
                key={game}
                href={GAME_ROUTES[game]}
                className="rounded-lg border border-amber-800/40 bg-white/70 px-4 py-3 hover:bg-white"
              >
                <span className="font-medium">{GAME_LABELS[game]}</span>
                {isGameCompleted(game) && (
                  <span className="ml-2 text-green-700">已通關</span>
                )}
                {!canEnter(game) && (
                  <span className="mt-1 block text-xs text-amber-700">
                    🔒 {unlockHint(game)}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
