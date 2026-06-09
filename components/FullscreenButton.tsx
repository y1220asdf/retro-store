"use client";

import { useState, useEffect } from "react";

export default function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // 監聽全螢幕狀態變化（包含使用者按 ESC 退出）
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange); // 支援舊版 Safari

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // 1. 進入全螢幕模式（這會自動隱藏手機網址列）
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          // iOS Safari 的全螢幕 API 較特殊
          await (element as any).webkitRequestFullscreen();
        }

        // 2. 嘗試鎖定為橫螢幕 (Landscape)
        // 注意：瀏覽器規定必須先進入全螢幕，才能鎖定螢幕方向
        if (
          window.screen &&
          window.screen.orientation &&
          typeof (window.screen.orientation as any).lock === "function"
        ) {
          await (window.screen.orientation as any)
            .lock("landscape")
            .catch((err: any) => {
              // 如果失敗（例如 iOS 不支援），就在控制台紀錄，並靠 OrientationPrompt 提示玩家
              console.log("瀏覽器不支援或拒絕自動鎖定橫螢幕:", err);
            });
        }
      } else {
        // 退出全螢幕
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }

        // 解除螢幕方向鎖定
        if (
          window.screen &&
          window.screen.orientation &&
          window.screen.orientation.unlock
        ) {
          window.screen.orientation.unlock();
        }
      }
    } catch (error) {
      console.error("全螢幕切換失敗:", error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed bottom-6 left-6 z-[99] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-zinc-900/80 text-white shadow-lg backdrop-blur-md transition-all hover:bg-zinc-800 hover:scale-105 active:scale-95 md:h-14 md:w-14"
      title={isFullscreen ? "退出全螢幕" : "進入全螢幕"}
      aria-label={isFullscreen ? "退出全螢幕" : "進入全螢幕"}
    >
      {isFullscreen ? (
        // 縮小圖標 (Exit Fullscreen)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5 md:h-6 md:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9V4.5M9 9H4.5M9 9L3 3m12 6V4.5M15 9h4.5M15 9l6-6M9 15v4.5M9 15H4.5M9 15l-6 6m12-5.5V21m0-4.5h4.5m-4.5 0l6 6"
          />
        </svg>
      ) : (
        // 放大圖標 (Enter Fullscreen)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-5 w-5 md:h-6 md:w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0l-6-6"
          />
        </svg>
      )}
    </button>
  );
}