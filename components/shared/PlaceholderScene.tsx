"use client";

import type { ReactNode } from "react";

interface PlaceholderSceneProps {
  /** 例如 /images/games/lottery/bg.png */
  imagePath: string;
  alt: string;
  children?: ReactNode;
}

/** 美術圖尚未就緒時的佔位區 — 放入 public 對應路徑即可顯示 */
export function PlaceholderScene({
  imagePath,
  alt,
  children,
}: PlaceholderSceneProps) {
  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-xl border-4 border-amber-900/30 bg-amber-200/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagePath}
        alt={alt}
        className="h-full min-h-[320px] w-full object-cover opacity-40"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-amber-900/10 p-6 text-center">
        <p className="text-sm font-medium text-amber-900">
          場景圖：{imagePath}
        </p>
        <p className="text-xs text-amber-800">
          將 AI 生成圖放到 public 上述路徑即可替換
        </p>
        {children}
      </div>
    </div>
  );
}
