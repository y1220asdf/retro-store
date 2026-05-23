"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// 🎯 橫向 5 格，縱向 4 格
const COLS = 5;
const ROWS = 4;
const TOTAL_CELLS = COLS * ROWS;

type Direction = 'up' | 'down' | 'left' | 'right';
type SFXType = 'cardFlip' | 'error' | 'success' | 'pickup';

export default function LuckyDrawGame() {
  const router = useRouter();

  // ==================== 遊戲狀態管理 ====================
  const [answerIdx, setAnswerIdx] = useState<number | null>(null);
  const [flippedSet, setFlippedSet] = useState<Set<number>>(new Set());
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // ==================== 音效架構 ====================
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // 目前只啟用「選取卡片」音效
    audioRefs.current = {
      cardFlip: new Audio('/audio/paper01.mp3'),

      // TODO: 未來音效確認後再啟用
      // error: new Audio('/audio/wrongcall.mp3'),
      // success: new Audio('/audio/grandvoice.mp3'),
      // pickup: new Audio('/audio/oldphonepickup.mp3'),
    };

    const randomAnswer = Math.floor(Math.random() * TOTAL_CELLS);
    setAnswerIdx(randomAnswer);

    console.log("時光柑仔店神秘藏寶格號碼 (0~19):", randomAnswer);

    // TODO: 未來音效確認後再啟用
    // setTimeout(() => playSFX('pickup'), 300);
  }, []);

  const playSFX = (type: SFXType) => {
    const audio = audioRefs.current[type];
    if (!audio) return;

    audio.currentTime = 0;
    audio.play().catch(e => console.log(e));
  };

  // ==================== 📐 正確的方向判斷邏輯 ====================
  const getRowCol = (idx: number) => {
    return {
      row: Math.floor(idx / COLS),
      col: idx % COLS,
    };
  };

  const getArrowDirection = (idx: number): Direction => {
    if (answerIdx === null) return 'down';

    const current = getRowCol(idx);
    const answer = getRowCol(answerIdx);

    const rowDiff = answer.row - current.row;
    const colDiff = answer.col - current.col;

    // 同一列：只能往左或右
    if (rowDiff === 0) {
      return colDiff > 0 ? 'right' : 'left';
    }

    // 同一欄：只能往上或下
    if (colDiff === 0) {
      return rowDiff > 0 ? 'down' : 'up';
    }

    // 斜方向：指向距離較大的方向
    if (Math.abs(rowDiff) > Math.abs(colDiff)) {
      return rowDiff > 0 ? 'down' : 'up';
    }

    return colDiff > 0 ? 'right' : 'left';
  };

  // ==================== 🖼️ 圖片箭頭角度 ====================
  // 假設 lottery_arrow.png 原圖是「朝右」
  const getArrowRotation = (idx: number): number => {
    const dir = getArrowDirection(idx);

    const rotationMap: Record<Direction, number> = {
      right: 0,
      down: 90,
      left: 180,
      up: 270,
    };

    return rotationMap[dir];
  };

  // ==================== 🖱️ 點擊處理 ====================
  const handleCardClick = (idx: number) => {
    if (isGameOver || answerIdx === null) return;
    if (flippedSet.has(idx)) return;

    // 每次選取卡片時播放 paper01.mp3
    playSFX('cardFlip');

    const newFlipped = new Set(flippedSet);
    newFlipped.add(idx);
    setFlippedSet(newFlipped);

    if (idx === answerIdx) {
      setTimeout(() => {
        // TODO: 未來音效確認後再啟用
        // playSFX('success');

        setIsGameOver(true);
        localStorage.setItem('hasPhoto', 'true');
      }, 500);
    } else {
      // TODO: 未來音效確認後再啟用
      // setTimeout(() => {
      //   playSFX('error');
      // }, 400);
    }
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-transparent">
      {/* 16:9 比例遊戲主視窗外殼 */}
      <div className="relative inline-block w-full max-w-5xl aspect-video rounded-xl shadow-2xl bg-zinc-900 border border-white/10 overflow-hidden">

        {/* 最底層場景背景 */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <img
            src="/images/lottery_background.png"
            alt="場景背景"
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        {/* 返回鍵 */}
        <button
          onClick={() => router.push('/main')}
          className="absolute top-4 left-4 z-40 flex items-center justify-center rounded-full border border-amber-900/40 bg-[#fffdf0]/90 px-4 py-2 text-sm font-bold text-amber-900 backdrop-blur-sm shadow-[4px_4px_0px_rgba(120,60,0,0.2)]"
        >
          ⬅ 返回柑仔店
        </button>

        {/* ==================== 🏮 掛軸容器：位置不動 ==================== */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 h-[94%] my-auto z-20 flex items-center justify-center"
          style={{ perspective: '1200px' }}
        >
          {/* 去背抽抽樂掛軸實體底圖：輕微互動 */}
          <motion.img
            src="/images/lottery_back.png"
            alt="抽抽樂機關掛軸"
            className="h-full w-auto object-contain pointer-events-auto z-10"
            whileHover={{
              scale: 1.008,
              filter: 'brightness(1.03) drop-shadow(0 0 6px rgba(255, 220, 150, 0.25))',
            }}
            transition={{
              type: 'spring',
              stiffness: 160,
              damping: 22,
            }}
          />

          {/* ==================== 🎯 卡片網格：只有這層往上移 ==================== */}
          <div
            className="absolute grid p-[0.5%]"
            style={{
              top: '30.8%',
              left: '6.2%',
              width: '87.6%',
              height: '62.0%',
              zIndex: 30,
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
              columnGap: '1.4%',
              rowGap: '1.6%',
            }}
          >
            {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
              const isFlipped = flippedSet.has(i);
              const isAns = i === answerIdx;

              return (
                <motion.div
                  key={i}
                  className="relative w-full h-full select-none cursor-pointer overflow-visible"
                  onClick={() => handleCardClick(i)}
                  whileHover={
                    !isFlipped && !isGameOver
                      ? {
                          scale: 1.08,
                          y: -4,
                          filter: 'drop-shadow(0 0 12px rgba(255, 215, 130, 0.85))',
                        }
                      : {}
                  }
                  whileTap={
                    !isFlipped && !isGameOver
                      ? {
                          scale: 0.96,
                        }
                      : {}
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 18,
                  }}
                  style={{
                    zIndex: !isFlipped ? 2 : 1,
                  }}
                >
                  <motion.div
                    className="w-full h-full relative"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* 【卡片正面】：lottery_card.png */}
                    <div
                      className="absolute inset-0 bg-cover bg-center rounded-sm"
                      style={{
                        backfaceVisibility: 'hidden',
                        backgroundImage: 'url(/images/lottery_card.png)',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    />

                    {/* 【卡片背面】 */}
                    <div
                      className="absolute inset-0 bg-[#fffdf9] border border-amber-900/10 flex flex-col items-center justify-center rounded-sm overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      {isAns ? (
                        /* 答案格：露出藏在後面的老照片 */
                        <div
                          className="w-full h-full bg-cover bg-center animate-fade-in"
                          style={{ backgroundImage: 'url(/images/resolved_photo.png)' }}
                        />
                      ) : (
                        /* 非答案格：使用 lottery_arrow.png */
                        <div className="w-full h-full flex items-center justify-center p-2 animate-fade-in">
                          <img
                            src="/images/lottery_arrow.png"
                            alt="方向提示"
                            className="w-[72%] h-[72%] object-contain transition-transform duration-300 pointer-events-none"
                            style={{ transform: `rotate(${getArrowRotation(i)}deg)` }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ==================== 📸 通關老照片放大彈窗 ==================== */}
        {isGameOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in select-none">
            <div className="bg-[#fffdf0] p-6 rounded-2xl border-4 border-amber-900 max-w-md w-[90%] text-center shadow-[0_0_50px_rgba(180,100,0,0.4)] flex flex-col items-center">
              <span className="text-4xl mb-2 animate-bounce">✨</span>
              <h2 className="text-xl font-black text-amber-950 font-serif mb-1">尋回重要記憶！</h2>
              <p className="text-xs text-emerald-800 font-bold mb-4 leading-relaxed">
                伴隨著紙張撕開的清脆聲，妳終於找到了藏在背後的阿公阿嬤創店照片！
              </p>

              <div className="relative w-full aspect-[4/3] bg-zinc-200 rounded-lg border-4 border-white shadow-xl overflow-hidden mb-5 transform rotate-1">
                <img
                  src="/images/resolved_photo.png"
                  alt="阿公阿嬤創店合照"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={() => router.push('/main')}
                className="w-full py-3 rounded-xl bg-amber-900 text-amber-50 text-base font-bold tracking-widest shadow-md transition-all hover:bg-amber-950 active:scale-95"
              >
                收進背包並回到大廳
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}