"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// 🎯 依照流程圖與需求：3x4 網格，共 12 格
const COLS = 4;
const ROWS = 3;
const TOTAL_CELLS = ROWS * COLS;

type SFXType = 'cardFlip' | 'success';

interface PuzzlePiece {
  id: number;       // 正確位置的索引 (0 ~ 11)
  currentIdx: number; // 目前在陣列中的位置
}

export default function CalendarPuzzle() {
  const router = useRouter();

  // ==================== 遊戲狀態管理 ====================
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null); // 記錄第一個被點選的碎片陣列索引
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // ==================== 🔊 音效系統 (手機相容優化版) ====================
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const isAudioUnlocked = useRef<boolean>(false);

  useEffect(() => {
    // 初始化音效檔案
    audioRefs.current = {
      cardFlip: new Audio('/audio/paper01.mp3'),
      success: new Audio('/audio/gameclear.mp3'), // 通關用阿公懷舊音效
    };

    // 初始化拼圖並「強制打亂」
    initializeAndShufflePuzzle();
  }, []);

  // 🔑 手機音效解鎖機制 
  const unlockAudioForMobile = (excludeType?: string) => {
    if (isAudioUnlocked.current) return;
    isAudioUnlocked.current = true;

    Object.entries(audioRefs.current).forEach(([key, audio]) => {
      if (key === excludeType) return;
      audio.muted = true;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        }).catch(e => console.log("音效解鎖狀態:", e));
      }
    });
  };

  const playSFX = (type: SFXType) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(e => console.log(`音效 ${type} 播放被阻擋:`, e));
  };

  // ==================== 🧩 拼圖打亂邏輯 ====================
  const initializeAndShufflePuzzle = () => {
    let initialPieces = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      currentIdx: i,
    }));

    // Fisher-Yates 洗牌演算法，並確保打亂後的順序不會剛好是正確的
    let isCorrect = true;
    while (isCorrect) {
      for (let i = initialPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialPieces[i], initialPieces[j]] = [initialPieces[j], initialPieces[i]];
      }
      // 檢查是否不幸隨機洗出了完全正確的拼圖
      isCorrect = initialPieces.every((piece, index) => piece.id === index);
    }

    setPieces(initialPieces);
    setIsGameOver(false);
    setSelectedIdx(null);
  };

  // ==================== 🖱️ 點擊與碎片交換邏輯 ====================
  const handlePieceClick = (index: number) => {
    if (isGameOver) return;
    
    // 觸發手機瀏覽器音效解鎖
    unlockAudioForMobile('cardFlip');
    playSFX('cardFlip');

    // 1. 如果尚未選取第一個碎片
    if (selectedIdx === null) {
      setSelectedIdx(index);
    } 
    // 2. 如果點擊同一個碎片，則取消選取
    else if (selectedIdx === index) {
      setSelectedIdx(null);
    } 
    // 3. 選取了第二個不同的碎片，進行位置交換
    else {
      const newPieces = [...pieces];
      // 交換陣列中的兩個物件
      [newPieces[selectedIdx], newPieces[index]] = [newPieces[index], newPieces[selectedIdx]];
      
      setPieces(newPieces);
      setSelectedIdx(null); // 清空選取狀態

      // 檢查是否全數拼對成功
      checkWinCondition(newPieces);
    }
  };

  // ==================== 🏆 勝利檢查邏輯 ====================
  const checkWinCondition = (currentPieces: PuzzlePiece[]) => {
    const win = currentPieces.every((piece, index) => piece.id === index);
    if (win) {
      setTimeout(() => {
        playSFX('success');
        setIsGameOver(true);
        // 寫入 localStorage 讓天秤關卡（ScaleGame）可以順利遊玩
        localStorage.setItem('hasRecipe', 'true');
        localStorage.setItem('hasPhoto', 'true'); // 流程圖中的回憶相片
      }, 400);
    }
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-transparent">
      {/* 16:9 比例遊戲主視窗外殼 (與組員規格完全統一) */}
      <div className="relative inline-block w-full max-w-5xl aspect-video rounded-xl shadow-2xl bg-zinc-900 border border-white/10 overflow-hidden">
        
        {/* 最底層場景背景：垃圾桶近景 */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <img
            src="/images/calendar_background.png" // 日曆關卡的背景底圖
            alt="場景背景"
            className="w-full h-full object-cover opacity-40 saturate-150 brightness-130"
          />
        </div>

        {/* 返回鍵 (復古風格統一) */}
        <button
          onClick={() => router.push('/main')}
          className="absolute top-4 left-4 z-40 flex items-center justify-center rounded-full border border-amber-900/40 bg-[#fffdf0]/90 px-4 py-2 text-sm font-bold text-amber-900 backdrop-blur-sm shadow-[4px_4px_0px_rgba(120,60,0,0.2)] transition-all hover:bg-white active:scale-95"
        >
          ⬅ 返回柑仔店
        </button>

        {/* 關卡提示文字 */}
        <div className="absolute top-4 right-6 z-20 text-right">
          <p className="text-amber-100/70 font-serif font-bold text-sm tracking-wide">
            提示：點擊兩個碎片可以交換位置，拼出完整的日曆。
          </p>
        </div>

        {/* ==================== 🧩 3x4 拼圖主容器 ==================== */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className="grid bg-stone-900/60 p-4 rounded-2xl border-4 border-amber-900/60 shadow-2xl backdrop-blur-xs"
            style={{
              width: '50%',             // 依據 16:9 比例優化後的拼圖大小
              aspectRatio: '4 / 3',
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              gap: '8px',
            }}
          >
            {pieces.map((piece, index) => {
              const isSelected = selectedIdx === index;

              return (
                <motion.div
                  key={piece.id}
                  onClick={() => handlePieceClick(index)}
                  className="relative w-full h-full select-none cursor-pointer rounded-lg overflow-hidden"
                  // 依要求：被選取的碎片微微放大、帶有白邊
                  animate={{
                    scale: isSelected ? 1.05 : 1,
                    boxShadow: isSelected 
                      ? '0 0 0 4px #ffffff, 0 10px 20px rgba(0,0,0,0.5)' 
                      : '0 2px 6px rgba(0,0,0,0.3)',
                    zIndex: isSelected ? 2 : 1,
                  }}
                  whileHover={!isGameOver && !isSelected ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
                  whileTap={!isGameOver ? { scale: 0.98 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  {/* 12張獨立碎片圖片命名規範：calendar_piece_0.webp 到 calendar_piece_11.webp */}
                  <img
                    src={`/images/calendar_piece_${piece.id}.webp`}
                    alt={`日曆碎片-${piece.id}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                  
                  {/* 覆蓋一層淡淡的邊框讓結構更清晰 */}
                  <div className="absolute inset-0 border border-white/10 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ==================== 📜 通關老照片/紅豆秘方放大彈窗 ==================== */}
        {isGameOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in select-none">
            <div className="bg-[#fffdf0] p-6 rounded-2xl border-4 border-amber-900 max-w-md w-[90%] text-center shadow-[0_0_50px_rgba(255,170,0,0.3)] flex flex-col items-center">
              <span className="text-4xl mb-2 animate-bounce">✨</span>
              <h2 className="text-xl font-black text-amber-950 font-serif mb-1">成功拼回日曆！</h2>
              <p className="text-xs text-emerald-800 font-bold mb-4 leading-relaxed">
                翻到日曆的背面，竟然有阿嬤用原子筆隨手寫下的紅豆湯獨門配方...！
              </p>

              {/* 顯示紅豆湯秘方圖片：scale_menu.webp */}
              <div className="relative w-[72%] aspect-1672/941 bg-zinc-100 rounded-lg border-4 border-white shadow-xl overflow-hidden mb-5 transform rotate-1">
                <img
                  src="/images/scale_menu.webp"
                  alt="阿公的紅豆湯秘方"
                  className="w-full h-full object-contain"
                />
              </div>

              <button
                onClick={() => router.push('/main')}
                className="w-full py-3 rounded-xl bg-amber-900 text-amber-50 text-base font-bold tracking-widest shadow-md transition-all hover:bg-amber-950 active:scale-95 cursor-pointer"
              >
                收進背包並回到柑仔店
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}