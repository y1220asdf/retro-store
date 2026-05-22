"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function MainGame() {
  const DEV_MODE = false; 
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);

  // ==================== 🔊 大廳通用點擊音效函式 ====================
  const playClickSound = () => {
    const audio = new Audio('/audio/click.mp3');
    audio.volume = 0.2; // 20% 音量，當作輕柔的背景UI回饋
    audio.play().catch((e) => console.log("音效播放被瀏覽器阻擋，等待初次互動:", e));
  };

  const hotspots = [
    { id: 'lottery',  name: '1. 抽抽樂',   href: '/lottery',  style: { top: '30%', left: '44%', width: '10%', height: '31%' } },
    { id: 'candy',    name: '2. 糖果罐',   href: '/candy',    style: { top: '53%', left: '15%', width: '15%', height: '15%' } },
    { id: 'calendar', name: '3. 日曆拼圖', href: '/calendar', style: { top: '65%', left: '50%', width: '8%',  height: '25%' } },
    { id: 'scale',    name: '4. 秤重',     href: '/scale',    style: { top: '52%', left: '33%', width: '15%', height: '15%' } },
    { id: 'cooker',   name: '5. 讓他煮',   href: '/cooker',   style: { top: '51%', left: '59%', width: '6%',  height: '10%' } },
  ];

  return (
    <main onClick={playClickSound} className="flex h-screen w-screen items-center justify-center bg-zinc-900 p-4 overflow-hidden selection:bg-transparent">
      
      {/* ========================================================
          🚀 終極修復方案：
          不使用 background-image，改用 inline-block 容器緊緊包住影片。
          這樣熱區的百分比 (top/left) 就會 100% 鎖死在影片的相對像素上，
          不管別人用什麼螢幕、怎麼縮放，絕對不會跑位！
      ======================================================== */}
      <div className="relative inline-block max-w-full max-h-full rounded-lg shadow-2xl overflow-hidden border border-white/10">
        
        {/* 🎬 換成動態影片標籤：max-h-[90vh] 確保高度不超過螢幕 90% */}
        <video 
          src="/images/main.webm" 
          poster="/images/main.webp" // 影片載入前用靜態圖墊著，防止黑畫面
          autoPlay 
          loop 
          muted // 必須靜音，瀏覽器才允許自動播放
          playsInline // 防止在手機上自動彈出全螢幕
          className="block w-auto h-auto max-w-full max-h-[90vh] object-contain"
        />
        
        {/* ==================== 關卡點擊熱區 ==================== */}
        {hotspots.map((spot) => (
          <Link
            key={spot.id}
            href={spot.href}
            onClick={(e) => playClickSound()} // 點擊關卡立刻響起清脆點擊聲
            className={`absolute cursor-pointer rounded transition-all flex items-center justify-center text-center text-[10px] sm:text-xs font-bold z-10
              ${DEV_MODE 
                ? 'border-2 border-red-500 bg-red-500/20 text-red-200' 
                : 'hover:bg-white/10 active:scale-95'
              }
            `}
            style={spot.style}
            title={spot.name}
          >
            {DEV_MODE && <span className="bg-black/70 px-1 rounded">{spot.id}</span>}
          </Link>
        ))}

        {/* ==================== 圖片內建背包的透明熱區 ==================== */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡，避免點背包時重複觸發兩次聲音
            playClickSound();    // 獨立觸發單次點擊音
            setIsBackpackOpen(true);
          }}
          className={`absolute cursor-pointer rounded-full z-20 flex items-center justify-center text-[10px] sm:text-xs font-bold
            ${DEV_MODE 
              ? 'border-2 border-blue-500 bg-blue-500/30 text-blue-200' 
              : 'hover:bg-white/10 active:scale-90'
            }
          `}
          style={{ top: '80%', left: '91.5%', width: '9%', height: '15%' }}
          title="打開背包"
        >
          {DEV_MODE && <span className="bg-black/70 px-1 rounded">背包</span>}
        </button>


        {/* ==================== 背包彈出視窗 (Modal) ==================== */}
        {isBackpackOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            
            {/* 點擊背景關閉背包 */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                setIsBackpackOpen(false);
              }}
            ></div>
            
            {/* 便條紙與九宮格容器 (隨圖片大小自適應縮放) */}
            <div className="relative flex w-[85%] h-[75%] max-w-4xl max-h-[500px] rounded-2xl bg-[#eedcb3] p-6 shadow-2xl border-4 border-amber-900/40 select-none">
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setIsBackpackOpen(false);
                }}
                className="absolute top-3 right-4 text-2xl font-bold text-amber-900 hover:text-red-600 transition-colors z-10"
              >
                ✕
              </button>

              <div className="flex-1 bg-[#fffdf0] p-4 sm:p-5 rounded-lg shadow-md border border-amber-200 flex flex-col justify-center transform -rotate-1 overflow-y-auto">
                <h2 className="text-sm sm:text-lg font-bold text-amber-900 mb-2 sm:mb-3 border-b border-amber-900/20 pb-1">
                  關卡提示便條紙
                </h2>
                <div className="text-amber-800 space-y-1 sm:space-y-2 font-serif text-xs sm:text-base">
                  <p>• 點擊牆上的掛式抽抽樂尋找線索</p>
                  <p>• 依照便條紙順序撥打轉盤電話</p>
                  <p>• 檢查垃圾桶裡被撕碎的日曆</p>
                  <p>• 依照秘方將紅豆放到磅秤上秤重</p>
                  <p>• 帶著完美紅豆放入電鍋煮湯</p>
                </div>
              </div>

              <div className="w-[45%] sm:w-[38%] ml-4 sm:ml-6 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 bg-amber-950/10 p-2 sm:p-3 rounded-xl border border-amber-900/10 content-start sm:content-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                    {i === 0 && <span className="text-xl sm:text-2xl">📝</span>}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}