"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Candy {
  id: number;
  color: 'red' | 'yellow' | 'green' | 'blue';
  style: { top: string; left: string; width: string; height: string };
}

export default function CandyGame() {
  const router = useRouter();

  // ==================== 遊戲狀態管理 ====================
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'phone'>('none');
  const [inputPassword, setInputPassword] = useState<string>(''); // 玩家撥號紀錄
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  // 讓玩家在畫面上實體清點的軟糖數量狀態
  const [candyCounts, setCandyCounts] = useState({ red: 0, yellow: 0, green: 0, blue: 0 });

  const CORRECT_PASSWORD = "4271"; // 🎯 正確軟糖密碼

  // ==================== 實體軟糖位置鋪設 (對應罐子範圍) ====================
  // 在糖果罐的位置上，散落放置 4+2+7+1 = 14 顆可點擊計數的半透明糖果熱區
  const interactiveCandies: Candy[] = [
    // 紅色 4 顆
    { id: 1, color: 'red', style: { top: '35%', left: '30%', width: '3%', height: '5%' } },
    { id: 2, color: 'red', style: { top: '45%', left: '28%', width: '3%', height: '5%' } },
    { id: 3, color: 'red', style: { top: '55%', left: '33%', width: '3%', height: '5%' } },
    { id: 4, color: 'red', style: { top: '65%', left: '31%', width: '3%', height: '5%' } },
    // 黃色 2 顆
    { id: 5, color: 'yellow', style: { top: '40%', left: '34%', width: '3%', height: '5%' } },
    { id: 6, color: 'yellow', style: { top: '60%', left: '27%', width: '3%', height: '5%' } },
    // 綠色 7 顆
    { id: 7, color: 'green', style: { top: '38%', left: '27%', width: '3%', height: '5%' } },
    { id: 8, color: 'green', style: { top: '48%', left: '32%', width: '3%', height: '5%' } },
    { id: 9, color: 'green', style: { top: '50%', left: '36%', width: '3%', height: '5%' } },
    { id: 10, color: 'green', style: { top: '58%', left: '30%', width: '3%', height: '5%' } },
    { id: 11, color: 'green', style: { top: '68%', left: '34%', width: '3%', height: '5%' } },
    { id: 12, color: 'green', style: { top: '52%', left: '29%', width: '3%', height: '5%' } },
    { id: 13, color: 'green', style: { top: '43%', left: '36%', width: '3%', height: '5%' } },
    // 藍色 1 顆
    { id: 14, color: 'blue', style: { top: '55%', left: '35%', width: '3%', height: '5%' } },
  ];

  // 點擊軟糖時數量 +1
  const handleCandyClick = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    setCandyCounts(prev => ({
      ...prev,
      [color]: prev[color] + 1
    }));
  };

  // ==================== 復古轉盤撥號處理 ====================
  const handleDialNumber = (num: number) => {
    if (isGameOver || inputPassword.length >= 4) return;
    
    const newPassword = inputPassword + num;
    setInputPassword(newPassword);

    // 輸滿 4 位數時自動驗證
    if (newPassword.length === 4) {
      if (newPassword === CORRECT_PASSWORD) {
        setIsGameOver(true);
        localStorage.setItem('hasTape', 'true'); // 存入通關道具
      } else {
        // 錯誤的話，等待一秒讓玩家看清楚輸入內容，然後重置
        setTimeout(() => {
          setInputPassword('');
        }, 1200);
      }
    }
  };

  // 定義轉盤上各個數字孔洞的角度位置 (讓視覺更像真實轉盤)
  const dialAngles = [150, 30, 60, 90, 120, 150, 180, 210, 240, 270]; // 0-9 的分佈角度

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-transparent">
      
      {/* 16:9 自適應遊戲外框，確保所有點擊熱區絕對不跑位 */}
      <div className="relative inline-block max-w-full max-h-full rounded-xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* 背景圖：糖果罐與電話近景 */}
        <img 
          src="/images/candybg.webp" 
          alt="玻璃糖果罐與電話近景" 
          className="block w-auto h-auto max-w-full max-h-[90vh] object-contain"
        />

        {/* ⬅ 返回主導覽按鈕 */}
        <button
          onClick={() => router.push('/main')}
          className="absolute top-4 left-4 z-20 flex items-center justify-center rounded-full border border-amber-900/40 bg-amber-50/90 px-4 py-2 text-sm font-bold text-amber-900 backdrop-blur-sm transition-all hover:bg-amber-100 active:scale-95 shadow-md"
        >
          ⬅ 返回柑仔店耶耶耶
        </button>

        {/* ==================== 實體互動：糖果罐點擊數數系統 ==================== */}
        {interactiveCandies.map((candy) => (
          <button
            key={candy.id}
            onClick={() => handleCandyClick(candy.color)}
            style={candy.style}
            className={`absolute z-10 rounded-full cursor-pointer transition-all duration-150 active:scale-75
              ${candy.color === 'red' ? 'bg-red-500/10 hover:bg-red-500/40' : ''}
              ${candy.color === 'yellow' ? 'bg-yellow-500/10 hover:bg-yellow-500/40' : ''}
              ${candy.color === 'green' ? 'bg-green-500/10 hover:bg-green-500/40' : ''}
              ${candy.color === 'blue' ? 'bg-blue-500/10 hover:bg-blue-500/40' : ''}
            `}
            title={`點擊清點${candy.color}色軟糖`}
          />
        ))}

        {/* 畫面中央下方：動態計數便利貼，讓玩家知道自己數到哪了 */}
        <div className="absolute bottom-[4%] left-[15%] bg-[#fffde6] px-4 py-2 rounded shadow-md border border-amber-200/60 font-serif text-xs sm:text-sm flex gap-4 text-amber-900 font-bold pointer-events-none select-none">
          <span className="text-red-600">紅: {candyCounts.red}</span>
          <span className="text-amber-600">黃: {candyCounts.yellow}</span>
          <span className="text-green-700">綠: {candyCounts.green}</span>
          <span className="text-blue-600">藍: {candyCounts.blue}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setCandyCounts({ red: 0, yellow: 0, green: 0, blue: 0 }); }}
            className="pointer-events-auto text-[10px] bg-amber-800 text-white px-1 rounded hover:bg-amber-900 active:scale-90 ml-1"
          >
            重置
          </button>
        </div>


        {/* ==================== 點擊進入電話大轉盤熱區 ==================== */}
        <button
          onClick={() => setActiveOverlay('phone')}
          className="absolute top-[35%] left-[48%] w-[30%] h-[40%] cursor-pointer rounded-full transition-colors hover:bg-white/10 z-10"
          title="拿起話筒撥號"
        />


        {/* ==================== 🛠️ 擬真老式復古電話轉盤彈窗 ==================== */}
        {activeOverlay === 'phone' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveOverlay('none')}></div>
            
            {/* 擬真古典電話外殼面板 (限縮高度尺寸，絕不溢出) */}
            <div className="relative bg-gradient-to-b from-emerald-900 to-emerald-950 p-6 rounded-full border-4 border-emerald-800/80 w-[80%] max-w-[340px] aspect-square flex flex-col items-center justify-center shadow-2xl text-white select-none">
              
              {/* 關閉電話 */}
              <button onClick={() => setActiveOverlay('none')} className="absolute -top-2 right-4 text-2xl font-bold text-emerald-200 hover:text-white transition-colors">✕</button>
              
              {/* 目前撥號顯示小視窗 */}
              <div className="absolute top-[12%] w-[55%] bg-black/60 border border-emerald-800 rounded px-2 py-1 text-center font-mono text-lg text-emerald-400 tracking-[0.3em] h-8 flex items-center justify-center">
                {inputPassword.split('').map(() => '• ')}
                {inputPassword.length === 4 && inputPassword !== CORRECT_PASSWORD && (
                  <span className="text-red-500 text-xs tracking-normal animate-pulse">重撥中</span>
                )}
              </div>

              {/* 🔮 核心古典轉盤圓盤 */}
              <div className="relative w-[75%] aspect-square rounded-full bg-emerald-800/40 border-4 border-emerald-600/60 shadow-inner flex items-center justify-center group">
                
                {/* 轉盤中心點：復古老金屬蓋 */}
                <div className="w-[30%] aspect-square rounded-full bg-gradient-to-tr from-amber-600 to-amber-200 border-2 border-amber-700 shadow-md flex items-center justify-center z-20">
                  <span className="text-[10px] text-amber-900 font-bold font-serif scale-90">TAIWAN</span>
                </div>

                {/* 圍繞在周圍的 0-9 數字撥號孔洞 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, idx) => {
                  // 計算每一個圓圈孔洞的數學幾何角度座標位置
                  const angle = (idx * 30) + 40; 
                  const radius = 68; // 孔洞中心離原點的距離 (px)
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  return (
                    <button
                      key={num}
                      onClick={() => handleDialNumber(num)}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className="absolute w-[22%] aspect-square rounded-full bg-amber-50 text-emerald-950 font-mono font-black text-sm sm:text-base border border-amber-300 shadow-md flex items-center justify-center transition-all hover:bg-amber-200 active:scale-75 active:bg-amber-400 z-10"
                    >
                      {num}
                    </button>
                  );
                })}

                {/* 撥號限制金屬擋片 (視覺裝飾，讓轉盤更逼真) */}
                <div className="absolute bottom-[10%] right-[12%] w-2 h-6 bg-amber-400/80 rounded-sm transform rotate-45 z-10 shadow-sm" />
              </div>

              <span className="absolute bottom-[8%] text-[10px] text-emerald-300/60 font-serif tracking-wider">依序點擊孔洞進行撥號</span>
            </div>
          </div>
        )}


        {/* ==================== 彈出視窗：成功通關彈窗 ==================== */}
        {isGameOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in select-none">
            
            <div className="bg-amber-50 p-6 sm:p-8 rounded-2xl border-4 border-amber-800 max-w-sm w-[85%] text-center shadow-2xl flex flex-col items-center">
              <span className="text-4xl mb-1 animate-bounce">🎉</span>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-900 font-serif mb-1">解謎成功！</h2>
              <p className="text-xs text-green-700 font-bold mb-5">伴隨著喀噠聲，電話那頭傳來了阿嬤令人懷念的聲音...</p>
              
              <div className="w-32 aspect-[1.4/1] bg-amber-900/10 rounded-xl border-2 border-dashed border-amber-800/40 flex flex-col items-center justify-center p-3 mb-5 shadow-inner">
                <span className="text-3xl mb-1">📼</span>
                <span className="text-xs font-bold text-amber-900 font-serif">錄音帶 (回憶碎片)</span>
              </div>

              <button
                onClick={() => router.push('/main')}
                className="w-full py-2.5 rounded-xl bg-amber-800 text-white text-sm font-bold tracking-wider shadow-md transition-all hover:bg-amber-900 active:scale-95"
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