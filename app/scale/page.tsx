"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  DndContext,
  DragEndEvent,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface WeightItem {
  id: string;
  grams: number;
  label: string;
  imageName: string;
}

type SFXType = "clear" | "weight" | "wrong" | "ya" | "click" | "scoop";

function MobileDroppableArea({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

function MobileDraggableWeight({
  item,
  size = "table",
}: {
  item: WeightItem;
  size?: "table" | "plate";
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    touchAction: "none",
  };

  if (size === "plate") {
    return (
      <img
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        src={`/images/${item.imageName}.webp`}
        alt={item.label}
        className="w-7 h-7 object-contain cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform drop-shadow-md z-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="flex flex-col items-center cursor-grab active:cursor-grabbing transition-all hover:-translate-y-1.5 hover:scale-105 z-50"
    >
      <img
        src={`/images/${item.imageName}.webp`}
        alt={item.label}
        className="w-10 h-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] pointer-events-none"
      />
      <span className="text-[9px] font-black bg-amber-900/90 text-amber-50 px-1.5 py-0.5 rounded-full mt-0.5 min-w-[34px] text-center shadow-md border border-amber-900/90 pointer-events-none">
        {item.label}
      </span>
    </div>
  );
}

function MobileDraggableSpoon() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "scale_spoon",
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="absolute bottom-[25%] left-[70%] flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 z-50"
    >
      <img
        src="/images/scale_spoon.webp"
        alt="木勺"
        className="w-16 h-16 object-contain drop-shadow-md pointer-events-none"
      />
    </div>
  );
}

export default function ScaleGame() {
  const router = useRouter();

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 80,
        tolerance: 8,
      },
    })
  );

  const [isMobileDrag, setIsMobileDrag] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDrag(window.matchMedia("(pointer: coarse)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const audioRefs = useRef<Record<SFXType, HTMLAudioElement | null>>({
    clear: null,
    weight: null,
    wrong: null,
    ya: null,
    click: null,
    scoop: null,
  });

  useEffect(() => {
    audioRefs.current.clear = new Audio("/audio/gameclear.mp3");
    audioRefs.current.weight = new Audio("/audio/scale_weight.wav");
    audioRefs.current.wrong = new Audio("/audio/scale_wrong.wav");
    audioRefs.current.ya = new Audio("/audio/scale_ya.wav");
    audioRefs.current.click = new Audio("/audio/scale_click.wav");
    audioRefs.current.scoop = new Audio("/audio/bean_scoop.mp3");
  }, []);

  const playSFX = (type: SFXType) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const hasRecipe = localStorage.getItem("hasRecipe") === "true";
    if (!hasRecipe) {
      setLocked(true);
    }
  }, []);

  const [availableWeights, setAvailableWeights] = useState<WeightItem[]>([
    { id: "w-10", grams: 10, label: "10g", imageName: "scale_10g" },
    { id: "w-20", grams: 20, label: "20g", imageName: "scale_20g" },
    { id: "w-30", grams: 30, label: "30g", imageName: "scale_30g" },
    { id: "w-50", grams: 50, label: "50g", imageName: "scale_50g" },
    { id: "w-100", grams: 100, label: "100g", imageName: "scale_100g" },
    { id: "w-200-1", grams: 200, label: "200g", imageName: "scale_200g" },
    { id: "w-200-2", grams: 200, label: "200g", imageName: "scale_200g_2" },
  ]);

  const [placedWeights, setPlacedWeights] = useState<WeightItem[]>([]);
  const totalRightWeight = placedWeights.reduce((sum, item) => sum + item.grams, 0);

  const [totalLeftBean, setTotalLeftBean] = useState<number>(0);
  const [isSpoonOnTable, setIsSpoonOnTable] = useState<boolean>(true);

  const [showQTE, setShowQTE] = useState<boolean>(false);
  const [qteProgress, setQteProgress] = useState<number>(0);
  const qteDirection = useRef<number>(1);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const targetMin = 65;
  const targetMax = 80;

  const isBalanced = totalLeftBean === 540 && totalRightWeight === 540;
  const hasPlayedClearSound = useRef(false);

  useEffect(() => {
    if (isBalanced && !hasPlayedClearSound.current) {
      playSFX("clear");
      hasPlayedClearSound.current = true;
    }
  }, [isBalanced]);

  useEffect(() => {
    if (showQTE) {
      lastTimeRef.current = performance.now();

      const updateQTE = (timestamp: number) => {
        const deltaTime = timestamp - lastTimeRef.current;
        lastTimeRef.current = timestamp;
        const cappedDelta = Math.min(deltaTime, 30);

        setQteProgress((prev) => {
          let next = prev + qteDirection.current * 0.08 * cappedDelta;

          if (next >= 100) {
            next = 100;
            qteDirection.current = -1;
          } else if (next <= 0) {
            next = 0;
            qteDirection.current = 1;
          }

          return next;
        });

        animationRef.current = requestAnimationFrame(updateQTE);
      };

      animationRef.current = requestAnimationFrame(updateQTE);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      setQteProgress(0);
      qteDirection.current = 1;
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [showQTE]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToScale = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const id = e.dataTransfer.getData("text/plain");
    const currentWeight = availableWeights.find((item) => item.id === id);

    if (currentWeight) {
      playSFX("weight");
      setPlacedWeights((prev) => [...prev, currentWeight]);
      setAvailableWeights((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleDropBackToTable = (e: React.DragEvent) => {
    e.preventDefault();

    const id = e.dataTransfer.getData("text/plain");
    const weightToRemove = placedWeights.find((item) => item.id === id);

    if (weightToRemove) {
      setAvailableWeights((prev) => [...prev, weightToRemove]);
      setPlacedWeights((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSpoonDropOnBeans = (e: React.DragEvent) => {
    e.preventDefault();

    const id = e.dataTransfer.getData("text/plain");

    if (id === "scale_spoon") {
      playSFX("scoop");
      setIsSpoonOnTable(false);
      setShowQTE(true);
    }
  };

  const handleMobileDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (overId === "right-scale") {
      const currentWeight = availableWeights.find((item) => item.id === activeId);

      if (currentWeight) {
        playSFX("weight");
        setPlacedWeights((prev) => [...prev, currentWeight]);
        setAvailableWeights((prev) => prev.filter((item) => item.id !== activeId));
      }
    }

    if (overId === "weight-table") {
      const weightToRemove = placedWeights.find((item) => item.id === activeId);

      if (weightToRemove) {
        setAvailableWeights((prev) => [...prev, weightToRemove]);
        setPlacedWeights((prev) => prev.filter((item) => item.id !== activeId));
      }
    }

    if (overId === "bean-bag" && activeId === "scale_spoon") {
      playSFX("scoop");
      setIsSpoonOnTable(false);
      setShowQTE(true);
    }
  };

  const handleQTESubmit = () => {
    if (!showQTE) return;

    playSFX("click");

    if (qteProgress >= targetMin && qteProgress <= targetMax) {
      playSFX("ya");
      setTotalLeftBean(540);

      setTimeout(() => {
        alert("完美！精準舀出了 540g 的紅豆！");
      }, 300);
    } else {
      playSFX("wrong");
      setTotalLeftBean(0);

      setTimeout(() => {
        alert("哎呀！沒抓穩，紅豆都撒回袋子裡了！再試一次吧！");
      }, 300);
    }

    setShowQTE(false);
    setIsSpoonOnTable(true);
  };

  const currentAngle = -90 + qteProgress * 1.8;
  const arcLength = 267.03;
  const yellowLength = (arcLength * (targetMax - targetMin)) / 100;

  const gameContent = (
    <div
      className="relative inline-block w-full max-w-5xl aspect-video rounded-xl shadow-2xl overflow-hidden border border-white/10 bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: "url('/images/scale_1.webp')" }}
    >
      <button
        onClick={() => router.push("/main")}
        className="absolute top-4 left-4 z-30 flex items-center justify-center rounded-3xl bg-white/90 px-4 py-2 shadow-md hover:bg-white text-gray-700 font-bold transition-all text-sm"
      >
        ← 返回柑仔店
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-50/90 border-amber-50/90 backdrop-blur-sm border-2 px-6 py-2 rounded-3xl shadow-md z-30 text-center flex gap-6 items-center min-w-[260px] justify-center">
        <div className="text-sm font-bold text-amber-900">
          右盤砝碼：<span className="text-red-600 font-black">{totalRightWeight}</span> g
        </div>
      </div>

      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {isMobileDrag ? (
          <MobileDroppableArea
            id="bean-bag"
            className="absolute top-0 left-0 w-[38%] h-full pointer-events-auto z-20"
          >
            <div className="absolute bottom-[30%] left-[15%] w-[62%] flex flex-col items-center justify-end">
              <img
                src="/images/scale_beans.webp"
                alt="豆袋"
                className="w-full h-auto object-contain drop-shadow-md pointer-events-none"
              />
            </div>

            {isSpoonOnTable && <MobileDraggableSpoon />}
          </MobileDroppableArea>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleSpoonDropOnBeans}
            className="absolute top-0 left-0 w-[38%] h-full pointer-events-auto z-20"
          >
            <div className="absolute bottom-[30%] left-[15%] w-[62%] flex flex-col items-center justify-end">
              <img
                src="/images/scale_beans.webp"
                alt="豆袋"
                className="w-full h-auto object-contain drop-shadow-md"
              />
            </div>

            {isSpoonOnTable && (
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, "scale_spoon")}
                className="absolute bottom-[25%] left-[70%] flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
              >
                <img
                  src="/images/scale_spoon.webp"
                  alt="木勺"
                  className="w-16 h-16 object-contain drop-shadow-md"
                />
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2 w-[42%] aspect-10/7 pointer-events-auto z-20">
          <img
            src="/images/scale_balance.webp"
            alt="天秤"
            className="w-full h-full object-contain pointer-events-none"
          />

          {isMobileDrag ? (
            <MobileDroppableArea
              id="right-scale"
              className={`absolute top-[12%] right-[2%] w-[30%] h-[28%] rounded-full border-2 border-dashed transition-all flex flex-wrap gap-1 p-1 items-center justify-center z-10 ${
                totalRightWeight > 0
                  ? "border-amber-600 bg-amber-950/10"
                  : "border-transparent hover:border-amber-400 hover:bg-white/10"
              }`}
            >
              {placedWeights.map((item) => (
                <MobileDraggableWeight key={item.id} item={item} size="plate" />
              ))}
            </MobileDroppableArea>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDropToScale}
              className={`absolute top-[12%] right-[2%] w-[30%] h-[28%] rounded-full border-2 border-dashed transition-all flex flex-wrap gap-1 p-1 items-center justify-center z-10 ${
                totalRightWeight > 0
                  ? "border-amber-600 bg-amber-950/10"
                  : "border-transparent hover:border-amber-400 hover:bg-white/10"
              }`}
            >
              {placedWeights.map((item) => (
                <img
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  src={`/images/${item.imageName}.webp`}
                  alt={item.label}
                  className="w-7 h-7 object-contain cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform drop-shadow-md"
                />
              ))}
            </div>
          )}

          {totalLeftBean > 0 && (
            <div className="absolute top-[14%] left-[-3%] w-[44%] h-[34%] z-30 pointer-events-none overflow-visible">
              <img
                src="/images/beans_big.webp"
                alt="紅豆堆"
                className="absolute left-1/2 top-1/2 w-[70%] h-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
              />
            </div>
          )}
        </div>

        {isMobileDrag ? (
          <MobileDroppableArea
            id="weight-table"
            className="absolute top-0 right-0 w-[36%] h-full pointer-events-auto z-10"
          >
            <div className="absolute bottom-[28%] right-[10%] grid grid-cols-4 gap-x-3 gap-y-3">
              {availableWeights.map((item) => (
                <MobileDraggableWeight key={item.id} item={item} />
              ))}
            </div>
          </MobileDroppableArea>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDrop={handleDropBackToTable}
            className="absolute top-0 right-0 w-[36%] h-full pointer-events-auto z-10"
          >
            <div className="absolute bottom-[28%] right-[10%] grid grid-cols-4 gap-x-3 gap-y-3">
              {availableWeights.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="flex flex-col items-center cursor-grab active:cursor-grabbing transition-all hover:-translate-y-1.5 hover:scale-105"
                >
                  <img
                    src={`/images/${item.imageName}.webp`}
                    alt={item.label}
                    className="w-10 h-10 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] pointer-events-none"
                  />
                  <span className="text-[9px] font-black bg-amber-900/90 text-amber-50 px-1.5 py-0.5 rounded-full mt-0.5 min-w-[34px] text-center shadow-md border border-amber-900/90">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showQTE && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-8 w-[56%] max-w-[520px] aspect-7/4 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] flex items-center justify-between select-none">
            <div className="relative w-[68%] h-full flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <path
                  d="M 15,110 A 85,85 0 0,1 185,110"
                  fill="none"
                  stroke="#292524"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <path
                  d="M 15,110 A 85,85 0 0,1 185,110"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="18"
                  strokeLinecap="butt"
                  strokeDasharray={`${yellowLength} ${arcLength}`}
                  strokeDashoffset={(-arcLength * targetMin) / 100}
                />
                <g transform={`rotate(${currentAngle}, 100, 110)`}>
                  <line
                    x1="100"
                    y1="110"
                    x2="100"
                    y2="20"
                    stroke="#dc2626"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  <circle cx="100" cy="110" r="5" fill="#dc2626" />
                </g>
              </svg>
            </div>

            <div className="flex items-center justify-center w-[28%]">
              <button
                onClick={handleQTESubmit}
                className="w-20 h-20 rounded-full bg-stone-950/70 backdrop-blur-md border-2 border-white/20 hover:bg-stone-950/90 active:scale-95 text-amber-50 hover:text-amber-300 font-black text-xl shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all cursor-pointer tracking-widest"
              >
                點擊
              </button>
            </div>
          </div>
        </div>
      )}

      {isBalanced && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="relative bg-[#fdfaf2] border border-amber-900/10 p-8 rounded-[32px] max-w-sm w-[80%] text-center flex flex-col items-center overflow-visible shadow-[0_0_60px_rgba(0,0,0,0.55),0_15px_30px_rgba(0,0,0,0.3)]">
            <div className="w-full flex items-center justify-center h-28 my-3 overflow-visible">
              <img
                src="/images/beans_big.webp"
                alt="獲得道具：紅豆"
                className="w-20 h-20 object-contain transform scale-[2] drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
              />
            </div>

            <p className="text-amber-950 font-black text-lg mb-2 tracking-wider">
              成功獲得道具「紅豆」！
            </p>

            <button
              onClick={() => {
                localStorage.setItem("hasBeans", "true");
                router.push("/main");
              }}
              className="w-full bg-stone-900/10 backdrop-blur-md border-2 border-white/60 hover:bg-stone-900/20 text-stone-900 font-black py-3 px-6 rounded-2xl shadow-md transition-all tracking-widest text-sm cursor-pointer"
            >
              收進背包並回到柑仔店
            </button>
          </div>
        </div>
      )}

      {locked && (
        <div className="absolute inset-0 z-9999 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#fffdf0] border-4 border-amber-900 rounded-2xl p-8 w-[340px] text-center shadow-2xl">
            <h2 className="text-xl font-black text-amber-950 mb-3">請先完成日曆拼圖</h2>

            <p className="text-sm text-amber-800 mb-6 leading-relaxed">
              你還沒有拿到紅豆湯秘方喔！
            </p>

            <button
              onClick={() => router.push("/main")}
              className="w-full bg-amber-900 text-amber-50 font-bold py-3 rounded-xl hover:bg-amber-950 active:scale-95 transition-all"
            >
              返回柑仔店
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-transparent">
      {isMobileDrag ? (
        <DndContext sensors={sensors} onDragEnd={handleMobileDragEnd}>
          {gameContent}
        </DndContext>
      ) : (
        gameContent
      )}
    </main>
  );
}