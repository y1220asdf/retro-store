"use client";

import { useState } from "react";
import { ITEM_CATALOG } from "@/lib/game/constants";
import { useGame } from "@/context/GameProvider";

export function Backpack() {
  const { state } = useGame();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed right-4 top-4 z-50 rounded-lg border-2 border-amber-900 bg-amber-100 px-4 py-2 font-bold text-amber-950 shadow-md hover:bg-amber-200"
        aria-expanded={open}
        aria-label="背包"
      >
        背包 ({state.inventory.length})
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="背包內容"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border-4 border-amber-900 bg-amber-50 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-bold text-amber-950">背包</h2>
            {state.inventory.length === 0 ? (
              <p className="text-amber-800">尚無道具</p>
            ) : (
              <ul className="space-y-3">
                {state.inventory.map((id) => {
                  const item = ITEM_CATALOG[id];
                  return (
                    <li
                      key={id}
                      className="rounded-lg border border-amber-700/40 bg-white/80 p-3"
                    >
                      <p className="font-semibold text-amber-950">
                        {item.name}
                      </p>
                      <p className="text-sm text-amber-800">
                        {item.description}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-amber-800 py-2 text-amber-50 hover:bg-amber-900"
              onClick={() => setOpen(false)}
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </>
  );
}
