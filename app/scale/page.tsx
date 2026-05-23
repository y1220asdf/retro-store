"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

interface WeightItem {
  id: string;
  grams: number;
  label: string;
  imageName: string;
}

export default function ScaleGame() {
  const router = useRouter();

  //砝碼設定
  const [availableWeights, setAvailableWeights] = useState<WeightItem[]>([
    { id: 'w-10', grams: 10, label: '10g', imageName: 'scale_10g' },
    { id: 'w-20', grams: 20, label: '20g', imageName: 'scale_20g' },
    { id: 'w-30', grams: 30, label: '30g', imageName: 'scale_30g' },
    { id: 'w-50', grams: 50, label: '50g', imageName: 'scale_50g' },
    { id: 'w-100', grams: 100, label: '100g', imageName: 'scale_100g' },
    { id: 'w-200-1', grams: 200, label: '200g', imageName: 'scale_200g' },
    { id: 'w-200-2', grams: 200, label: '200g', imageName: 'scale_200g_2' },
  ]);

  const [placedWeights, setPlacedWeights] = useState<WeightItem[]>([]);
  const totalRightWeight = placedWeights.reduce((sum, item) => sum + item.grams, 0);

  // 紅豆與勺子狀態
  const [totalLeftBean, setTotalLeftBean] = useState<number>(0); 
  const [isSpoonOnTable, setIsSpoonOnTable] = useState<boolean>(true); 

  //QTE 狀態
  const [showQTE, setShowQTE] = useState<boolean>(false);
  const [qteProgress, setQteProgress] = useState<number>(0); // 0 ~ 100
  const qteDirection = useRef<number>(1); 
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  //成功閾值範圍 (黃線區域百分比)
  const targetMin = 65;
  const targetMax = 80;

  //修正勝利條件：左盤剛好 540g 且 右盤也精確放了 540g 砝碼
  const isBalanced = totalLeftBean === 540 && totalRightWeight === 540;

  // Delta Time指針動畫
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

  //拖移邏輯
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropToScale = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/plain');
    
    const currentWeight = availableWeights.find(item => item.id === id);
    if (currentWeight) {
      setPlacedWeights([...placedWeights, currentWeight]);
      setAvailableWeights(availableWeights.filter(item => item.id !== id));
    }
  };

  const handleDropBackToTable = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const weightToRemove = placedWeights.find(item => item.id === id);
    
    if (weightToRemove) {
      setAvailableWeights([...availableWeights, weightToRemove]);
      setPlacedWeights(placedWeights.filter(item => item.id !== id));
    }
  };

  const handleSpoonDropOnBeans = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id === 'scale_spoon') {
      setIsSpoonOnTable(false);
      setShowQTE(true);
    }
  };

  //點擊按鈕結算
  const handleQTESubmit = () => {
    if (!showQTE) return;

    if (qteProgress >= targetMin && qteProgress <= targetMax) {
      //修正邏輯：只要按對正確區域，就「直接送你滿滿的 540g 紅豆」！
      alert("完美！精準舀出了 540g 的紅豆！");
      setTotalLeftBean(540);
    } else {
      alert("哎呀！沒抓穩，紅豆都撒回袋子裡了！再試一次吧！");
      setTotalLeftBean(0); // 按錯了就沒撈到，保持 0g
    }

    setShowQTE(false);
    setIsSpoonOnTable(true);
  };

  const currentAngle = -90 + qteProgress * 1.8;

  // 半圓總長度公式：π * r (r=85) ≈ 267.03
  const arcLength = 267.03;
  // 精確計算黃色段的長度與偏移
  const yellowLength = (arcLength * (targetMax - targetMin)) / 100;
  const yellowOffset = arcLength - (arcLength * targetMin) / 100;

  return (
    <div 
      className="fixed inset-0 w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: "url('/images/scale_1.webp')" }}
    >
      
      {/*返回主導覽按鈕 */}
      <button
        onClick={() => router.push('/main')}
        className="absolute top-4 left-4 z-30 flex items-center justify-center rounded-3xl bg-white/90 px-4 py-2 shadow-md hover:bg-white text-gray-700 font-bold transition-all text-sm"
      >
        ← 返回柑仔店
      </button>

      {/*簡化數據看板：讓玩家知道目標是 540g，以及現在右邊幾克 */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-amber-50/90 border-amber-50/90 backdrop-blur-sm border-2 px-6 py-2 rounded-3xl shadow-md z-30 text-center flex gap-6 items-center min-w-[320px] justify-center">
        <div className="text-sm font-bold text-amber-900">
          右盤砝碼：<span className="text-red-600 font-black">{totalRightWeight}</span> g
        </div>
      </div>
            
      {/*遊戲物件絕對定位層 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">

        {/*左側區域：豆袋與勺子*/}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleSpoonDropOnBeans}
          className="absolute top-0 left-0 w-[40%] h-full pointer-events-auto z-20"
        >
          <div className="absolute bottom-[22%] left-[12%] w-[320px] flex flex-col items-center justify-end">
            <img 
              src="/images/scale_beans.webp"
              alt="豆袋"
              className="w-full h-auto object-contain drop-shadow-md"
            />
          </div>

          {/* 木勺子 */}
          {isSpoonOnTable && (
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, 'scale_spoon')}
              className="absolute bottom-[24%] left-[72%] flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
            >
              <img 
                src="/images/scale_spoon.webp"
                alt="木勺" 
                className="w-16 h-16 object-contain drop-shadow-md"
              />
            </div>
          )}
        </div>

        {/* 【中央區域：天秤】 */}
        <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 w-[500px] h-[350px] pointer-events-auto z-20">
          <img 
            src="/images/scale_balance.webp" 
            alt="天秤"
            className="w-full h-full object-contain pointer-events-none"
          />

          <div 
            onDragOver={handleDragOver}
            onDrop={handleDropToScale}
            className={`absolute top-[12%] right-[2%] w-[150px] h-[100px] rounded-full border-2 border-dashed transition-all flex flex-wrap gap-1 p-2 items-center justify-center z-10
              ${totalRightWeight > 0 ? 'border-amber-600 bg-amber-950/10' : 'border-transparent hover:border-amber-400 hover:bg-white/10'}`}
          >
            {placedWeights.map((item) => (
              <img
                key={item.id}
                draggable 
                onDragStart={(e) => handleDragStart(e, item.id)}
                src={`/images/${item.imageName}.webp`}
                alt={item.label}
                className="w-10 h-10 object-contain cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform drop-shadow-md"
              />
            ))}
          </div>

          {/* 顯示天秤左盤上的紅豆視覺 */}
          {totalLeftBean > 0 && (
            <div className="absolute top-[7%] left-[-10%] w-[290px] h-[150px] z-30 pointer-events-none overflow-visible">
              <img
                src="/images/beans.webp"
                alt="紅豆堆"
                className="absolute left-1/2 top-1/2 w-[330px] h-auto -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
              />
            </div>
          )}
        </div>

        {/*右側區域：桌面砝碼*/}
        <div 
          onDragOver={handleDragOver}
          onDrop={handleDropBackToTable}
          className="absolute top-0 right-0 w-[45%] h-full pointer-events-auto z-10"
        >
          <div className="absolute bottom-[20%] right-[15%] max-w-[260px] flex flex-wrap gap-x-5 gap-y-4 justify-center">
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
                  className="w-14 h-14 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] pointer-events-none"
                />
                <span className="text-[10px] font-black bg-amber-900/90 text-amber-50 px-1.5 py-0.5 rounded-full mt-1 min-w-[38px] text-center shadow-md border border-amber-900/90">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/*QTE 校準進度條彈窗*/}
      {showQTE && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          
          {/* 高質感白色毛玻璃長方形底框 */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 p-12 w-[560px] h-[320px] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] flex items-center justify-between select-none">
            
            {/* 左側：修正後完美等寬、無錯位 SVG 圓弧畫布 */}
            <div className="relative w-[320px] h-[240px] flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {/* 深灰色基礎背景圓弧 (半徑 85, 圓心 100, 110) */}
              <path
                d="M 15,110 A 85,85 0 0,1 185,110"
                fill="none"
                stroke="#292524"
                strokeWidth="18" 
                strokeLinecap="round"
              />
              
              {/*黃色成功閾值區*/}
              <path
                d="M 15,110 A 85,85 0 0,1 185,110"
                fill="none"
                stroke="#fbbf24" 
                strokeWidth="18"
                strokeLinecap="butt"
                strokeDasharray={`${yellowLength} ${arcLength}`}
                strokeDashoffset={-arcLength * targetMin / 100}
              />

              {/*紅色指針針頭：精確繞著圓心 (100, 110) 連動旋轉 */}
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

            {/* 右側深色毛玻璃按鈕 */}
            <div className="flex items-center justify-center w-[120px]">
              <button
                onClick={handleQTESubmit}
                className="w-24 h-24 rounded-full bg-stone-950/70 backdrop-blur-md border-2 border-white/20 hover:bg-stone-950/90 active:scale-95 text-amber-50 hover:text-amber-300 font-black text-2xl shadow-[0_8px_25px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all cursor-pointer tracking-widest"
              >
                點擊
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 獲得紅豆道具 - 勝利破關彈窗 */}
      {isBalanced && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          {/* 保持外框精緻大小 */}
          <div className="relative bg-[#fdfaf2] border border-amber-900/10 p-10 rounded-[32px] max-w-sm w-full text-center flex flex-col items-center overflow-visible shadow-[0_0_60px_rgba(0,0,0,0.55),0_15px_30px_rgba(0,0,0,0.3)]">
            
            {/* 🔴 核心修正：利用 scale-[3] 直接將圖片核心像素強制放大 3 倍，並允許 overflow 穿透外框 */}
            <div className="w-full flex items-center justify-center h-32 my-4 overflow-visible">
              <img 
                src="/images/beans.webp" 
                alt="獲得道具：紅豆" 
                className="w-24 h-24 object-contain transform scale-[5] drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
              />
            </div>

            <p className="text-amber-950 font-black text-lg mb-2 tracking-wider">
              成功獲得道具「紅豆」！
            </p>
            
            <button
              onClick={() => router.push('/main')}
              className="w-full bg-stone-900/10 backdrop-blur-md border-2 border-white/60 hover:bg-stone-900/20 text-stone-900 font-black py-3 px-6 rounded-2xl shadow-md transition-all tracking-widest text-sm cursor-pointer"
            >
              返回柑仔店
            </button>
          </div>
        </div>
      )}

    </div>
  );
}