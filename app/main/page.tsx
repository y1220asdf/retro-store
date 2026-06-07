"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MainGame() {
  const DEV_MODE = false; 
  const router = useRouter();
  
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  
  // ==================== 🎒 道具狀態管理 ====================
  const [hasTape, setHasTape] = useState(false);
  const [hasFilm, setHasFilm] = useState(false);
  const [hasRecipe, setHasRecipe] = useState(false);
  const [hasBeans, setHasBeans] = useState(false);
  
  // ==================== 🚨 互動視窗狀態 ====================
  const [showReplayAlert, setShowReplayAlert] = useState(false);
  const [pendingHref, setPendingHref] = useState("");
  
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // ==================== 👆 新手引導提示 ====================
  const [showBackpackHint, setShowBackpackHint] = useState(false);
  const [showNoteHint, setShowNoteHint] = useState(false);

  // ==================== ✨ 已完成關卡追蹤（用於發光邊框） ====================
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!localStorage.getItem('hasSeenBackpackHint')) {
      setShowBackpackHint(true);
    }
    const keys = new Set<string>();
    ['hasFilm', 'hasTape', 'hasRecipe', 'hasBeans', 'hasSoup'].forEach(k => {
      if (localStorage.getItem(k) === 'true') keys.add(k);
    });
    setCompletedKeys(keys);
  }, []);

  // 當打開背包時，去 localStorage 檢查玩家是否有拿到道具
  useEffect(() => {
    if (isBackpackOpen) {
      if (localStorage.getItem('hasTape') === 'true') setHasTape(true);
      if (localStorage.getItem('hasFilm') === 'true') setHasFilm(true);
      if (localStorage.getItem('hasRecipe') === 'true') setHasRecipe(true);
      if (localStorage.getItem('hasBeans') === 'true') setHasBeans(true);
    }
  }, [isBackpackOpen]);

  // ==================== 🗑️ 重置背包與進度 ====================
  const handleResetBackpack = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    
    if (window.confirm("確定要重置所有道具與遊戲進度嗎？")) {
      localStorage.removeItem('hasTape');
      localStorage.removeItem('hasFilm');
      localStorage.removeItem('hasRecipe');
      localStorage.removeItem('hasBeans');
      
      // 同步把畫面上的狀態歸零
      setHasTape(false);
      setHasFilm(false);
      setHasRecipe(false);
      setHasBeans(false);
    }
  };

  // 控制目前呈現正向（normal）還是逆向（reverse）
  const [playDirection, setPlayDirection] = useState<'normal' | 'reverse'>('normal');

  const normalVideoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const grandVoiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // ==================== 🔊 音效處理函式 ====================
  const playClickSound = () => {
    const audio = new Audio('/audio/click.mp3');
    audio.volume = 0.2; 
    audio.play().catch((e) => console.log("音效播放被瀏覽器阻擋:", e));
  };

  const playGrandVoice = () => {
    if (!grandVoiceAudioRef.current) {
      grandVoiceAudioRef.current = new Audio('/audio/grandvoice.mp3');
      grandVoiceAudioRef.current.volume = 0.8;
    }
    // 每次點擊都從頭播放
    grandVoiceAudioRef.current.currentTime = 0;
    grandVoiceAudioRef.current.play().catch((e) => console.log("錄音帶播放失敗:", e));
  };

  // ==================== 🎬 雙影片無縫接力循環邏輯 ====================
  useEffect(() => {
    const normalVideo = normalVideoRef.current;
    const reverseVideo = reverseVideoRef.current;
    if (!normalVideo || !reverseVideo) return;

    const handleNormalEnded = () => {
      setPlayDirection('reverse');
      reverseVideo.currentTime = 0;
      reverseVideo.play().catch(e => console.log("倒向播放被阻擋:", e));
    };

    const handleReverseEnded = () => {
      setPlayDirection('normal');
      normalVideo.currentTime = 0;
      normalVideo.play().catch(e => console.log("正向播放被阻擋:", e));
    };

    normalVideo.addEventListener('ended', handleNormalEnded);
    reverseVideo.addEventListener('ended', handleReverseEnded);

    normalVideo.play().catch(e => console.log(e));

    const touchStart = () => {
      if (playDirection === 'normal') normalVideo.play().catch(e => console.log(e));
      if (playDirection === 'reverse') reverseVideo.play().catch(e => console.log(e));
    };
    window.addEventListener('click', touchStart);

    return () => {
      normalVideo.removeEventListener('ended', handleNormalEnded);
      reverseVideo.removeEventListener('ended', handleReverseEnded);
      window.removeEventListener('click', touchStart);
    };
  }, [playDirection]);

  {/* ==================== 關卡點擊熱區 (圖片化) ==================== */}
  const hotspots = [
    { id: 'lottery',  name: '抽抽樂！來抽一個看看',  href: '/lottery',  itemKey: 'hasFilm',   image: '/images/obj_lottery.png',  style: { top: '30%', left: '45.3%', width: '10.3%', height: '30.8%' } },
    { id: 'candy',    name: '哇！有好多不同顏色的糖果！',  href: '/candy',    itemKey: 'hasTape',   image: '/images/obj_candy.png',    style: { top: '53.6%', left: '19.4%', width: '6%', height: '13.8%' } },
    { id: 'calendar', name: '垃圾桶裡好像有什麼...？', href: '/calendar', itemKey: 'hasRecipe', image: '/images/obj_calendar.png', style: { top: '72.6%', left: '50.7%', width: '7%',  height: '20%' } },
    { id: 'scale',    name: '現在好少看到這種傳統的天秤喔...',     href: '/scale',    itemKey: 'hasBeans',  image: '/images/obj_scale.png',    style: { top: '52%', left: '34%', width: '15%', height: '15%' } },
    { id: 'cooker',   name: '每個台灣人家裡都有的大同電鍋',   href: '/cooker',   itemKey: 'hasSoup', image: '/images/obj_cooker.png',   style: { top: '50.3%', left: '59.9%', width: '7%',  height: '10.4%' } },
  ];

  {hotspots.map((spot) => (
  <Link
    key={spot.id}
    href={spot.href}
    onClick={() => playClickSound()}
    className="absolute z-20"
    style={spot.style}
  >
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      initial={{ opacity: 0.9, scale: 1 }}
      whileHover={{ 
        opacity: 1, 
        scale: 1.1,
        // filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))" // 懸停時發光
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* 去背圖片物件 */}
      <img 
        src={spot.image} 
        alt={spot.name} 
        className="w-full h-full object-contain"
      />

      {/* 開發模式顯示標籤 */}
      {DEV_MODE && (
        <span className="absolute -top-6 bg-black/70 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap">
          {spot.id}
        </span>
      )}
    </motion.div>
  </Link>
))}

  return (
    <main onClick={playClickSound} className="flex h-screen w-screen items-center justify-center bg-zinc-900 p-4 overflow-hidden selection:bg-transparent">
      
      <div className="relative inline-block max-w-full max-h-full rounded-lg shadow-2xl overflow-hidden border border-white/10">
        
        {/* 🎬 影片一：正向播放影片層 */}
        <video 
          ref={normalVideoRef}
          src="/images/main.webm" 
          poster="/images/main.webp"
          muted 
          playsInline 
          className={`block w-auto h-auto max-w-full max-h-[90vh] object-contain
            ${playDirection === 'normal' ? 'opacity-100 z-10' : 'opacity-0 absolute top-0 left-0 z-0 pointer-events-none'}
          `}
        />

        {/* 🎬 影片二：倒向播放影片層 */}
        <video 
          ref={reverseVideoRef}
          src="/images/mainre.webm" 
          muted 
          playsInline 
          preload="auto"
          className={`block w-auto h-auto max-w-full max-h-[90vh] object-contain
            ${playDirection === 'reverse' ? 'opacity-100 z-10' : 'opacity-0 absolute top-0 left-0 z-0 pointer-events-none'}
          `}
        />
        
        {/* ==================== 關卡點擊熱區 (整合圖片與重複檢查邏輯) ==================== */}
        {hotspots.map((spot) => (
          <Link
            key={spot.id}
            href={spot.href}
            onClick={(e) => {
              playClickSound();

              // --- 重複遊玩彈窗檢查 ---
              if (spot.itemKey) {
                const hasItem = localStorage.getItem(spot.itemKey) === 'true';
                if (hasItem) {
                  e.preventDefault(); 
                  setPendingHref(spot.href); 
                  setShowReplayAlert(true);  
                }
              }
            }}
            // 用透明容器
            className={`absolute cursor-pointer z-20 flex items-center justify-center
              ${DEV_MODE ? 'border-2 border-red-500 bg-red-500/10' : ''}
            `}
            style={spot.style}
            title={spot.name}
          >
            {/* 🎬 物件圖片層：外層管 scale，內層圖片管常駐發光 */}
            {(() => {
              const isCompleted = completedKeys.has(spot.itemKey);
              return (
                <motion.div
                  className="w-full h-full relative flex items-center justify-center"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-contain"
                    animate={!isCompleted ? {
                      filter: [
                        'drop-shadow(0 0 2px rgba(255,255,255,0.2))',
                        'drop-shadow(0 0 10px rgba(255,255,255,0.85)) drop-shadow(0 0 22px rgba(255,255,255,0.4))',
                        'drop-shadow(0 0 2px rgba(255,255,255,0.2))',
                      ],
                    } : { filter: 'none' }}
                    transition={!isCompleted ? {
                      duration: 2.4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    } : { duration: 0.3 }}
                    whileHover={{
                      filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.95)) drop-shadow(0 0 28px rgba(255,255,255,0.55)) brightness(1.15)',
                      transition: { duration: 0.15 },
                    }}
                  />
                </motion.div>
              );
            })()}

            {/* 開發模式文字 */}
            {DEV_MODE && <span className="absolute bg-black/70 text-white px-1 rounded text-[10px]">{spot.id}</span>}
          </Link>
        ))}

        {/* ==================== 圖片內建背包的透明熱區 ==================== */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            playClickSound();
            setIsBackpackOpen(true);
            if (showBackpackHint) {
              setShowBackpackHint(false);
              localStorage.setItem('hasSeenBackpackHint', 'true');
              if (!localStorage.getItem('hasSeenNoteHint')) {
                setShowNoteHint(true);
              }
            }
          }}
          className={`absolute cursor-pointer rounded-full z-20 flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-200
            ${DEV_MODE
              ? 'border-2 border-blue-500 bg-blue-500/30 text-blue-200'
              : 'hover:bg-white/10 active:scale-90 hover:[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.85))_drop-shadow(0_0_18px_rgba(255,255,255,0.4))]'
            }
          `}
          style={{ top: '80.5%', left: '91.7%', width: '8.7%', height: '15%' }}
          title="打開背包"
        >
          {DEV_MODE && <span className="bg-black/70 px-1 rounded">背包</span>}
        </button>

        {/* 👆 背包引導手指 — 直接覆蓋在背包熱區上 */}
        {showBackpackHint && (
          <div
            className="absolute pointer-events-none z-30 animate-bounce flex flex-col items-center justify-center gap-0.5"
            style={{ top: 'calc(80.5% + 36px)', left: '91.7%', width: '8.7%', height: '15%' }}
          >
            <span className="text-[50px] leading-none drop-shadow-lg">👆</span>
            <span className="text-[8px] font-bold text-white bg-black/65 px-1.5 py-0.5 rounded-full whitespace-nowrap backdrop-blur-sm leading-tight">
              點開背包
            </span>
          </div>
        )}


        {/* ==================== 🚨 自訂重複遊玩提示框 (UI Modal) ==================== */}
        {showReplayAlert && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#eedcb3] p-6 sm:p-8 rounded-2xl border-4 border-amber-900/40 shadow-2xl flex flex-col items-center max-w-[80%] sm:max-w-sm text-center transform transition-transform scale-100">
              <h3 className="text-amber-900 font-bold text-lg sm:text-xl mb-6">
                你已經破關嘍！還要再玩一次嗎？
              </h3>
              <div className="flex gap-4 w-full justify-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    setShowReplayAlert(false);
                  }}
                  className="px-5 py-2 bg-amber-900/10 text-amber-900 border border-amber-900/30 rounded-xl hover:bg-amber-900/20 active:scale-95 font-bold transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    setShowReplayAlert(false);
                    router.push(pendingHref); 
                  }}
                  className="px-5 py-2 bg-amber-900 text-[#fffdf0] rounded-xl hover:bg-amber-800 active:scale-95 font-bold transition-all shadow-md"
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        )}


        {/* ==================== 背包彈出視窗 (Modal) ==================== */}
        {isBackpackOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                playClickSound();
                setIsBackpackOpen(false);
              }}
            ></div>
            
            {/* 背包主體 (改為垂直排列並置中道具欄) */}
            <div className="relative flex flex-col items-center w-[85%] h-[75%] max-w-3xl max-h-[500px] rounded-2xl bg-[#eedcb3] p-6 sm:p-8 shadow-2xl border-4 border-amber-900/40 select-none">
              
              <h2 className="text-xl sm:text-2xl font-bold text-amber-900 mb-4 tracking-wider">🎒 我的背包</h2>

              {/* 關閉按鈕 */}
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

              {/* 重置背包按鈕 */}
              <button
                onClick={handleResetBackpack}
                className="absolute bottom-4 right-4 text-xs font-bold bg-amber-900/10 text-amber-900 border border-amber-900/30 px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 transition-all z-10 shadow-sm"
              >
                🗑️ 重置
              </button>

              {/* 🎒 道具欄位 (置中放大版) */}
              <div className="w-full max-w-xl flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 bg-amber-950/10 p-4 sm:p-5 rounded-xl border border-amber-900/10 content-start overflow-y-auto">
                
                {/* 第 1 格：便條紙 (預設道具，可點擊查看提示) */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound();
                    setShowNoteModal(true);
                    if (showNoteHint) {
                      setShowNoteHint(false);
                      localStorage.setItem('hasSeenNoteHint', 'true');
                    }
                  }}
                  className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner relative group cursor-pointer hover:bg-white/60 transition-colors"
                >
                  <span className="text-3xl sm:text-4xl transition-transform group-hover:scale-110 group-active:scale-95" title="阿嬤的便條紙 (點擊查看)">📝</span>
                  {showNoteHint && (
                    <div className="absolute inset-0 flex items-center justify-center translate-y-9 pointer-events-none select-none animate-bounce z-10">
                      <span className="text-[60px] leading-none drop-shadow-lg">👆</span>
                    </div>
                  )}
                </div>

                {/* 第 2 格：錄音帶 (點擊播放音效) */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasTape) {
                      playClickSound();
                      playGrandVoice();
                    }
                  }}
                  className={`aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner relative group ${hasTape ? 'cursor-pointer hover:bg-white/60 transition-colors' : 'cursor-help'}`}
                >
                  {hasTape ? (
                    <span className="text-3xl sm:text-4xl transition-transform group-hover:scale-110 group-active:scale-95" title="阿嬤的錄音帶 (點擊播放)">📼</span>
                  ) : (
                    <span className="text-black/10 text-2xl font-bold">?</span>
                  )}
                </div>
                
                {/* 第 3 格：秘方 (點擊放大) */}
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasRecipe) {
                      playClickSound();
                      setShowRecipeModal(true);
                    }
                  }}
                  className={`aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner relative group ${hasRecipe ? 'cursor-pointer hover:bg-white/60 transition-colors' : 'cursor-help'}`}
                >
                  {hasRecipe ? (
                    <img
                      src="/images/scale_menu.png"
                      alt="紅豆湯秘方"
                      title="紅豆湯秘方 (點擊放大)"
                      className="w-[70%] h-[70%] object-contain transition-transform group-hover:scale-110 group-active:scale-95"
                    />
                  ) : (
                    <span className="text-black/10 text-2xl font-bold">?</span>
                  )}
                </div>

                {/* 第 4 格：時光膠卷 */}
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner relative group cursor-help">
                  {hasFilm ? (
                    <span 
                      className="text-3xl sm:text-4xl transition-transform group-hover:scale-110" 
                      title="時光膠卷"
                    >
                        🎞️
                    </span>
                  ) : (
                    <span className="text-black/10 text-2xl font-bold">?</span>
                  )}
                </div>

                {/* 第 5 格：紅豆 */}
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner relative group cursor-help">
                  {hasBeans ? (
                    <img
                      src="/images/beans_big.webp"
                      alt="紅豆"
                      title="紅豆"
                      className="w-[75%] h-[75%] object-contain transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-black/10 text-2xl font-bold">?</span>
                  )}
                </div>

                {/* 其餘預留的空欄位 (補滿10格讓畫面好看) */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 shadow-inner"></div>
                ))}

              </div>
            </div>
          </div>
        )}

        {/* ==================== 📝 便條紙提示獨立彈出視窗 ==================== */}
        {showNoteModal && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowNoteModal(false)}>
            <div 
              className="bg-[#fffdf0] p-6 rounded-lg shadow-xl border border-amber-200 transform -rotate-2 max-w-[80%] sm:max-w-sm w-full"
              onClick={(e) => e.stopPropagation()} 
            >
              <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-3 border-b border-amber-900/20 pb-2">
                阿嬤的便條紙
              </h2>
              <div className="text-amber-800 space-y-2 font-serif text-sm sm:text-base leading-relaxed pl-2">
                <p>1. 看看牆上的抽抽樂</p>
                <p>2. 撥打轉盤電話找線索</p>
                <p>3. 垃圾桶裡的日曆碎紙</p>
                <p>4. 照著秘方秤點紅豆</p>
                <p>5. 把紅豆丟進電鍋煮湯</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setShowNoteModal(false);
                }} 
                className="mt-6 w-full bg-amber-900/10 text-amber-900 py-2 rounded-lg hover:bg-amber-900 hover:text-white transition-colors font-bold"
              >
                收起便條
              </button>
            </div>
          </div>
        )}

        {/* ==================== 📜 秘方放大圖片彈出視窗 ==================== */}
        {showRecipeModal && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowRecipeModal(false)}>
            <div 
              className="relative max-w-[90%] max-h-[85%] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()} 
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  playClickSound();
                  setShowRecipeModal(false);
                }}
                className="absolute -top-10 sm:-top-12 right-0 text-white text-3xl sm:text-4xl hover:text-red-500 transition-colors font-bold z-10"
              >
                ✕
              </button>
              <img 
                src="/images/scale_menu.png" 
                alt="紅豆湯秘方放大圖" 
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white/10"
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}