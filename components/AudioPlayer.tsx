"use client";
import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // 建立一個玩家點擊網頁時觸發的「全動態音樂初始化」函式
    const initAudioAndPlay = () => {
      // 如果已經初始化過，就不要重複執行
      if (audioRef.current) return;

      console.log("偵測到玩家點擊，開始全動態載入背景音樂！");
      
      // 1. 動態建立音訊物件
      const audio = new Audio("/audio/bgm.mp3");
      audio.loop = true;
      audio.volume = 0.15; // 保持 15% 舒適音量

      audioRef.current = audio;
      setHasInteracted(true);

      // 2. 嘗試播放
      audio.play()
        .then(() => {
          console.log("音樂成功暢快播放！");
          // 成功播放後，把網頁點擊的監聽器拔掉，釋放效能
          removeListeners();
        })
        .catch((err) => {
          console.log("動態播放仍被攔截，等待下次點擊:", err);
        });
    };

    const addListeners = () => {
      window.addEventListener('click', initAudioAndPlay);
      window.addEventListener('touchstart', initAudioAndPlay);
      window.addEventListener('keydown', initAudioAndPlay);
    };

    const removeListeners = () => {
      window.removeEventListener('click', initAudioAndPlay);
      window.removeEventListener('touchstart', initAudioAndPlay);
      window.removeEventListener('keydown', initAudioAndPlay);
    };

    // 進入網頁時，先監聽使用者的任何點擊動作
    addListeners();

    // 組件卸載時，確保把實體音樂關閉並釋放監聽器
    return () => {
      removeListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 靜音按鈕控制
  const toggleMute = () => {
    // 如果玩家還沒點擊過網頁，點這個按鈕本身就是第一次互動，會直接觸發初始化
    if (!audioRef.current) return;

    const audio = audioRef.current;
    if (audio.muted) {
      audio.muted = false;
      setIsMuted(false);
      audio.play().catch((err) => console.log(err));
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed top-4 left-4 z-[9999] select-none">
      {/* 畫面上不再保留寫死的 <audio> 標籤，改由上面的 JavaScript 全動態生成 */}
      
      <button
        onClick={toggleMute}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 shadow-lg"
        title={isMuted ? "取消靜音" : "靜音"}
      >
        {isMuted ? (
          <span className="text-lg">🔇</span>
        ) : (
          /* 如果還沒觸發音樂，讓它靜止；觸發成功後再讓它跳動 */
          <span className={`text-lg ${hasInteracted && !isMuted ? 'animate-pulse' : ''}`}>🔊</span>
        )}
      </button>
    </div>
  );
}