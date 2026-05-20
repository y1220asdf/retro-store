"use client";

import { GameProvider } from "@/context/GameProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
