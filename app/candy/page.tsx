"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CandyGame() {
  const router = useRouter();

  // ==================== 遊戲狀態管理 ====================
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'phone' | 'candy'>('none');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [candyCounts, setCandyCounts] = useState({ red: 0, yellow: 0, green: 0, blue: 0 });
  
  // 動畫與通話狀態
  const [dialRotation, setDialRotation] = useState<number>(0);
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(false); 

  const CORRECT_PASSWORD = "4271";

  // ==================== 🔊 音效系統 (手機相容優化版) ====================
  // 使用 useRef 來儲存唯一的 Audio 實例，避免每次呼叫都重新 new Audio
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // 元件載入時，將所有音效初始化好
    audioRefs.current = {
      jarDrop: new Audio('/audio/candydrop.mp3'),
      dial: new Audio('/audio/enternum.mp3'),         
      error: new Audio('/audio/wrongcall.mp3'),       
      success: new Audio('/audio/grandvoice.mp3'),    
      pickup: new Audio('/audio/oldphonepickup.mp3'), 
      calling: new Audio('/audio/call.mp3')           
    };
  }, []);

  // 🔑 【核心解法】手機音效解鎖機制
  // 當玩家第一次點擊電話時觸發，靜音偷播所有音效來取得瀏覽器的「播放許可」
  const unlockAudioForMobile = () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.muted = true; // 先靜音，避免爆音
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false; // 偷播完後恢復正常音量設定
        }).catch(e => console.log("音效解鎖狀態:", e));
      }
    });
  };

  const playSFX = (type: 'jarDrop' | 'dial' | 'error' | 'success' | 'pickup' | 'calling') => {
    const audio = audioRefs.current[type];
    if (!audio) return;

    // 設定音量
    if (type === 'dial') audio.volume = 0.6;
    else if (type === 'success') audio.volume = 1.0; // 阿公聲音可以大聲一點
    else audio.volume = 0.4;

    audio.currentTime = 0;
    audio.play().catch(e => console.log(`音效 ${type} 播放被阻擋:`, e));

    // 如果是通話等待音，設定 5 秒後強制停止
    if (type === 'calling') {
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 5000);
    }

    // 如果是錯誤提示音，設定 3 秒後強制停止
    if (type === 'error') {
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 3000);
    }
  };

  // ==================== 🍬 散落的糖果資料 ====================
  const exactCandies = [
    { id: 1, color: 'red', top: '15%', left: '20%' },
    { id: 2, color: 'red', top: '65%', left: '75%' },
    { id: 3, color: 'red', top: '35%', left: '45%' },
    { id: 4, color: 'red', top: '80%', left: '30%' },
    { id: 5, color: 'yellow', top: '25%', left: '65%' },
    { id: 6, color: 'yellow', top: '70%', left: '15%' },
    { id: 7, color: 'green', top: '10%', left: '40%' },
    { id: 8, color: 'green', top: '50%', left: '25%' },
    { id: 9, color: 'green', top: '85%', left: '55%' },
    { id: 10, color: 'green', top: '30%', left: '85%' },
    { id: 11, color: 'green', top: '55%', left: '65%' },
    { id: 12, color: 'green', top: '15%', left: '80%' },
    { id: 13, color: 'green', top: '75%', left: '85%' },
    { id: 14, color: 'blue', top: '45%', left: '35%' },
  ];

  const handleCandyClick = (color: 'red' | 'yellow' | 'green' | 'blue') => {
    setCandyCounts(prev => ({ ...prev, [color]: prev[color] + 1 }));
  };

  const handleDialNumber = (num: number, angle: number) => {
    if (isGameOver || inputPassword.length >= 4 || isDialing || isCalling) return;
    
    playSFX('dial');
    setIsDialing(true);
    
    setDialRotation(angle);

    setTimeout(() => {
      setDialRotation(0);
      
      setTimeout(() => {
        setIsDialing(false);
        const newPassword = inputPassword + num;
        setInputPassword(newPassword);

        if (newPassword.length === 4) {
          setIsCalling(true); 
          playSFX('calling'); 

          setTimeout(() => {
            setIsCalling(false); 
            
            if (newPassword === CORRECT_PASSWORD) {
              playSFX('success'); // 現在這行在手機上也能完美發出聲音了！
              setIsGameOver(true);
              localStorage.setItem('hasTape', 'true');
            } else {
              playSFX('error');
              setTimeout(() => setInputPassword(''), 1000);
            }
          }, 5000);
        }
      }, 400); 
    }, 500); 
  };

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden selection:bg-transparent">
      
      <div className="relative inline-block w-full max-w-5xl aspect-video rounded-xl shadow-2xl overflow-hidden border border-white/10 bg-zinc-900">
        
        {/* 背景圖片 */}
        <img 
          src="/images/candybg.webp" 
          alt="玻璃糖果罐與電話近景" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />

        <button
          onClick={() => router.push('/main')}
          className="absolute top-4 left-4 z-20 flex items-center justify-center rounded-full border border-amber-900/40 bg-[#fffdf0]/90 px-4 py-2 text-sm font-bold text-amber-900 backdrop-blur-sm transition-all hover:bg-white active:scale-95 shadow-[4px_4px_0px_rgba(120,60,0,0.2)]"
        >
          ⬅ 返回柑仔店
        </button>

        {/* ==================== 場景互動熱區 ==================== */}
        
        {/* 糖果罐熱區 */}
        <button
          onClick={() => {
            unlockAudioForMobile(); // 在這裡也加入解鎖，以防玩家先點糖果罐
            playSFX('jarDrop');
            setActiveOverlay('candy');
          }}
          className="absolute top-[10%] left-[20%] w-[25%] h-[65%] cursor-pointer rounded-3xl transition-colors hover:bg-white/10 z-10"
          title="仔細查看糖果罐"
        />

        {/* 電話互動熱區 */}
        <button
          onClick={() => {
            unlockAudioForMobile(); // 關鍵點：觸發解鎖機制
            playSFX('pickup');
            setActiveOverlay('phone');
          }}
          className="absolute top-[35%] left-[45%] w-[35%] h-[45%] cursor-pointer rounded-3xl transition-colors hover:bg-white/10 z-10"
          title="拿起話筒撥號"
        />

        {/* ==================== 🍬 散落的糖果視窗 ==================== */}
        {activeOverlay === 'candy' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setActiveOverlay('none')}></div>
            
            <div className="relative w-[80%] max-w-2xl aspect-video bg-[#e6dcc3] rounded-lg shadow-2xl border-[12px] border-[#8b5a2b] p-6 pointer-events-none">
              <button onClick={() => setActiveOverlay('none')} className="pointer-events-auto absolute -top-4 -right-4 w-10 h-10 bg-[#8b5a2b] rounded-full text-white font-bold border-2 border-[#e6dcc3] hover:bg-[#6b4421] transition-colors flex items-center justify-center shadow-lg">✕</button>
              
              <p className="absolute top-2 left-4 text-amber-900/50 font-serif font-bold text-sm">把糖果倒出來數一數...</p>

              {/* 散落的糖果實體 */}
              <div className="relative w-full h-full pointer-events-auto">
                {exactCandies.map((candy) => (
                  <button
                    key={candy.id}
                    onClick={() => handleCandyClick(candy.color as 'red' | 'yellow' | 'green' | 'blue')}
                    className={`absolute w-12 h-10 rounded-[40%] shadow-[inset_-3px_-3px_8px_rgba(0,0,0,0.3),3px_5px_6px_rgba(0,0,0,0.4)] transition-transform active:scale-75 cursor-pointer
                      ${candy.color === 'red' ? 'bg-[#d93838]' : ''}
                      ${candy.color === 'yellow' ? 'bg-[#f0c040]' : ''}
                      ${candy.color === 'green' ? 'bg-[#40a040]' : ''}
                      ${candy.color === 'blue' ? 'bg-[#3060c0]' : ''}
                    `}
                    style={{ 
                      top: candy.top, 
                      left: candy.left,
                      transform: `rotate(${candy.id * 37}deg)`
                    }}
                  >
                    <div className="w-5 h-2 bg-white/40 rounded-full absolute top-1 left-2 rotate-[20deg]"></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 🛠️ 擬真老式復古電話轉盤 ==================== */}
        {activeOverlay === 'phone' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="absolute inset-0 cursor-pointer" onClick={() => !isCalling && setActiveOverlay('none')}></div>
            
            <div className="relative bg-[#3b6e5b] p-8 rounded-full border-[6px] border-[#25473a] w-[85%] max-w-[400px] aspect-square flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5),0_20px_50px_rgba(0,0,0,0.7)] text-white select-none">
              
              <button onClick={() => !isCalling && setActiveOverlay('none')} className={`absolute -top-2 right-4 text-3xl font-bold text-[#7cb39e] transition-colors ${isCalling ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}`}>✕</button>
              
              <div className="absolute top-[6%] w-[45%] bg-[#1b362c] border-b-2 border-t-2 border-[#12241d] shadow-[inset_0_3px_5px_rgba(0,0,0,0.5)] rounded px-2 py-1 text-center font-mono text-xl text-emerald-400 tracking-[0.4em] h-10 flex items-center justify-center">
                {inputPassword.split('').map(() => '• ')}
                {isCalling && (
                  <span className="text-emerald-300 text-sm tracking-normal animate-pulse">通話中...</span>
                )}
                {inputPassword.length === 4 && !isCalling && inputPassword !== CORRECT_PASSWORD && (
                  <span className="text-red-500 text-sm tracking-normal animate-pulse">空號</span>
                )}
              </div>

              <div 
                className={`relative w-[88%] aspect-square rounded-full bg-white/5 border-2 border-black/20 shadow-[0_15px_25px_rgba(0,0,0,0.5)] flex items-center justify-center group transition-transform duration-500 ease-in-out ${isCalling ? 'opacity-70' : ''}`}
                style={{ transform: `rotate(${dialRotation}deg)` }}
              >
                <div className="w-[38%] aspect-square rounded-full bg-[#e8e0cc] border-4 border-[#82887a] shadow-[inset_0_0_15px_rgba(0,0,0,0.3),0_5px_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center z-20"
                     style={{ transform: `rotate(${-dialRotation}deg)`, transition: 'transform 0.5s ease-in-out' }}>
                  <div className="w-[70%] aspect-square rounded-full border border-zinc-400/50 bg-[#f7f4ed] shadow-inner flex items-center justify-center">
                     <div className="w-[80%] border-b border-zinc-300"></div>
                  </div>
                </div>

                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, idx) => {
                  const angle = (idx * 28) - 50; 
                  const radius = 95; 
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  return (
                    <button
                      key={num}
                      onClick={() => handleDialNumber(num, 120 + (idx * 20))}
                      style={{ transform: `translate(${x}px, ${y}px) rotate(${-dialRotation}deg)`, transition: 'transform 0.5s ease-in-out' }}
                      disabled={isDialing || isCalling}
                      className="absolute w-[20%] aspect-square rounded-full bg-[#f4f4f4] text-zinc-800 font-mono font-black text-xl sm:text-2xl shadow-[inset_4px_6px_10px_rgba(0,0,0,0.4),0_1px_1px_rgba(255,255,255,0.8)] flex items-center justify-center transition-all hover:bg-white active:bg-zinc-300 z-10 disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      {num}
                    </button>
                  );
                })}

                <div className="absolute bottom-[5%] right-[10%] w-3 h-12 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600 rounded-sm transform rotate-[60deg] z-30 shadow-[2px_2px_5px_rgba(0,0,0,0.5)] border border-zinc-500" />
              </div>
            </div>
          </div>
        )}

        {/* ==================== 成功通關彈窗 ==================== */}
        {isGameOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in select-none">
            <div className="bg-[#fffdf0] p-8 rounded-2xl border-4 border-amber-900 max-w-sm w-[85%] text-center shadow-[0_0_50px_rgba(180,100,0,0.3)] flex flex-col items-center">
              <span className="text-5xl mb-2 animate-bounce">🎉</span>
              <h2 className="text-2xl font-black text-amber-950 font-serif mb-2">解謎成功！</h2>
              <p className="text-sm text-emerald-800 font-bold mb-6 leading-relaxed">
                伴隨著清脆的喀噠聲，電話那頭傳來了阿公令人懷念的聲音...
              </p>
              
              <div className="w-36 aspect-[1.5/1] bg-amber-900/5 rounded-xl border-2 border-dashed border-amber-800/40 flex flex-col items-center justify-center p-3 mb-6 shadow-inner transform -rotate-2">
                <span className="text-4xl mb-1">📼</span>
                <span className="text-xs font-bold text-amber-950 font-serif tracking-widest">錄音帶 (回憶碎片)</span>
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