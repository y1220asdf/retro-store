"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type GameStage = 'prep' | 'confirm' | 'cooking' | 'result';
type ResultType = 'perfect' | 'overcooked' | 'undercooked';

// ─── Image paths ──────────────────────────────────────────
const IMG = {
  bg:                    '/images/cooker_bg.png',
  // Cooker open states (bowl is part of each image)
  cookerBody:            '/images/cooker_body.png',           // 無蓋、空碗
  cookerBodyBeans:       '/images/cooker_body_beans.png',     // 無蓋、碗有紅豆
  cookerBodySugar:       '/images/cooker_body_sugar.png',     // 無蓋、碗有紅豆+糖
  cookerBodySoup:        '/images/cooker_body_soup.png',      // 無蓋、碗有紅豆+糖+水
  cookerBodyWater:       '/images/cooker_body_water.png',     // 無蓋、內鍋加水+碗有紅豆+糖+水
  // Cooker lid states
  cookerLidOn:           '/images/cooker_lid_on.png',
  cookerLidOnCooking:    '/images/cooker_lid_on_cooking.png',
  // Lid on table
  lid:                   '/images/cooker_lid.png',
  // Water objects
  bottle:                '/images/cooker_bottle.png',
  cupEmpty:              '/images/cooker_cup.png',          // 空水杯
  cupFull:               '/images/cooker_cup_full.png',
  // Sugar
  sugar:                 '/images/cooker_sugar.png',
  // Beans (shared asset)
  beans:                 '/images/beans_big.webp',
  // Result bowls
  resultPerfect:         '/images/cooker_result_perfect.png',
  resultOvercooked:      '/images/cooker_result_overcooked.png',
  resultUndercooked:     '/images/cooker_result_undercooked.png',
} as const;

// ─── Cooker image (state-driven, bowl included) ───────────
function CookerImg({ lidOn, beansInBowl, sugarInBowl, waterInBowl, waterInCooker, cooking, clickable, onDrop, onClick }: {
  lidOn: boolean; beansInBowl: boolean; sugarInBowl: boolean; waterInBowl: boolean; waterInCooker: boolean;
  cooking: boolean; clickable: boolean;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
}) {
  const src = lidOn
    ? (cooking ? IMG.cookerLidOnCooking : IMG.cookerLidOn)
    : waterInCooker ? IMG.cookerBodyWater
    : waterInBowl   ? IMG.cookerBodySoup
    : sugarInBowl   ? IMG.cookerBodySugar
    : beansInBowl   ? IMG.cookerBodyBeans
    : IMG.cookerBody;

  return (
    <div
      className={`relative ${clickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <img
        src={src}
        alt="電鍋"
        className="w-[330px] h-auto object-contain drop-shadow-2xl select-none"
        draggable={false}
      />
      {clickable && (
        <div className="absolute inset-0 rounded-2xl bg-amber-300/5 pointer-events-none animate-pulse" />
      )}
    </div>
  );
}

// ─── Water Bottle ─────────────────────────────────────────
function BottleImg({ selected, onClick }: { selected: boolean; onClick?: () => void }) {
  return (
    <div
      className={`relative ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      style={selected ? { filter: 'drop-shadow(0 0 10px rgba(100,200,255,0.85))' } : {}}
      onClick={onClick}
    >
      <img
        src={IMG.bottle}
        alt="水瓶"
        className="w-[204px] h-auto object-contain select-none"
        draggable={false}
      />
      {selected && (
        <div className="absolute inset-0 rounded-xl border-2 border-sky-400 pointer-events-none animate-pulse" />
      )}
    </div>
  );
}

// ─── Water Cup ────────────────────────────────────────────
function CupImg({ filled, onClick, isDraggable, onDragStart }: {
  filled: boolean; onClick?: () => void;
  isDraggable?: boolean; onDragStart?: (e: React.DragEvent) => void;
}) {
  return (
    <div
      className={[
        'relative flex flex-col items-center transition-all duration-150',
        onClick ? 'cursor-pointer hover:scale-110' : '',
        isDraggable ? 'cursor-grab active:cursor-grabbing' : '',
      ].join(' ')}
      style={onClick ? { filter: 'drop-shadow(0 0 6px rgba(100,200,255,0.6))' } : {}}
      onClick={onClick}
      draggable={isDraggable}
      onDragStart={onDragStart}
    >
      <img
        src={filled ? IMG.cupFull : IMG.cupEmpty}
        alt={filled ? '裝滿水的水杯' : '空水杯'}
        className="w-[117px] h-auto object-contain select-none"
        draggable={false}
      />
    </div>
  );
}

// ─── Sugar Jar (static display, spoon is the interactive element) ────────────
function SugarImg() {
  return (
    <img
      src={IMG.sugar}
      alt="砂糖"
      className="w-[168px] h-auto object-contain select-none"
      draggable={false}
    />
  );
}

// ─── Lid on table ─────────────────────────────────────────
function LidImg({ onDragStart }: { onDragStart?: (e: React.DragEvent) => void }) {
  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      className={`flex flex-col items-center select-none ${onDragStart ? 'cursor-grab active:cursor-grabbing hover:scale-105 transition-transform' : ''}`}
    >
      <img
        src={IMG.lid}
        alt="電鍋蓋"
        className="w-[225px] h-auto object-contain drop-shadow-xl"
        draggable={false}
      />
    </div>
  );
}

// ─── Result Bowl ──────────────────────────────────────────
function ResultBowlImg({ type }: { type: ResultType }) {
  const src = type === 'perfect' ? IMG.resultPerfect
    : type === 'overcooked' ? IMG.resultOvercooked
    : IMG.resultUndercooked;

  return (
    <img
      src={src}
      alt="紅豆湯"
      className="w-[240px] h-auto object-contain drop-shadow-xl"
      draggable={false}
    />
  );
}

// ─── Digital Timer ────────────────────────────────────────
function DigitalTimer({ seconds, visible }: { seconds: number; visible: boolean }) {
  const display = seconds.toFixed(1);
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.8)] border-4 border-amber-900/60"
        style={{ background: 'linear-gradient(135deg, #2a1a06, #1a0e04)' }}
      >
        <div className="m-6 rounded-2xl overflow-hidden border-2 border-black/60 relative"
          style={{ background: '#0a0a04', boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.8)' }}
        >
          <div className="px-12 py-6 flex flex-col items-center" style={{ width: '360px' }}>
            <p className="text-xl tracking-[0.3em] mb-2" style={{ color: '#5a7040' }}>秒數</p>
            <div className="w-full flex justify-center">
              <p className="font-mono font-black leading-none text-center"
                style={{
                  fontSize: '6rem',
                  color: '#c8f040', textShadow: '0 0 24px #a0d020, 0 0 48px #80b010',
                  letterSpacing: '0.05em', width: '5ch',
                }}
              >
                {display}
              </p>
            </div>
            <p className="text-lg tracking-[0.25em] mt-2" style={{ color: '#3a5020' }}>SEC</p>
          </div>
          {/* Cover slides in after 5s — covers the entire dark screen */}
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-700"
            style={{
              background: '#0a0a04',
              opacity: visible ? 0 : 1,
              transform: visible ? 'scaleY(0)' : 'scaleY(1)',
              transformOrigin: 'top',
            }}
          >
            <p className="text-xl tracking-[0.2em]" style={{ color: '#3a5020' }}>-- --</p>
          </div>
        </div>
        <p className="text-center text-base tracking-[0.4em] pb-3" style={{ color: '#5a3a10' }}>TIMER</p>
      </div>
      <p className={`mt-3 text-2xl font-bold tracking-wider text-center ${visible ? 'text-amber-400/70' : 'text-amber-600/60 animate-pulse'}`}>
        {visible ? '記住這個感覺！' : '默數到 20 秒…'}
      </p>
    </div>
  );
}

// ─── Steam Particles ──────────────────────────────────────
const STEAM_POS = [
  { x: 43, size: 14, dur: 1.8, delay: 0.0 }, { x: 47, size: 18, dur: 2.2, delay: 0.5 },
  { x: 51, size: 12, dur: 1.5, delay: 1.0 }, { x: 55, size: 20, dur: 2.5, delay: 0.3 },
  { x: 49, size: 16, dur: 1.9, delay: 0.8 }, { x: 45, size: 22, dur: 2.0, delay: 1.3 },
  { x: 53, size: 15, dur: 2.3, delay: 0.6 }, { x: 57, size: 18, dur: 1.7, delay: 1.1 },
];
const FULLSCREEN_STEAM = [
  { x: 10, y: 20, s: 60,  dur: 2.6, delay: 0.0 }, { x: 30, y: 50, s: 80,  dur: 3.2, delay: 0.2 },
  { x: 55, y: 10, s: 100, dur: 3.6, delay: 0.5 }, { x: 75, y: 60, s: 70,  dur: 2.8, delay: 0.1 },
  { x: 20, y: 70, s: 90,  dur: 3.4, delay: 0.4 }, { x: 85, y: 30, s: 65,  dur: 2.7, delay: 0.7 },
  { x: 42, y: 40, s: 85,  dur: 3.8, delay: 0.3 }, { x: 65, y: 80, s: 75,  dur: 3.0, delay: 0.6 },
  { x: 5,  y: 45, s: 55,  dur: 4.0, delay: 0.9 }, { x: 90, y: 55, s: 95,  dur: 2.5, delay: 0.2 },
  { x: 35, y: 25, s: 110, dur: 3.3, delay: 0.8 }, { x: 60, y: 15, s: 78,  dur: 3.7, delay: 1.0 },
  { x: 15, y: 35, s: 72,  dur: 3.1, delay: 1.2 }, { x: 50, y: 65, s: 92,  dur: 2.9, delay: 0.3 },
  { x: 70, y: 20, s: 68,  dur: 4.2, delay: 0.6 }, { x: 25, y: 85, s: 105, dur: 3.5, delay: 1.4 },
];

function SteamParticles({ active, fullScreen }: { active: boolean; fullScreen: boolean }) {
  if (!active && !fullScreen) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
      <style>{`
        @keyframes steamRiseUp {
          0%   { transform: translateY(0) scaleX(1.0); opacity: 0; }
          15%  { opacity: 0.65; }
          60%  { transform: translateY(-80px) scaleX(1.4); opacity: 0.35; }
          100% { transform: translateY(-160px) scaleX(0.4); opacity: 0; }
        }
        @keyframes steamBig {
          0%   { transform: scale(0.3); opacity: 0; }
          15%  { opacity: 0.75; }
          70%  { transform: scale(2.0); opacity: 0.5; }
          100% { transform: scale(3.0); opacity: 0; }
        }
        @keyframes whiteFlashIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
      {active && !fullScreen && STEAM_POS.map((p, i) => (
        <div key={i} className="absolute rounded-full bg-white/50"
          style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.x}%`, bottom: '57%',
            animation: `steamRiseUp ${p.dur}s ease-out ${p.delay}s infinite` }} />
      ))}
      {fullScreen && FULLSCREEN_STEAM.map((p, i) => (
        <div key={i} className="absolute rounded-full bg-white/70"
          style={{ width: `${p.s}px`, height: `${p.s}px`, left: `${p.x}%`, top: `${p.y}%`,
            animation: `steamBig ${p.dur}s ease-out ${p.delay}s forwards` }} />
      ))}
    </div>
  );
}

// ─── Result Modal ─────────────────────────────────────────
function ResultModal({ result, elapsedSec, router, onReset }: {
  result: ResultType; elapsedSec: number; router: ReturnType<typeof useRouter>; onReset: () => void;
}) {
  const info = {
    perfect: {
      emoji: '🎉', title: '好吃紅豆湯！',
      desc: '火候剛剛好，粒粒分明、軟糯香甜。\n阿公看到一定會很開心！',
      btnLabel: '進入結局',
      action: () => { localStorage.setItem('hasSoup', 'true'); router.push('/ending'); },
    },
    overcooked: {
      emoji: '😓', title: '煮過頭了...',
      desc: `煮了 ${elapsedSec.toFixed(1)} 秒，紅豆都爛掉變黑了。\n請重新收集材料再試試吧！`,
      btnLabel: '回去準備材料',
      action: () => { localStorage.removeItem('hasBeans'); router.push('/main'); },
    },
    undercooked: {
      emoji: '😐', title: '普通的紅豆水...',
      desc: `只煮了 ${elapsedSec.toFixed(1)} 秒，紅豆還沒熟，全沉在碗底。\n再試一次！`,
      btnLabel: '重新開始',
      action: onReset,
    },
  }[result];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#fdfaf2] border border-amber-900/10 p-10 rounded-[32px] max-w-sm w-full text-center flex flex-col items-center shadow-[0_0_60px_rgba(0,0,0,0.55),0_15px_30px_rgba(0,0,0,0.3)]">
        <ResultBowlImg type={result} />
        <p className="text-4xl mt-2 mb-1">{info.emoji}</p>
        <h2 className="text-xl font-black text-amber-950 mb-3 tracking-wider">{info.title}</h2>
        <p className="text-sm text-amber-800 mb-2 leading-relaxed whitespace-pre-line">{info.desc}</p>
        <p className="text-xs font-mono text-amber-500 mb-6">計時：{elapsedSec.toFixed(2)} 秒</p>
        <button onClick={info.action}
          className="w-full bg-stone-900/10 border-2 border-amber-900/30 hover:bg-amber-900 hover:text-amber-50 text-stone-900 font-black py-3 px-6 rounded-2xl shadow-md transition-all tracking-widest text-sm cursor-pointer"
        >
          {info.btnLabel}
        </button>
        {result !== 'perfect' && (
          <button onClick={() => router.push('/main')}
            className="mt-3 w-full text-amber-700/60 text-xs hover:text-amber-700 transition-colors py-1"
          >
            先回到柑仔店逛逛
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function CookerGame() {
  const router = useRouter();

  const [locked, setLocked]               = useState(false);
  const [missingItems, setMissingItems]   = useState<string[]>([]);
  const [stage, setStage]                 = useState<GameStage>('prep');

  // ── 背包 ──
  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [bpTape,    setBpTape]    = useState(false);
  const [bpFilm,    setBpFilm]    = useState(false);
  const [bpRecipe,  setBpRecipe]  = useState(false);
  const [bpBeans,   setBpBeans]   = useState(false);

  useEffect(() => {
    if (!isBackpackOpen) return;
    setBpTape  (localStorage.getItem('hasTape')   === 'true');
    setBpFilm  (localStorage.getItem('hasFilm')   === 'true');
    setBpRecipe(localStorage.getItem('hasRecipe') === 'true');
    setBpBeans (localStorage.getItem('hasBeans')  === 'true');
  }, [isBackpackOpen]);

  const [beansInBowl, setBeansInBowl]     = useState(false);
  const [waterSelected, setWaterSelected] = useState(false);
  const [cupFilled, setCupFilled]         = useState(false);
  const [waterInBowl, setWaterInBowl]     = useState(false);
  const [sugarInBowl, setSugarInBowl]     = useState(false);
  const [waterInCooker, setWaterInCooker] = useState(false);
  const [lidOn, setLidOn]                 = useState(false);

  // ── 砂糖勺子 ──
  const [spoonHasSugar, setSpoonHasSugar]   = useState(false);
  const [showMissingPopup, setShowMissingPopup]           = useState(false);
  const [showIngredientsDonePopup, setShowIngredientsDonePopup] = useState(false);
  const [showAllReadyPopup, setShowAllReadyPopup]         = useState(false);

  const [elapsedMs, setElapsedMs]         = useState(0);
  const [showTimer, setShowTimer]         = useState(true);
  const startTimeRef = useRef<number>(0);
  const rafRef       = useRef<number>(0);

  const [steamFull, setSteamFull]         = useState(false);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [result, setResult]               = useState<ResultType | null>(null);

  // ── Lock check ──
  useEffect(() => {
    const hasBeans  = localStorage.getItem('hasBeans')  === 'true';
    const hasRecipe = localStorage.getItem('hasRecipe') === 'true';
    const missing: string[] = [];
    if (!hasBeans)  missing.push('紅豆（請先完成關卡四）');
    if (!hasRecipe) missing.push('秘方（請先完成關卡三）');
    if (missing.length > 0) { setMissingItems(missing); setLocked(true); }
  }, []);

  // ── Cooking timer ──
  useEffect(() => {
    if (stage !== 'cooking') return;
    startTimeRef.current = performance.now();
    setElapsedMs(0);
    setShowTimer(true);
    const hide = setTimeout(() => setShowTimer(false), 5000);
    const tick = (now: number) => {
      setElapsedMs(now - startTimeRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { clearTimeout(hide); cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const handleReset = () => {
    setStage('prep');
    setBeansInBowl(false);
    setWaterSelected(false);
    setCupFilled(false);
    setWaterInBowl(false);
    setSugarInBowl(false);
    setWaterInCooker(false);
    setLidOn(false);
    setSpoonHasSugar(false);
    setElapsedMs(0);
    setShowTimer(true);
    setSteamFull(false);
    setShowWhiteFlash(false);
    setResult(null);
  };

  const handleCookerClick = () => {
    if (stage !== 'cooking') return;
    cancelAnimationFrame(rafRef.current);
    const finalMs = performance.now() - startTimeRef.current;
    setElapsedMs(finalMs);
    setSteamFull(true);
    // 2.5s 後：全白畫面淡入
    setTimeout(() => setShowWhiteFlash(true), 2500);
    // 3.5s 後：顯示結果，白幕開始淡出
    setTimeout(() => {
      const sec = finalMs / 1000;
      setResult(sec >= 18 && sec <= 22 ? 'perfect' : sec > 22 ? 'overcooked' : 'undercooked');
      setSteamFull(false);
      setStage('result');
      setTimeout(() => setShowWhiteFlash(false), 200);
    }, 3500);
  };

  const elapsedSec    = elapsedMs / 1000;
  const allPrepDone   = beansInBowl && waterInBowl && sugarInBowl && waterInCooker;

  const stepHint = (() => {
    if (!beansInBowl)   return '將「紅豆」拖曳放入電鍋的瓷碗';
    if (!sugarInBowl)   return spoonHasSugar ? '將裝有砂糖的勺子拖曳放入電鍋' : '將勺子拖曳到砂糖罐舀起砂糖';
    if (!waterInBowl)   return !cupFilled ? '點擊水瓶→水杯，再將水杯拖入電鍋的碗' : '將水杯拖入電鍋的碗';
    if (!waterInCooker) return !cupFilled ? '再次點擊水瓶→水杯，將水杯拖入電鍋內鍋' : '將水杯拖入電鍋內鍋';
    return '將鍋蓋拖曳至電鍋上';
  })();

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ backgroundImage: `url('${IMG.bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Back button */}
      <button onClick={() => router.push('/main')}
        className="fixed top-4 left-[104px] z-[9998] flex items-center justify-center rounded-full border border-amber-900/40 bg-[#fffdf0]/90 px-4 py-2 text-sm font-bold text-amber-900 backdrop-blur-sm shadow-[4px_4px_0px_rgba(120,60,0,0.2)] transition-all hover:bg-white active:scale-95"
      >⬅ 返回柑仔店</button>

      {/* Step hint */}
      {stage === 'prep' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-50/90 border-2 border-amber-200 px-6 py-2 rounded-3xl shadow-md">
          <p className="text-sm font-bold text-amber-900 whitespace-nowrap">👉 {stepHint}</p>
        </div>
      )}
      {stage === 'cooking' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-900/85 border-2 border-amber-500 px-6 py-2 rounded-3xl shadow-md">
          <p className="text-sm font-bold text-amber-50">🍲 蒸煮中... 默數到 20 秒後點擊電鍋！</p>
        </div>
      )}

      <SteamParticles active={stage === 'cooking'} fullScreen={steamFull} />

      {/* ── 全白過場 ── */}
      <div
        className="fixed inset-0 z-[55] pointer-events-none bg-white transition-opacity duration-500"
        style={{ opacity: showWhiteFlash ? 1 : 0 }}
      />

      {/* ── Digital timer（UI overlay，不在桌面） ── */}
      {stage === 'cooking' && (
        <div className="absolute top-16 right-4 z-40">
          <DigitalTimer seconds={elapsedSec} visible={showTimer} />
        </div>
      )}

      {/*
        ══════════════════════════════════════════════════════
        可互動物件 — 桌面容器上方（食材區）
        調整 bottom 值讓物件對齊背景圖中桌子以上的區域。
        ══════════════════════════════════════════════════════
      */}

      {/* ── 左側：紅豆（拖曳至電鍋） ── */}
      {!beansInBowl && (
        <div
          draggable
          onDragStart={(e) => e.dataTransfer.setData('text', 'beans')}
          title="將紅豆拖曳放入電鍋"
          className="absolute z-20 flex flex-col items-center select-none cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
          style={{ bottom: 'calc(42% - 100px)', left: '24%' }}
        >
          <img src={IMG.beans} alt="紅豆" className="w-[168px] h-[168px] object-contain drop-shadow-lg" draggable={false} />
        </div>
      )}

      {/* ── 左側：砂糖罐（sugarInBowl 後靜態顯示） ── */}
      <div
        title={!sugarInBowl ? '將勺子拖曳到砂糖罐舀起砂糖' : undefined}
        className="absolute z-20 p-8"
        style={{ bottom: 'calc(24% - 36px)', left: 'calc(3% + 4px)' }}
        onDragOver={!sugarInBowl ? (e) => e.preventDefault() : undefined}
        onDrop={!sugarInBowl ? (e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('text');
          if (id === 'spoon' && !spoonHasSugar) {
            setSpoonHasSugar(true);
          }
        } : undefined}
      >
        <SugarImg />
      </div>

      {/* ── 左側：勺子（sugarInBowl 後回到原位靜態顯示空勺） ── */}
      <div
        draggable={!sugarInBowl}
        onDragStart={!sugarInBowl ? (e) => e.dataTransfer.setData('text', 'spoon') : undefined}
        title={!sugarInBowl ? (spoonHasSugar ? '將裝有砂糖的勺子拖曳放入電鍋' : '將勺子拖到砂糖罐舀糖') : undefined}
        className={`absolute z-21 select-none ${!sugarInBowl ? 'cursor-grab active:cursor-grabbing hover:scale-110 transition-transform' : ''}`}
        style={{ bottom: 'calc(24% + 20px)', left: 'calc(3% + 184px)' }}
      >
        <img
          src={spoonHasSugar ? '/images/cooker_spoon.png' : '/images/scale_spoon.webp'}
          alt="木勺"
          className={`w-20 h-20 object-contain drop-shadow-md ${spoonHasSugar ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]' : ''}`}
          draggable={false}
        />
        {spoonHasSugar && (
          <span className="block text-center text-[10px] text-amber-300 font-bold mt-0.5">已裝糖</span>
        )}
      </div>

      {/* ── 左側：鍋蓋（一開始就出現，位於紅豆上方，拖曳至電鍋） ── */}
      {!lidOn && (
        <div title="將鍋蓋拖曳蓋上電鍋" className="absolute z-20" style={{ bottom: 'calc(60% - 196px)', left: 'calc(3% + 84px)' }}>
          <LidImg onDragStart={(e) => e.dataTransfer.setData('text', 'lid')} />
        </div>
      )}

      {/* ── 右側：水瓶 ── */}
      <div title={waterInBowl && waterInCooker ? '材料都備齊了！' : '點擊水瓶取水'} className="absolute z-20" style={{ bottom: 'calc(48% - 60px)', right: '21%' }}>
        <BottleImg
          selected={waterSelected}
          onClick={
            waterInBowl && waterInCooker
              ? () => setShowAllReadyPopup(true)
              : (!waterSelected && !cupFilled ? () => setWaterSelected(true) : undefined)
          }
        />
      </div>

      {/* ── 右側：水杯（水瓶下方，靠攏電鍋） ── */}
      <div title={cupFilled ? '將水杯拖曳放入電鍋' : (waterSelected ? '點擊水杯裝水' : '先點選水瓶')} className="absolute z-20" style={{ bottom: 'calc(40% - 60px)', right: '17%' }}>
        <CupImg
          filled={cupFilled}
          onClick={waterSelected && !cupFilled ? () => { setCupFilled(true); setWaterSelected(false); } : undefined}
          isDraggable={cupFilled}
          onDragStart={cupFilled ? (e) => e.dataTransfer.setData('text', 'cup') : undefined}
        />
      </div>

      {/*
        ══════════════════════════════════════════
        桌面區域 — TABLE SURFACE ZONE
        調整 `top` 讓電鍋對齊 cooker_bg.png 裡的木桌：
          - top 越大 → 電鍋整體下移
          - top 越小 → 電鍋整體上移
        目前預設：top: calc(48% - 150px)
        ══════════════════════════════════════════
      */}
      <div className="absolute inset-x-0 z-20 pointer-events-none" style={{ top: 'calc(48% - 150px)', bottom: '4%' }}>

        {/* ── 中央：電鍋（碗已合併入圖） ── */}
        <div title={stage === 'cooking' ? '點擊電鍋停止計時！' : undefined} className="absolute pointer-events-auto" style={{ top: '4%', left: '50%', transform: 'translateX(-50%)' }}>
          <CookerImg
            lidOn={lidOn}
            beansInBowl={beansInBowl}
            sugarInBowl={sugarInBowl}
            waterInBowl={waterInBowl}
            waterInCooker={waterInCooker}
            cooking={stage === 'cooking'}
            clickable={stage === 'cooking'}
            onClick={handleCookerClick}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData('text');
              // Step 1: 紅豆拖入電鍋的碗
              if (id === 'beans' && !beansInBowl) {
                setBeansInBowl(true);
              }
              // Step 2: 裝糖勺子拖入碗（豆已入碗，勺子已裝糖，尚未加糖）
              if (id === 'spoon' && spoonHasSugar && beansInBowl && !sugarInBowl) {
                setSugarInBowl(true);
                setSpoonHasSugar(false);
              }
              // Step 3: 水杯拖入碗（糖已入碗，尚未加水）→ 觸發 popup
              if (id === 'cup' && cupFilled && sugarInBowl && !waterInBowl) {
                setWaterInBowl(true); setCupFilled(false);
                setShowIngredientsDonePopup(true);
              }
              // Step 5: 水杯拖入電鍋內鍋（碗材料已完成）
              if (id === 'cup' && cupFilled && waterInBowl && !waterInCooker) {
                setWaterInCooker(true); setCupFilled(false);
              }
              // 蓋上鍋蓋：拖曳鍋蓋至電鍋（材料需全部備齊）
              if (id === 'lid' && !lidOn) {
                if (allPrepDone) {
                  setLidOn(true); setStage('confirm');
                } else {
                  setShowMissingPopup(true);
                }
              }
            }}
          />
        </div>

      </div>{/* end TABLE SURFACE ZONE */}

      {/* ── 背包熱區（對齊 cooker_bg 右下角的背包圖示）
           位置參考 main/page.tsx 的背包熱區，如需微調請調整 top/left/width/height ── */}
      <button
        onClick={() => setIsBackpackOpen(true)}
        className="absolute z-30 cursor-pointer"
        style={{ top: '80.5%', left: '91.7%', width: '8.7%', height: '15%' }}
        title="打開背包"
      />

      {/* ── 背包 Modal ── */}
      {isBackpackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsBackpackOpen(false)} />
          <div className="relative flex flex-col items-center w-[85%] max-w-2xl max-h-[500px] rounded-2xl bg-[#eedcb3] p-6 shadow-2xl border-4 border-amber-900/40 select-none">
            <h2 className="text-xl font-bold text-amber-900 mb-4 tracking-wider">🎒 我的背包</h2>
            <button
              onClick={() => setIsBackpackOpen(false)}
              className="absolute top-3 right-4 text-2xl font-bold text-amber-900 hover:text-red-600 transition-colors"
            >✕</button>
            <div className="w-full grid grid-cols-5 gap-3 bg-amber-950/10 p-4 rounded-xl border border-amber-900/10">
              {/* 便條紙（預設道具） */}
              <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                <span className="text-3xl" title="阿嬤的便條紙">📝</span>
              </div>
              {/* 錄音帶 */}
              <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                {bpTape ? <span className="text-3xl" title="阿嬤的錄音帶">📼</span> : <span className="text-black/15 text-2xl font-bold">?</span>}
              </div>
              {/* 秘方 */}
              <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                {bpRecipe
                  ? <img src="/images/scale_menu.png" alt="紅豆湯秘方" className="w-[70%] h-[70%] object-contain" />
                  : <span className="text-black/15 text-2xl font-bold">?</span>}
              </div>
              {/* 膠卷 */}
              <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                {bpFilm ? <span className="text-3xl" title="時光膠卷">🎞️</span> : <span className="text-black/15 text-2xl font-bold">?</span>}
              </div>
              {/* 紅豆 */}
              <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                {bpBeans
                  ? <img src="/images/beans_big.webp" alt="紅豆" className="w-[75%] h-[75%] object-contain" />
                  : <span className="text-black/15 text-2xl font-bold">?</span>}
              </div>
              {/* 空格補滿 */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 shadow-inner" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════ POPUPS ════ */}

      {stage === 'confirm' && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-8 w-[340px] text-center shadow-2xl">
            <p className="text-4xl mb-3">🍲</p>
            <p className="text-xl font-black text-amber-900 mb-2">電鍋蓋好囉！</p>
            <p className="text-sm text-amber-800 mb-6 leading-relaxed">按下開關後即將開始蒸煮<br />請問準備好了嗎？</p>
            <div className="flex gap-3">
              <button onClick={() => { setLidOn(false); setStage('prep'); }}
                className="flex-1 bg-amber-100 text-amber-900 font-bold py-3 rounded-xl hover:bg-amber-200 active:scale-95 transition-all">再等等</button>
              <button onClick={() => setStage('cooking')}
                className="flex-1 bg-amber-900 text-amber-50 font-bold py-3 rounded-xl hover:bg-amber-950 active:scale-95 transition-all">切下開關！</button>
            </div>
          </div>
        </div>
      )}

      {showIngredientsDonePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-8 w-[340px] text-center shadow-2xl">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-xl font-black text-amber-900 mb-3">材料準備完成！</p>
            <p className="text-sm text-amber-800 mb-6 leading-relaxed">
              紅豆、水、砂糖都已放入瓷碗中了。<br />
              最後，再取一杯水加入<span className="font-black text-amber-950">電鍋內鍋</span>，<br />
              就可以開始烹煮囉！
            </p>
            <button
              onClick={() => setShowIngredientsDonePopup(false)}
              className="w-full bg-amber-900 text-amber-50 font-bold py-3 rounded-xl hover:bg-amber-950 active:scale-95 transition-all"
            >
              了解，去加水！
            </button>
          </div>
        </div>
      )}

      {showAllReadyPopup && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
          <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-8 w-[300px] text-center shadow-2xl">
            <p className="text-3xl mb-3">🍲</p>
            <p className="text-lg font-black text-amber-900 mb-4">材料都已加入</p>
            <p className="text-sm text-amber-800 mb-6">快把鍋蓋蓋上，開始煮紅豆湯！</p>
            <button
              onClick={() => setShowAllReadyPopup(false)}
              className="w-full bg-amber-900 text-amber-50 font-bold py-2 rounded-xl hover:bg-amber-950 transition-all"
            >好的！</button>
          </div>
        </div>
      )}

      {showMissingPopup && (
        <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
          <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-8 w-[300px] text-center shadow-2xl">
            <p className="text-3xl mb-3">🤔</p>
            <p className="text-lg font-black text-amber-900 mb-4">你好像少放了什麼喔？</p>
            <button onClick={() => setShowMissingPopup(false)}
              className="w-full bg-amber-900 text-amber-50 font-bold py-3 rounded-xl hover:bg-amber-950 active:scale-95 transition-all">了解！</button>
          </div>
        </div>
      )}

      {stage === 'result' && result && (
        <ResultModal result={result} elapsedSec={elapsedSec} router={router} onReset={handleReset} />
      )}

      {locked && (
        <div className="fixed inset-0 z-9999 bg-black/85 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#fffdf0] border-4 border-amber-900 rounded-2xl p-8 w-[360px] text-center shadow-2xl">
            <p className="text-3xl mb-3">🔒</p>
            <h2 className="text-xl font-black text-amber-950 mb-3">還缺少必要道具！</h2>
            <p className="text-sm text-amber-800 mb-2">你還沒拿到：</p>
            <ul className="mb-6 space-y-2">
              {missingItems.map((item) => (
                <li key={item} className="text-sm font-bold text-amber-900 bg-amber-100 py-2 rounded-xl">{item}</li>
              ))}
            </ul>
            <button onClick={() => router.push('/main')}
              className="w-full bg-amber-900 text-amber-50 font-bold py-3 rounded-xl hover:bg-amber-950 active:scale-95 transition-all">返回柑仔店</button>
          </div>
        </div>
      )}
    </div>
  );
}
