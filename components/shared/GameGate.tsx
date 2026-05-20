"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { GameId } from "@/lib/game/types";
import { GAME_LABELS } from "@/lib/game/constants";
import { useGame } from "@/context/GameProvider";

interface GameGateProps {
  game: GameId;
  children: ReactNode;
}

/** 檢查前置道具，未解鎖則顯示提示 */
export function GameGate({ game, children }: GameGateProps) {
  const { canEnter, unlockHint } = useGame();

  if (!canEnter(game)) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border-4 border-amber-900 bg-amber-50 p-8 text-center">
        <h1 className="text-xl font-bold text-amber-950">
          {GAME_LABELS[game]} — 尚未解鎖
        </h1>
        <p className="mt-4 text-amber-900">{unlockHint(game)}</p>
        <Link
          href="/store"
          className="mt-6 inline-block rounded-lg bg-amber-800 px-6 py-2 text-amber-50 hover:bg-amber-900"
        >
          返回柑仔店
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
