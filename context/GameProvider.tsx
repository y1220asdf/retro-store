"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { gameReducer, initialGameState } from "@/lib/game/reducer";
import type { GameId, GameState, ItemId } from "@/lib/game/types";
import { canEnterGame, getUnlockHint } from "@/lib/game/unlock";

interface GameContextValue {
  state: GameState;
  addItem: (item: ItemId) => void;
  completeGame: (game: GameId) => void;
  resetGame: () => void;
  hasItem: (item: ItemId) => boolean;
  isGameCompleted: (game: GameId) => boolean;
  canEnter: (game: GameId) => boolean;
  unlockHint: (game: GameId) => string;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const addItem = useCallback((item: ItemId) => {
    dispatch({ type: "ADD_ITEM", item });
  }, []);

  const completeGame = useCallback((game: GameId) => {
    dispatch({ type: "COMPLETE_GAME", game });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      addItem,
      completeGame,
      resetGame,
      hasItem: (item) => state.inventory.includes(item),
      isGameCompleted: (game) => state.completed[game],
      canEnter: (game) => canEnterGame(state, game),
      unlockHint: getUnlockHint,
    }),
    [state, addItem, completeGame, resetGame],
  );

  return (
    <GameContext.Provider value={value}>{children}</GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error("useGame 必須在 GameProvider 內使用");
  }
  return ctx;
}
