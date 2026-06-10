"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';

type GameStage = 'prep' | 'confirm' | 'cooking' | 'result';
type ResultType = 'perfect' | 'overcooked' | 'undercooked';

// ── responsive helpers (design reference: 1280 × 720) ─────────────────
// All original px values are converted to proportional vw/vh so that
// on any viewport width the layout scales exactly like the desktop version.
// On desktop (≥1280 px wide) min() resolves to the original px value → no change.
const DESIGN_W = 1280;
const DESIGN_H = 720;
const vw = (px: number) => `${(px / DESIGN_W * 100).toFixed(2)}vw`;
const vh = (px: number) => `${(px / DESIGN_H * 100).toFixed(2)}vh`;
// w(N) → "min(Npx, X.XXvw)" — never exceeds desktop size, shrinks proportionally
const w = (px: number) => `min(${px}px, ${(px / DESIGN_W * 100).toFixed(2)}vw)`;

const IMG = {
  bg:                 '/images/cooker_bg.png',
  cookerBody:         '/images/cooker_body.png',
  cookerBodyBeans:    '/images/cooker_body_beans.png',
  cookerBodySugar:    '/images/cooker_body_sugar.png',
  cookerBodySoup:     '/images/cooker_body_soup.png',
  cookerBodyWater:    '/images/cooker_body_water.png',
  cookerLidOn:        '/images/cooker_lid_on.png',
  cookerLidOnCooking: '/images/cooker_lid_on_cooking.png',
  lid:                '/images/cooker_lid.png',
  bottle:             '/images/cooker_bottle.png',
  cupEmpty:           '/images/cooker_cup.png',
  cupFull:            '/images/cooker_cup_full.png',
  sugar:              '/images/cooker_sugar.png',
  beans:              '/images/beans_big.webp',
  resultPerfect:      '/images/cooker_result_perfect.png',
  resultOvercooked:   '/images/cooker_result_overcooked.png',
  resultUndercooked:  '/images/cooker_result_undercooked.png',
} as const;

// ─────────────────────────── display components ───────────────────────

function CookerImg({ lidOn, beansInBowl, sugarInBowl, waterInBowl, waterInCooker, cooking, clickable, onClick }: {
  lidOn: boolean; beansInBowl: boolean; sugarInBowl: boolean; waterInBowl: boolean; waterInCooker: boolean;
  cooking: boolean; clickable: boolean; onClick: () => void;
}) {
  const src = lidOn
    ? (cooking ? IMG.cookerLidOnCooking : IMG.cookerLidOn)
    : waterInCooker ? IMG.cookerBodyWater
    : waterInBowl   ? IMG.cookerBodySoup
    : sugarInBowl   ? IMG.cookerBodySugar
    : beansInBowl   ? IMG.cookerBodyBeans
    : IMG.cookerBody;
  return (
    <div className={`relative ${clickable ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <img src={src} alt="電鍋" style={{ width: w(330) }} className="h-auto object-contain drop-shadow-2xl select-none" draggable={false} />
    </div>
  );
}

function BottleImg({ onClick }: { onClick?: () => void }) {
  return (
    <div className={`relative ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`} onClick={onClick}>
      <img src={IMG.bottle} alt="水瓶" style={{ width: w(204) }} className="h-auto object-contain select-none" draggable={false} />
    </div>
  );
}

function CupImg({ filled, onClick }: { filled: boolean; onClick?: () => void }) {
  return (
    <div className={`relative flex flex-col items-center transition-all duration-150 ${onClick ? 'cursor-pointer hover:scale-110' : ''}`} onClick={onClick}>
      <img
        src={filled ? IMG.cupFull : IMG.cupEmpty}
        alt={filled ? '裝滿水的水杯' : '空水杯'}
        style={{ width: w(117) }}
        className="h-auto object-contain select-none"
        draggable={false}
      />
    </div>
  );
}

function SugarImg() {
  return <img src={IMG.sugar} alt="砂糖" style={{ width: w(168) }} className="h-auto object-contain select-none" draggable={false} />;
}

function LidImg() {
  return (
    <div className="flex flex-col items-center select-none cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
      <img src={IMG.lid} alt="電鍋蓋" style={{ width: w(225) }} className="h-auto object-contain drop-shadow-xl" draggable={false} />
    </div>
  );
}

function ResultBowlImg({ type }: { type: ResultType }) {
  const src = type === 'perfect' ? IMG.resultPerfect : type === 'overcooked' ? IMG.resultOvercooked : IMG.resultUndercooked;
  return <img src={src} alt="紅豆湯" className="w-[min(240px,60vw)] max-h-[28vh] sm:max-h-none h-auto object-contain drop-shadow-xl" draggable={false} />;
}

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
                style={{ fontSize: '6rem', color: '#c8f040', textShadow: '0 0 24px #a0d020, 0 0 48px #80b010', letterSpacing: '0.05em', width: '5ch' }}
              >{display}</p>
            </div>
            <p className="text-lg tracking-[0.25em] mt-2" style={{ color: '#3a5020' }}>SEC</p>
          </div>
          <div
            className="absolute inset-0 rounded-2xl flex items-center justify-center transition-all duration-700"
            style={{ background: '#0a0a04', opacity: visible ? 0 : 1, transform: visible ? 'scaleY(0)' : 'scaleY(1)', transformOrigin: 'top' }}
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

function ResultModal({ result, elapsedSec, router, onReset }: {
  result: ResultType; elapsedSec: number; router: ReturnType<typeof useRouter>; onReset: () => void;
}) {
  const [showIncompletePopup, setShowIncompletePopup] = useState(false);

  const info = {
    perfect: {
      emoji: '🎉', title: '好吃紅豆湯！',
      desc: '火候剛剛好，粒粒分明、軟糯香甜。\n阿公看到一定會很開心！',
      btnLabel: '進入結局',
      action: () => {
        localStorage.setItem('hasSoup', 'true');
        const allCollected = ['hasTape', 'hasFilm', 'hasRecipe', 'hasBeans']
          .every(k => localStorage.getItem(k) === 'true');
        if (allCollected) { router.push('/ending'); } else { setShowIncompletePopup(true); }
      },
    },
    overcooked: {
      emoji: '😓', title: '煮過頭了...',
      desc: `煮了 ${elapsedSec.toFixed(1)} 秒，紅豆都裛掉變黑了。\n請重新收集材料再試試吧！`,
      btnLabel: '回去準備材料',
      action: () => { localStorage.removeItem('hasBeans'); router.push('/main'); },
    },
    undercooked: {
      emoji: '😐', title: '普通的紅豆水...',
      desc: `只煮了 ${elapsedSec.toFixed(1)} 秒，紅豆還沒熟，全沉在磗底。\n再試一次！`,
      btnLabel: '重新開始',
      action: onReset,
    },
  }[result];

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="relative bg-[#fdfaf2] border border-amber-900/10 p-4 sm:p-10 rounded-[24px] sm:rounded-[32px] w-[92vw] sm:w-full max-w-sm max-h-[92vh] overflow-y-auto overflow-x-hidden text-center flex flex-col items-center shadow-[0_0_60px_rgba(0,0,0,0.55),0_15px_30px_rgba(0,0,0,0.3)]">
        <ResultBowlImg type={result} />
        <p className="text-3xl sm:text-4xl mt-1 sm:mt-2 mb-1">{info.emoji}</p>
        <h2 className="text-lg sm:text-xl font-black text-amber-950 mb-2 sm:mb-3 tracking-wider">{info.title}</h2>
        <p className="text-xs sm:text-sm text-amber-800 mb-2 leading-relaxed whitespace-pre-line">{info.desc}</p>
        <p className="text-xs font-mono text-amber-500 mb-4 sm:mb-6">計時：{elapsedSec.toFixed(2)} 秒</p>
        <button onClick={info.action}
          className="w-full bg-stone-900/10 border-2 border-amber-900/30 hover:bg-amber-900 hover:text-amber-50 text-stone-900 font-black py-2.5 sm:py-3 px-4 sm:px-6 rounded-2xl shadow-md transition-all tracking-widest text-sm cursor-pointer"
        >{info.btnLabel}</button>
        {result !== 'perfect' && (
          <button onClick={() => router.push('/main')}
            className="mt-2 sm:mt-3 w-full text-amber-700/60 text-xs hover:text-amber-700 transition-colors py-1"
          >先回到柑仔店逗逗</button>
        )}
        {showIncompletePopup && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-[32px] z-10">
            <div className="bg-[#fdfaf2] p-6 rounded-2xl max-w-[260px] w-full text-center flex flex-col items-center shadow-xl border border-amber-900/20">
              <span className="text-3xl mb-2">🎒</span>
              <h3 className="text-base font-black text-amber-950 mb-2 tracking-wider">還沒收集完！</h3>
              <p className="text-sm text-amber-800 mb-4 leading-relaxed">尚有道具還沒搜集到<br />去其他關卡逗逗吧</p>
              <button onClick={() => router.push('/main')}
                className="w-full bg-amber-900 text-amber-50 font-bold py-2 px-4 rounded-xl text-sm tracking-widest hover:bg-amber-950 active:scale-95 transition-all cursor-pointer"
              >回到柑仔店</button>
              <button onClick={() => setShowIncompletePopup(false)}
                className="mt-2 text-xs text-amber-600/70 hover:text-amber-700 transition-colors py-1 cursor-pointer"
              >留在這裡</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────── @dnd-kit draggable / droppable wrappers ─────────────
// Positions are expressed in vw/vh (converted from the 1280×720 design).
// Images use w(N) = min(Npx, X.XXvw) so they scale on mobile but stay
// capped at their original size on desktop.

function DraggableBeans({ visible, active }: { visible: boolean; active: boolean }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'beans', disabled: !visible });
  if (!visible) return null;
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      title="將「紅豆」拖曳放入電鍋"
      className="absolute z-20 flex flex-col items-center select-none touch-none cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
      style={{ bottom: `calc(42% - ${vh(100)})`, left: '24%', opacity: active ? 0.3 : 1, touchAction: 'none' }}
    >
      <img src={IMG.beans} alt="紅豆"
        style={{ width: w(168), height: w(168) }}
        className="object-contain drop-shadow-lg" draggable={false} />
    </div>
  );
}

function DraggableSpoon({ spoonHasSugar, draggable, active }: {
  spoonHasSugar: boolean; draggable: boolean; active: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'spoon', disabled: !draggable });
  return (
    <div ref={setNodeRef} {...attributes} {...(draggable ? listeners : {})}
      title={draggable ? (spoonHasSugar ? '將裝有砂糖的劺子拖曳放入電鍋' : '將劺子拖到砂糖罐舤糖') : undefined}
      className={`absolute z-21 select-none touch-none ${draggable ? 'cursor-grab active:cursor-grabbing hover:scale-110 transition-transform' : ''}`}
      style={{ bottom: `calc(24% + ${vh(20)})`, left: `calc(3% + ${vw(184)})`, opacity: active ? 0.3 : 1, touchAction: 'none' }}
    >
      <img
        src={spoonHasSugar ? '/images/cooker_spoon.png' : '/images/scale_spoon.webp'}
        alt="木劺"
        style={{ width: w(80), height: w(80) }}
        className={`object-contain drop-shadow-md ${spoonHasSugar ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]' : ''}`}
        draggable={false}
      />
      {spoonHasSugar && <span className="block text-center text-[10px] text-amber-300 font-bold mt-0.5">已裝糖</span>}
    </div>
  );
}

function DraggableLid({ visible, active }: { visible: boolean; active: boolean }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'lid', disabled: !visible });
  if (!visible) return null;
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}
      title="將鍋蓋拖曳蓋上電鍋"
      className="absolute z-20 touch-none"
      style={{ bottom: `calc(60% - ${vh(196)})`, left: `calc(3% + ${vw(84)})`, opacity: active ? 0.3 : 1, touchAction: 'none' }}
    >
      <LidImg />
    </div>
  );
}

function DraggableCup({ filled, onFill, active, title }: {
  filled: boolean; onFill?: () => void; active: boolean; title: string;
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: 'cup', disabled: !filled });
  return (
    <div ref={setNodeRef} {...attributes} {...(filled ? listeners : {})}
      title={title}
      className={`absolute z-20 touch-none ${filled ? 'cursor-grab active:cursor-grabbing' : (onFill ? 'cursor-pointer hover:scale-110 transition-transform' : '')}`}
      style={{ bottom: `calc(40% - ${vh(60)})`, right: '17%', opacity: active ? 0.3 : 1, touchAction: 'none' }}
      onClick={!filled ? onFill : undefined}
    >
      <CupImg filled={filled} />
    </div>
  );
}

function DroppableSugar({ disabled }: { disabled: boolean }) {
  const { setNodeRef } = useDroppable({ id: 'sugar', disabled });
  // Extended detection zone: covers the sugar image with extra padding for easier targeting
  return (
    <div ref={setNodeRef}
      title={!disabled ? '將劺子拖曳到砂糖罐舤起砂糖' : undefined}
      className="absolute z-22"
      style={{
        bottom: `calc(24% - 4vh - min(48px, 3.75vw))`,
        left:   `calc(3% - min(48px, 3.75vw))`,
        width:  `calc(min(168px, 13.13vw) + 2 * min(48px, 3.75vw))`,
        height: `calc(min(168px, 13.13vw) + 2 * min(48px, 3.75vw))`,
      }}
    />
  );
}

function DroppableCooker({ children, title }: { children: React.ReactNode; title?: string }) {
  const { setNodeRef } = useDroppable({ id: 'cooker' });
  return (
    <div ref={setNodeRef} title={title}
      className="absolute pointer-events-auto"
      style={{ top: '4%', left: '50%', transform: 'translateX(-50%)' }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────── main component ──────────────────────────
export default function CookerGame() {
  const router = useRouter();

  // viewScale: the ratio of current viewport width to design width.
  // Used to size DragOverlay images so they match the visually-scaled draggable items.
  // isMobile: viewport narrower than design width → vw/vh units are actively shrinking items.
  const [viewScale, setViewScale] = useState(1);
  const isMobile = viewScale < 1;

  useEffect(() => {
    const compute = () => setViewScale(Math.min(1, window.innerWidth / DESIGN_W));
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const [locked, setLocked]             = useState(false);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [stage, setStage]               = useState<GameStage>('prep');

  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [bpTape,   setBpTape]   = useState(false);
  const [bpFilm,   setBpFilm]   = useState(false);
  const [bpRecipe, setBpRecipe] = useState(false);
  const [bpBeans,  setBpBeans]  = useState(false);
  const [bpSoup,   setBpSoup]   = useState(false);

  useEffect(() => {
    if (!isBackpackOpen) return;
    setBpTape  (localStorage.getItem('hasTape')   === 'true');
    setBpFilm  (localStorage.getItem('hasFilm')   === 'true');
    setBpRecipe(localStorage.getItem('hasRecipe') === 'true');
    setBpBeans (localStorage.getItem('hasBeans')  === 'true');
    setBpSoup  (localStorage.getItem('hasSoup')   === 'true');
  }, [isBackpackOpen]);

  const [beansInBowl,   setBeansInBowl]   = useState(false);
  const [waterSelected, setWaterSelected] = useState(false);
  const [cupFilled,     setCupFilled]     = useState(false);
  const [waterInBowl,   setWaterInBowl]   = useState(false);
  const [sugarInBowl,   setSugarInBowl]   = useState(false);
  const [waterInCooker, setWaterInCooker] = useState(false);
  const [lidOn,         setLidOn]         = useState(false);
  const [spoonHasSugar, setSpoonHasSugar] = useState(false);

  const [showMissingPopup,         setShowMissingPopup]         = useState(false);
  const [showIngredientsDonePopup, setShowIngredientsDonePopup] = useState(false);
  const [showAllReadyPopup,        setShowAllReadyPopup]        = useState(false);

  const [elapsedMs,  setElapsedMs]  = useState(0);
  const [showTimer,  setShowTimer]  = useState(true);
  const startTimeRef = useRef<number>(0);
  const rafRef       = useRef<number>(0);

  const [steamFull,      setSteamFull]      = useState(false);
  const [showWhiteFlash, setShowWhiteFlash] = useState(false);
  const [result,         setResult]         = useState<ResultType | null>(null);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } }),
  );

  useEffect(() => {
    const hasBeans  = localStorage.getItem('hasBeans')  === 'true';
    const hasRecipe = localStorage.getItem('hasRecipe') === 'true';
    const missing: string[] = [];
    if (!hasBeans)  missing.push('紅豆（請先完成關卡四）');
    if (!hasRecipe) missing.push('秘方（請先完成關卡三）');
    if (missing.length > 0) { setMissingItems(missing); setLocked(true); }
  }, []);

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
    setStage('prep'); setBeansInBowl(false); setWaterSelected(false);
    setCupFilled(false); setWaterInBowl(false); setSugarInBowl(false);
    setWaterInCooker(false); setLidOn(false); setSpoonHasSugar(false);
    setElapsedMs(0); setShowTimer(true); setSteamFull(false);
    setShowWhiteFlash(false); setResult(null);
  };

  const handleCookerClick = () => {
    if (stage !== 'cooking') return;
    cancelAnimationFrame(rafRef.current);
    const finalMs = performance.now() - startTimeRef.current;
    setElapsedMs(finalMs);
    setSteamFull(true);
    setTimeout(() => setShowWhiteFlash(true), 2500);
    setTimeout(() => {
      const sec = finalMs / 1000;
      setResult(sec >= 18 && sec <= 22 ? 'perfect' : sec > 22 ? 'overcooked' : 'undercooked');
      setSteamFull(false);
      setStage('result');
      setTimeout(() => setShowWhiteFlash(false), 200);
    }, 3500);
  };

  const allPrepDone = beansInBowl && waterInBowl && sugarInBowl && waterInCooker;

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragId(null);
    if (!over) return;
    const from = String(active.id);
    const to   = String(over.id);
    if (from === 'beans' && to === 'cooker' && !beansInBowl) {
      setBeansInBowl(true);
    } else if (from === 'spoon' && to === 'sugar' && !spoonHasSugar) {
      setSpoonHasSugar(true);
    } else if (from === 'spoon' && to === 'cooker' && spoonHasSugar && beansInBowl && !sugarInBowl) {
      setSugarInBowl(true); setSpoonHasSugar(false);
    } else if (from === 'cup' && to === 'cooker' && cupFilled) {
      if (sugarInBowl && !waterInBowl) {
        setWaterInBowl(true); setCupFilled(false); setShowIngredientsDonePopup(true);
      } else if (waterInBowl && !waterInCooker) {
        setWaterInCooker(true); setCupFilled(false);
      }
    } else if (from === 'lid' && to === 'cooker' && !lidOn) {
      if (allPrepDone) { setLidOn(true); setStage('confirm'); }
      else { setShowMissingPopup(true); }
    }
  };

  const elapsedSec = elapsedMs / 1000;

  const stepHint = (() => {
    if (!beansInBowl)   return '將「紅豆」拖曳放入電鍋的瓷磗';
    if (!sugarInBowl)   return spoonHasSugar ? '將裝有砂糖的劺子拖曳放入電鍋' : '將劺子拖曳到砂糖罐舤起砂糖';
    if (!waterInBowl)   return !cupFilled ? '點擊水瓶→水杯，再將水杯拖入電鍋的磗' : '將水杯拖入電鍋的磗';
    if (!waterInCooker) return !cupFilled ? '再次點擊水瓶→水杯，將水杯拖入電鍋內鍋' : '將水杯拖入電鍋內鍋';
    return '將鍋蓋拖曳至電鍋上';
  })();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => setActiveDragId(String(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragId(null)}
    >
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
        style={{ backgroundImage: `url('${IMG.bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* 返回按鈕 */}
        <button onClick={() => router.push('/main')}
          className="fixed top-3 left-3 sm:top-4 sm:left-[86px] z-9998 flex items-center justify-center rounded-full border border-amber-900/40 bg-[#fffdf0]/90 px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold text-amber-900 backdrop-blur-sm shadow-[4px_4px_0px_rgba(120,60,0,0.2)] transition-all hover:bg-white active:scale-95"
        >⬅ 返回柑仔店</button>

        {/* 步驟提示 */}
        {stage === 'prep' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-50/90 border-2 border-amber-200 px-4 py-2 rounded-3xl shadow-md max-w-[85vw]">
            <p className="text-xs sm:text-sm font-bold text-amber-900 whitespace-nowrap">👉 {stepHint}</p>
          </div>
        )}
        {stage === 'cooking' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-amber-900/85 border-2 border-amber-500 px-4 py-2 rounded-3xl shadow-md max-w-[85vw]">
            <p className="text-xs sm:text-sm font-bold text-amber-50">🍲 蒸煮中... 默數到 20 秒後點擊電鍋！</p>
          </div>
        )}

        <SteamParticles active={stage === 'cooking'} fullScreen={steamFull} />

        <div className="fixed inset-0 z-55 pointer-events-none bg-white transition-opacity duration-500"
          style={{ opacity: showWhiteFlash ? 1 : 0 }} />

        {/* 計時器：手機上縮小顯示 */}
        {stage === 'cooking' && (
          <div className={`absolute z-40 ${isMobile ? 'top-12 right-1' : 'top-16 right-4'}`}
            style={isMobile ? { transform: `scale(${Math.max(0.4, viewScale * 0.9)})`, transformOrigin: 'top right' } : {}}
          >
            <DigitalTimer seconds={elapsedSec} visible={showTimer} />
          </div>
        )}

        {/* 紅豆 */}
        <DraggableBeans visible={!beansInBowl} active={activeDragId === 'beans'} />

        {/* 砂糖（視覺） */}
        <div className="absolute z-20" style={{ bottom: 'calc(24% - 4vh)', left: '3%' }}>
          <SugarImg />
        </div>

        {/* 砂糖（損消區） */}
        <DroppableSugar disabled={sugarInBowl} />

        {/* 劺子 */}
        <DraggableSpoon spoonHasSugar={spoonHasSugar} draggable={!sugarInBowl} active={activeDragId === 'spoon'} />

        {/* 鍋蓋 */}
        <DraggableLid visible={!lidOn} active={activeDragId === 'lid'} />

        {/* 水瓶 */}
        <div
          title={waterInBowl && waterInCooker ? '材料都備齊了！' : '點擊水瓶取水'}
          className="absolute z-20"
          style={{ bottom: `calc(48% - ${vh(60)})`, right: '21%' }}
        >
          <BottleImg
            onClick={
              waterInBowl && waterInCooker
                ? () => setShowAllReadyPopup(true)
                : (!waterSelected && !cupFilled ? () => setWaterSelected(true) : undefined)
            }
          />
        </div>

        {/* 水杯 */}
        <DraggableCup
          filled={cupFilled}
          onFill={waterSelected && !cupFilled ? () => { setCupFilled(true); setWaterSelected(false); } : undefined}
          active={activeDragId === 'cup'}
          title={cupFilled ? '將水杯拖曳放入電鍋' : (waterSelected ? '點擊水杯裝水' : '先點選水瓶')}
        />

        {/* 電鍋（droppable 包裝） */}
        <div className="absolute inset-x-0 z-20 pointer-events-none"
          style={{ top: `calc(48% - ${vh(150)})`, bottom: '4%' }}
        >
          <DroppableCooker title={stage === 'cooking' ? '點擊電鍋停止計時！' : undefined}>
            <CookerImg
              lidOn={lidOn} beansInBowl={beansInBowl} sugarInBowl={sugarInBowl}
              waterInBowl={waterInBowl} waterInCooker={waterInCooker}
              cooking={stage === 'cooking'} clickable={stage === 'cooking'}
              onClick={handleCookerClick}
            />
          </DroppableCooker>
        </div>

        {/* DragOverlay: images sized to match scaled draggable (viewScale * natural px) */}
        <DragOverlay dropAnimation={null}>
          {activeDragId === 'beans' && (
            <img src={IMG.beans} alt="紅豆"
              style={{ width: `${168 * viewScale}px`, height: `${168 * viewScale}px` }}
              className="object-contain drop-shadow-lg" draggable={false} />
          )}
          {activeDragId === 'spoon' && (
            <div className="flex flex-col items-center">
              <img
                src={spoonHasSugar ? '/images/cooker_spoon.png' : '/images/scale_spoon.webp'}
                alt="木劺"
                style={{ width: `${80 * viewScale}px`, height: `${80 * viewScale}px` }}
                className={`object-contain drop-shadow-md ${spoonHasSugar ? 'drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]' : ''}`}
                draggable={false}
              />
              {spoonHasSugar && <span style={{ fontSize: `${10 * viewScale}px` }} className="text-amber-300 font-bold mt-0.5">已裝糖</span>}
            </div>
          )}
          {activeDragId === 'lid' && (
            <img src={IMG.lid} alt="電鍋蓋"
              style={{ width: `${225 * viewScale}px` }}
              className="h-auto object-contain drop-shadow-xl" draggable={false} />
          )}
          {activeDragId === 'cup' && (
            <img src={cupFilled ? IMG.cupFull : IMG.cupEmpty} alt="水杯"
              style={{ width: `${117 * viewScale}px` }}
              className="h-auto object-contain" draggable={false} />
          )}
        </DragOverlay>

        {/* 背包按鈕 */}
        <button
          onClick={() => setIsBackpackOpen(true)}
          className="absolute z-30 cursor-pointer"
          style={{ top: '80.5%', left: '91.7%', width: '8.7%', height: '15%' }}
          title="打開背包"
        />

        {isBackpackOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setIsBackpackOpen(false)} />
            <div className="relative flex flex-col items-center w-[95%] max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-[#eedcb3] p-4 sm:p-6 shadow-2xl border-4 border-amber-900/40 select-none">
              <h2 className="text-base sm:text-xl font-bold text-amber-900 mb-3 sm:mb-4 tracking-wider">🎒 我的背包</h2>
              <button onClick={() => setIsBackpackOpen(false)}
                className="absolute top-2 right-3 sm:top-3 sm:right-4 text-xl sm:text-2xl font-bold text-amber-900 hover:text-red-600 transition-colors"
              >✕</button>
              <div className="w-full grid grid-cols-6 gap-2 sm:gap-3 bg-amber-950/10 p-3 sm:p-4 rounded-xl border border-amber-900/10">
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                  <span className="text-3xl" title="阿媵的便條紙">📝</span>
                </div>
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                  {bpTape ? <span className="text-3xl" title="阿媵的錄音帶">📼</span> : <span className="text-black/15 text-2xl font-bold">?</span>}
                </div>
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                  {bpRecipe
                    ? <img src="/images/scale_menu.png" alt="紅豆湯秘方" className="w-[70%] h-[70%] object-contain" />
                    : <span className="text-black/15 text-2xl font-bold">?</span>}
                </div>
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                  {bpFilm ? <span className="text-3xl" title="時光膠卷">🎞️</span> : <span className="text-black/15 text-2xl font-bold">?</span>}
                </div>
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                  {bpBeans
                    ? <img src="/images/beans_big.webp" alt="紅豆" className="w-[75%] h-[75%] object-contain" />
                    : <span className="text-black/15 text-2xl font-bold">?</span>}
                </div>
                <div className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 flex items-center justify-center shadow-inner">
                  {bpSoup
                    ? <img src="/images/cooker_result_perfect.png" alt="阿媵的紅豆湯" className="w-[80%] h-[80%] object-contain" />
                    : <span className="text-black/15 text-2xl font-bold">?</span>}
                </div>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-white/40 rounded-lg border border-amber-900/10 shadow-inner" />
                ))}
              </div>
            </div>
          </div>
        )}

        {stage === 'confirm' && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-5 sm:p-8 w-[min(340px,90vw)] text-center shadow-2xl">
              <p className="text-3xl sm:text-4xl mb-2 sm:mb-3">🍲</p>
              <p className="text-lg sm:text-xl font-black text-amber-900 mb-2">電鍋蓋好囉！</p>
              <p className="text-xs sm:text-sm text-amber-800 mb-4 sm:mb-6 leading-relaxed">按下開關後即將開始蒸煮<br />請問準備好了嗎？</p>
              <div className="flex gap-2 sm:gap-3">
                <button onClick={() => { setLidOn(false); setStage('prep'); }}
                  className="flex-1 bg-amber-100 text-amber-900 font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:bg-amber-200 active:scale-95 transition-all">再等等</button>
                <button onClick={() => setStage('cooking')}
                  className="flex-1 bg-amber-900 text-amber-50 font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:bg-amber-950 active:scale-95 transition-all">切下開關！</button>
              </div>
            </div>
          </div>
        )}

        {showIngredientsDonePopup && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-5 sm:p-8 w-[min(340px,90vw)] text-center shadow-2xl">
              <p className="text-3xl sm:text-4xl mb-2 sm:mb-3">✅</p>
              <p className="text-lg sm:text-xl font-black text-amber-900 mb-2 sm:mb-3">材料準備完成！</p>
              <p className="text-xs sm:text-sm text-amber-800 mb-4 sm:mb-6 leading-relaxed">
                紅豆、水、砂糖都已放入瓷磗中了。<br />
                最後，再取一杯水加入<span className="font-black text-amber-950">電鍋內鍋</span>，<br />
                就可以開始烹煮囉！
              </p>
              <button onClick={() => setShowIngredientsDonePopup(false)}
                className="w-full bg-amber-900 text-amber-50 font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:bg-amber-950 active:scale-95 transition-all"
              >了解，去加水！</button>
            </div>
          </div>
        )}

        {showAllReadyPopup && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
            <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-5 sm:p-8 w-[min(300px,88vw)] text-center shadow-2xl">
              <p className="text-3xl mb-2 sm:mb-3">🍲</p>
              <p className="text-base sm:text-lg font-black text-amber-900 mb-3 sm:mb-4">材料都已加入</p>
              <p className="text-xs sm:text-sm text-amber-800 mb-4 sm:mb-6">快把鍋蓋蓋上，開始煮紅豆湯！</p>
              <button onClick={() => setShowAllReadyPopup(false)}
                className="w-full bg-amber-900 text-amber-50 font-bold py-2.5 sm:py-2 text-sm sm:text-base rounded-xl hover:bg-amber-950 transition-all"
              >好的！</button>
            </div>
          </div>
        )}

        {showMissingPopup && (
          <div className="fixed inset-0 bg-black/55 flex items-center justify-center z-50">
            <div className="bg-[#fffdf0] border-4 border-amber-900/30 rounded-2xl p-5 sm:p-8 w-[min(300px,88vw)] text-center shadow-2xl">
              <p className="text-3xl mb-2 sm:mb-3">🤔</p>
              <p className="text-base sm:text-lg font-black text-amber-900 mb-3 sm:mb-4">你好像少放了什麼喔？</p>
              <button onClick={() => setShowMissingPopup(false)}
                className="w-full bg-amber-900 text-amber-50 font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:bg-amber-950 active:scale-95 transition-all">了解！</button>
            </div>
          </div>
        )}

        {stage === 'result' && result && (
          <ResultModal result={result} elapsedSec={elapsedSec} router={router} onReset={handleReset} />
        )}

        {locked && (
          <div className="fixed inset-0 z-9999 bg-black/85 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#fffdf0] border-4 border-amber-900 rounded-2xl p-5 sm:p-8 w-[min(360px,92vw)] text-center shadow-2xl">
              <p className="text-3xl mb-2 sm:mb-3">🔒</p>
              <h2 className="text-lg sm:text-xl font-black text-amber-950 mb-2 sm:mb-3">還缺少必要道具！</h2>
              <p className="text-xs sm:text-sm text-amber-800 mb-2">你還沒拿到：</p>
              <ul className="mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
                {missingItems.map((item) => (
                  <li key={item} className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 py-1.5 sm:py-2 rounded-xl">{item}</li>
                ))}
              </ul>
              <button onClick={() => router.push('/main')}
                className="w-full bg-amber-900 text-amber-50 font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-xl hover:bg-amber-950 active:scale-95 transition-all">返回柑仔店</button>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
