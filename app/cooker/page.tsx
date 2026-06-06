"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type GameStage = 'prep' | 'confirm' | 'cooking' | 'result';
type ResultType = 'perfect' | 'overcooked' | 'undercooked';

// ─── Image paths ──────────────────────────────────────────
const IMG = {
  bg:                    '/images/cooker_bg.webp',
  // Cooker open states (bowl is part of each image)
  cookerBody:            '/images/cooker_body.webp',           // 無蓋、空碗
  cookerBodyBeans:       '/images/cooker_body_beans.webp',     // 無蓋、碗有紅豆
  cookerBodySugar:       '/images/cooker_body_sugar.webp',     // 無蓋、碗有紅豆+糖
  cookerBodySoup:        '/images/cooker_body_soup.webp',      // 無蓋、碗有紅豆+糖+水
  cookerBodyWater:       '/images/cooker_body_water.webp',     // 無蓋、內鍋加水+碗有紅豆+糖+水
  // Cooker lid states
  cookerLidOn:           '/images/cooker_lid_on.webp',
  cookerLidOnCooking:    '/images/cooker_lid_on_cooking.webp',
  // Lid on table
  lid:                   '/images/cooker_lid.webp',
  // Water objects
  bottle:                '/images/cooker_bottle.webp',
  cupEmpty:              '/images/cooker_cup_empty.webp',
  cupFull:               '/images/cooker_cup_full.webp',
  // Sugar
  sugar:                 '/images/cooker_sugar.webp',
  // Result bowls
  resultPerfect:         '/images/cooker_result_perfect.webp',
  resultOvercooked:      '/images/cooker_result_overcooked.webp',
  resultUndercooked:     '/images/cooker_result_undercooked.webp',
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
        className="w-[220px] h-auto object-contain drop-shadow-2xl select-none"
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
        className="w-[68px] h-auto object-contain select-none"
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
        className="w-[52px] h-auto object-contain select-none"
        draggable={false}
      />
      {filled && (
        <span className="text-[10px] text-sky-300 font-bold mt-1 bg-black/35 px-2 rounded-full">
          拖曳使用
        </span>
      )}
    </div>
  );
}

// ─── Sugar Jar ────────────────────────────────────────────
function SugarImg({ onDragStart }: { onDragStart: (e: React.DragEvent) => void }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex flex-col items-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
    >
      <img
        src={IMG.sugar}
        alt="砂糖"
        className="w-[56px] h-auto object-contain select-none"
        draggable={false}
      />
      <span className="text-[10px] text-amber-300 mt-1 font-bold bg-black/35 px-2 rounded-full">
        拖曳加糖
      </span>
    </div>
  );
}

// ─── Lid on table ─────────────────────────────────────────
function LidImg({ onClick }: { onClick?: () => void }) {
  return (
    <div
      className={`flex flex-col items-center ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      <img
        src={IMG.lid}
        alt="電鍋蓋"
        className="w-[150px] h-auto object-contain drop-shadow-xl select-none"
        draggable={false}
      />
      {onClick && (
        <span className="text-[10px] text-amber-300 mt-1 font-bold bg-black/35 px-2 py-0.5 rounded-full">
          點擊蓋上鍋蓋
        </span>
      )}
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
      className="w-[200px] h-auto object-contain drop-shadow-xl"
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
        className="relative rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border-2 border-amber-900/60"
        style={{ background: 'linear-gradient(135deg, #2a1a06, #1a0e04)' }}
      >
        <div className="m-3 rounded-xl overflow-hidden border border-black/60"
          style={{ background: '#0a0a04', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)' }}
        >
          <div className="px-6 py-3 flex flex-col items-center" style={{ minWidth: '160px' }}>
            <p className="text-[10px] tracking-[0.3em] mb-1" style={{ color: '#5a7040' }}>秒數</p>
            <div className="relative">
              <p className="font-mono font-black text-5xl leading-none"
                style={{ color: '#c8f040', textShadow: '0 0 12px #a0d020, 0 0 24px #80b010', letterSpacing: '0.05em' }}
              >
                {display}
              </p>
              {/* Cover slides in after 5s */}
              <div
                className="absolute inset-0 rounded flex items-center justify-center transition-all duration-700"
                style={{
                  background: '#0a0a04',
                  opacity: visible ? 0 : 1,
                  transform: visible ? 'scaleY(0)' : 'scaleY(1)',
                  transformOrigin: 'top',
                }}
              >
                <p className="text-[10px] tracking-[0.2em]" style={{ color: '#3a5020' }}>-- --</p>
              </div>
            </div>
            <p className="text-[9px] tracking-[0.25em] mt-1" style={{ color: '#3a5020' }}>SEC</p>
          </div>
        </div>
        <p className="text-center text-[8px] tracking-[0.4em] pb-2" style={{ color: '#5a3a10' }}>TIMER</p>
      </div>
      <p className={`mt-2 text-[10px] font-bold tracking-wider text-center ${visible ? 'text-amber-400/70' : 'text-amber-600/60 animate-pulse'}`}>
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
  { x: 10, y: 20, s: 60, dur: 1.4, delay: 0.0 }, { x: 30, y: 50, s: 80, dur: 1.8, delay: 0.2 },
  { x: 55, y: 10, s: 100, dur: 2.0, delay: 0.5 }, { x: 75, y: 60, s: 70, dur: 1.6, delay: 0.1 },
  { x: 20, y: 70, s: 90, dur: 1.9, delay: 0.4 }, { x: 85, y: 30, s: 65, dur: 1.5, delay: 0.7 },
  { x: 42, y: 40, s: 85, dur: 2.1, delay: 0.3 }, { x: 65, y: 80, s: 75, dur: 1.7, delay: 0.6 },
  { x: 5,  y: 45, s: 55, dur: 2.2, delay: 0.9 }, { x: 90, y: 55, s: 95, dur: 1.3, delay: 0.2 },
  { x: 35, y: 25, s: 110, dur: 1.8, delay: 0.8 }, { x: 60, y: 15, s: 78, dur: 2.0, delay: 1.0 },
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
          20%  { opacity: 0.7; }
          80%  { transform: scale(1.8); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
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
function ResultModal({ result, elapsedSec, router }: {
  result: ResultType; elapsedSec: number; router: ReturnType<typeof useRouter>;
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
      desc: `只煮了 ${elapsedSec.toFixed(1)} 秒，紅豆還沒熟，全沉在碗底。\n請重新收集材料再試試吧！`,
      btnLabel: '回去準備材料',
      action: () => { localStorage.removeItem('hasBeans'); router.push('/main'); },
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

  const [beansInBowl, setBeansInBowl]     = useState(false);
  const [waterSelected, setWaterSelected] = useState(false);
  const [cupFilled, setCupFilled]         = useState(false);
  const [waterInBowl, setWaterInBowl]     = useState(false);
  const [sugarInBowl, setSugarInBowl]     = useState(false);
  const [waterInCooker, setWaterInCooker] = useState(false);
  const [lidOn, setLidOn]                 = useState(false);
  const [showMissingPopup, setShowMissingPopup]           = useState(false);
  const [showIngredientsDonePopup, setShowIngredientsDonePopup] = useState(false);

  const [elapsedMs, setElapsedMs]         = useState(0);
  const [showTimer, setShowTimer]         = useState(true);
  const startTimeRef = useRef<number>(0);
  const rafRef       = useRef<number>(0);

  const [steamFull, setSteamFull]         = useState(false);
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

  const handleCookerClick = () => {
    if (stage !== 'cooking') return;
    cancelAnimationFrame(rafRef.current);
    const finalMs = performance.now() - startTimeRef.current;
    setElapsedMs(finalMs);
    setSteamFull(true);
    setTimeout(() => {
      const sec = finalMs / 1000;
      setResult(sec >= 18 && sec <= 22 ? 'perfect' : sec > 22 ? 'overcooked' : 'undercooked');
      setSteamFull(false);
      setStage('result');
    }, 1600);
  };

  const handlePutLid = () => {
    if (!beansInBowl || !waterInBowl || !sugarInBowl || !waterInCooker) {
      setShowMissingPopup(true); return;
    }
    setLidOn(true); setStage('confirm');
  };

  const elapsedSec    = elapsedMs / 1000;
  const allPrepDone   = beansInBowl && waterInBowl && sugarInBowl && waterInCooker;

  const stepHint = (() => {
    if (!beansInBowl)   return '點擊「紅豆」放入電鍋內的瓷碗';
    if (!sugarInBowl)   return '將砂糖拖入電鍋的碗中';
    if (!waterInBowl)   return !cupFilled ? '點擊水瓶→水杯，再將水杯拖入電鍋的碗' : '將水杯拖入電鍋的碗';
    if (!waterInCooker) return !cupFilled ? '再次點擊水瓶→水杯，將水杯拖入電鍋內鍋' : '將水杯拖入電鍋內鍋';
    return '點擊鍋蓋蓋上電鍋';
  })();

  return (
    <div
      className="fixed inset-0 w-screen h-screen overflow-hidden select-none"
      style={{ backgroundImage: `url('${IMG.bg}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Back button */}
      <button onClick={() => router.push('/main')}
        className="absolute top-4 left-4 z-30 flex items-center justify-center rounded-3xl bg-white/90 px-4 py-2 shadow-md hover:bg-white text-gray-700 font-bold transition-all text-sm"
      >← 返回柑仔店</button>

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

      {/* ── Beans from backpack ── */}
      {!beansInBowl && (
        <div className="absolute z-20 flex flex-col items-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
          style={{ bottom: '47%', left: '7%' }}
          onClick={() => setBeansInBowl(true)}
        >
          <img src="/images/beans_big.webp" alt="紅豆" className="w-14 h-14 object-contain drop-shadow-lg" draggable={false} />
          <span className="text-[10px] text-amber-300 mt-1 font-bold bg-black/40 px-2 py-0.5 rounded-full">背包的紅豆</span>
        </div>
      )}

      {/* ── Sugar (appears once beans are in bowl) ── */}
      {beansInBowl && !sugarInBowl && (
        <div className="absolute z-20" style={{ bottom: '47%', left: '5%' }}>
          <SugarImg onDragStart={(e) => e.dataTransfer.setData('text', 'sugar')} />
        </div>
      )}

      {/* ── Rice cooker (center) — bowl is part of the image ── */}
      <div className="absolute z-20" style={{ bottom: '36%', left: '50%', transform: 'translateX(-50%)' }}>
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
            // Step 2: 砂糖拖入碗（豆已入碗，尚未加糖）
            if (id === 'sugar' && beansInBowl && !sugarInBowl) {
              setSugarInBowl(true);
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
          }}
        />
      </div>

      {/* ── Lid on table (appears when all prep done) ── */}
      {allPrepDone && !lidOn && stage === 'prep' && (
        <div className="absolute z-20" style={{ bottom: '48%', left: '50%', transform: 'translateX(-50%) translateX(-140px)' }}>
          <LidImg onClick={handlePutLid} />
        </div>
      )}

      {/* ── Water bottle ── */}
      <div className="absolute z-20" style={{ bottom: '37%', right: '14%' }}>
        <BottleImg
          selected={waterSelected}
          onClick={!waterSelected && !cupFilled ? () => setWaterSelected(true) : undefined}
        />
      </div>

      {/* ── Water cup ── */}
      <div className="absolute z-20" style={{ bottom: '36%', right: '6%' }}>
        <CupImg
          filled={cupFilled}
          onClick={waterSelected && !cupFilled ? () => { setCupFilled(true); setWaterSelected(false); } : undefined}
          isDraggable={cupFilled}
          onDragStart={cupFilled ? (e) => e.dataTransfer.setData('text', 'cup') : undefined}
        />
      </div>

      {/* ── Digital timer ── */}
      {stage === 'cooking' && (
        <div className="absolute top-16 right-4 z-40">
          <DigitalTimer seconds={elapsedSec} visible={showTimer} />
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
        <ResultModal result={result} elapsedSec={elapsedSec} router={router} />
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
