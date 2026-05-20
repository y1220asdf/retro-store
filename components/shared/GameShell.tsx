import Link from "next/link";
import type { ReactNode } from "react";
import { Backpack } from "./Backpack";

interface GameShellProps {
  title: string;
  owner: string;
  children: ReactNode;
}

/** 各關卡頁面共用外框：標題、返回柑仔店、背包 */
export function GameShell({ title, owner, children }: GameShellProps) {
  return (
    <div className="min-h-screen bg-amber-50">
      <Backpack />
      <header className="border-b-2 border-amber-900/20 bg-amber-100/80 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <Link
            href="/store"
            className="text-sm font-medium text-amber-900 underline-offset-2 hover:underline"
          >
            ← 返回柑仔店
          </Link>
          <p className="text-xs text-amber-700">負責：{owner}</p>
        </div>
        <h1 className="mx-auto mt-2 max-w-4xl text-2xl font-bold text-amber-950">
          {title}
        </h1>
      </header>
      <main className="mx-auto max-w-4xl p-4 md:p-8">{children}</main>
    </div>
  );
}
