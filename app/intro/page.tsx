"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Intro() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = "20 年後 ...";

  // 控制整體流程與計時器
  useEffect(() => {
    // 重新定義時間軸 (毫秒)：
    // step 0~2: 前三張熱鬧圖 (各 2.5 秒)
    // step 3: 20年後黑畫面打字 (3.5 秒)
    // step 4~6: 後三張冷清圖 (各 2.5 秒)
    // step 7: 決定進入柑仔店的結尾文字 (3.5 秒)
    const timerDurations = [2500, 2500, 2500, 3500, 2500, 2500, 2500, 3500]; 

    // 如果還沒播到第 8 階段 (step 8)，就繼續計時
    if (step < 8) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, timerDurations[step]);
      
      return () => clearTimeout(timer);
    } else {
      // step 8 代表連最後的文字都播完了，正式進入遊戲
      router.push('/main');
    }
  }, [step, router]);

  // 控制打字機特效 (只在 step === 3 時觸發)
  useEffect(() => {
    if (step === 3) {
      let i = 0;
      setTypedText('');
      const typingInterval = setInterval(() => {
        setTypedText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
          clearInterval(typingInterval);
        }
      }, 300);
      
      return () => clearInterval(typingInterval);
    }
  }, [step]);

  // 右下角略過按鈕處理
  const handleSkip = () => {
    // 點擊略過時，不直接進遊戲，而是把階段設定為 7 (結尾文字)
    setStep(7);
  };

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-black overflow-hidden">
      
      {/* 利用迴圈與 Tailwind 渲染前三張圖 (1.png ~ 3.png)
        使用 transition-opacity duration-1000 ease-in-out 直接把 CSS 寫在 className 裡
      */}
      {[1, 2, 3].map((num, idx) => (
        <img
          key={num}
          src={`/images/${num}.webp`}
          alt={`Story part ${num}`}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
            step >= idx && step < 3 ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* 階段 3：黑畫面 + 打字機文字 */}
      <div className={`absolute z-10 text-white text-4xl tracking-[0.5em] font-serif transition-opacity duration-1000 ${
        step === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        {typedText}
      </div>

      {/* 利用迴圈與 Tailwind 渲染後三張圖 (4.png ~ 6.png) */}
      {[4, 5, 6].map((num, idx) => {
        const activeStep = idx + 4; // 對應的 step 為 4, 5, 6
        return (
          <img
            key={num}
            src={`/images/${num}.webp`} 
            alt={`Story part ${num}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              step >= activeStep && step < 7 ? 'opacity-100' : 'opacity-0'
            }`}
          />
        );
      })}

      {/* 階段 7：進場前的結尾文字 */}
      <div className={`absolute z-20 flex flex-col items-center justify-center text-white font-serif transition-opacity duration-1000 ${
        step === 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <p className="mb-4 text-3xl tracking-[0.2em]">這時的你決定進入柑仔店一探究竟</p>
        <p className="text-2xl tracking-[0.3em] text-gray-300">找回阿公的回憶碎片...</p>
      </div>

      {/* 右下角跳過按鈕
        當進入 step 7 (結尾文字) 時，自動隱藏跳過按鈕
      */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-10 right-10 z-50 rounded-full border border-white/40 bg-black/30 px-6 py-2 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white ${
          step >= 7 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        跳過動畫 ⏭
      </button>
    </main>
  );
}