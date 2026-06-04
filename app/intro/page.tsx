"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Intro() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");

  const firstText = "20年後";
  const finalText = "這時的你決定進入柑仔店一探究竟\n找回阿公的回憶碎片...";

  // 每個 step 對應的圖片 / 文字邏輯
  const storySteps = [
    // 0：柑仔店空景
    { type: "image", src: "/images/0.webp", duration: 1600 },

    // 1.1~1.3：年輕阿公走出來
    { type: "image", src: "/images/1.1.webp", duration: 450 },
    { type: "image", src: "/images/1.2.webp", duration: 450 },
    { type: "image", src: "/images/1.3.webp", duration: 900 },

    // 2.1~2.3：年輕阿公跟小朋友互動
    { type: "image", src: "/images/2.1.webp", duration: 550 },
    { type: "image", src: "/images/2.2.webp", duration: 550 },
    { type: "image", src: "/images/2.3.webp", duration: 1300 },

    // 3.1：年輕阿公阿罵煮紅豆湯給主角
    { type: "image", src: "/images/3.1.webp", duration: 2600 },

    // 3~4 中間黑幕轉換：20年後
    { type: "text", text: firstText, duration: 3600 },

    // 4.1、4.2：下雨柑仔店無人問津
    { type: "image", src: "/images/4.1.webp", duration: 2400 },
    { type: "image", src: "/images/4.2.webp", duration: 2400 },

    // 5.1：阿公愁眉苦臉思考
    { type: "image", src: "/images/5.1.webp", duration: 2500 },

    // 6.1~6.3：營業最後一天公告飛下來
    { type: "image", src: "/images/6.1.webp", duration: 420 },
    { type: "image", src: "/images/6.2.webp", duration: 420 },
    { type: "image", src: "/images/6.3.webp", duration: 1100 },

    // 7.1：主角把公告撿起來
    { type: "image", src: "/images/7.1.webp", duration: 2300 },

    // 8.1~8.3：走入柑仔店
    { type: "image", src: "/images/8.1.webp", duration: 650 },
    { type: "image", src: "/images/8.2.webp", duration: 650 },
    { type: "image", src: "/images/8.3.webp", duration: 1300 },

    // 8 之後黑幕轉換：最後文字
    { type: "text", text: finalText, duration: 4300 },
  ];

  const currentStep = storySteps[step];
  const finalStepIndex = storySteps.length - 1;

  // 控制整體流程與計時器
  useEffect(() => {
    if (step < storySteps.length) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, currentStep.duration);

      return () => clearTimeout(timer);
    } else {
      router.push("/main");
    }
  }, [step, router]);

  // 控制打字機特效
  useEffect(() => {
    if (currentStep?.type === "text" && currentStep.text) {
      let i = 0;
      const fullText = currentStep.text;

      setTypedText("");

      const typingInterval = setInterval(() => {
        setTypedText(fullText.slice(0, i + 1));
        i++;

        if (i >= fullText.length) {
          clearInterval(typingInterval);
        }
      }, 130);

      return () => clearInterval(typingInterval);
    }
  }, [step]);

  // 右下角略過按鈕處理
  const handleSkip = () => {
    // 點擊略過時，不直接進遊戲，而是跳到最後黑幕文字
    setStep(finalStepIndex);
  };

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-black overflow-hidden">
      {/* 圖片階段 */}
      {currentStep?.type === "image" && (
        <img
          key={currentStep.src}
          src={currentStep.src}
          alt={`Story step ${step}`}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out opacity-100"
        />
      )}

      {/* 黑幕 + 舊膠捲感 + 打字機文字 */}
      {currentStep?.type === "text" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black transition-opacity duration-1000">
          {/* 舊膠捲顆粒 */}
          <div className="pointer-events-none absolute inset-0 z-10 film-grain opacity-40" />

          {/* 微微閃爍光感 */}
          <div className="pointer-events-none absolute inset-0 z-10 film-flicker" />

          {/* 膠捲刮痕線 */}
          <div className="pointer-events-none absolute left-[8%] top-0 z-10 h-full w-[2px] bg-white/10" />
          <div className="pointer-events-none absolute right-[12%] top-0 z-10 h-full w-[1px] bg-white/10" />

          <div className="relative z-30 whitespace-pre-line text-center text-white text-3xl md:text-4xl leading-[2.1] tracking-[0.25em] font-serif">
            {typedText}
            <span className="ml-1 animate-pulse">|</span>
          </div>
        </div>
      )}

      {/* 右下角跳過按鈕：保留原本按鈕效果 */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-10 right-10 z-50 rounded-full border border-white/40 bg-black/30 px-6 py-2 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white ${
          step >= finalStepIndex ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        跳過動畫 ⏭
      </button>

      <style jsx>{`
        .film-grain {
          background-image: radial-gradient(
              circle at 20% 30%,
              rgba(255, 255, 255, 0.18) 0,
              transparent 1px
            ),
            radial-gradient(
              circle at 70% 60%,
              rgba(255, 255, 255, 0.12) 0,
              transparent 1px
            ),
            radial-gradient(
              circle at 40% 80%,
              rgba(255, 255, 255, 0.1) 0,
              transparent 1px
            );
          background-size: 90px 90px, 120px 120px, 70px 70px;
          animation: grainMove 0.35s steps(2) infinite;
        }

        @keyframes grainMove {
          0% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-2%, 1%);
          }
          50% {
            transform: translate(1%, -2%);
          }
          75% {
            transform: translate(-1%, 2%);
          }
          100% {
            transform: translate(0, 0);
          }
        }

        .film-flicker {
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 255, 255, 0.08) 50%,
            transparent 100%
          );
          mix-blend-mode: screen;
          animation: flicker 1.4s infinite;
        }

        @keyframes flicker {
          0%,
          100% {
            opacity: 0.12;
          }
          20% {
            opacity: 0.28;
          }
          45% {
            opacity: 0.08;
          }
          70% {
            opacity: 0.22;
          }
        }
      `}</style>
    </main>
  );
}


// "use client";
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function Intro() {
//   const router = useRouter();
//   const [step, setStep] = useState(0);
//   const [typedText, setTypedText] = useState('');
//   const fullText = "20 年後 ...";

//   // 控制整體流程與計時器
//   useEffect(() => {
//     // 重新定義時間軸 (毫秒)：
//     // step 0~2: 前三張熱鬧圖 (各 2.5 秒)
//     // step 3: 20年後黑畫面打字 (3.5 秒)
//     // step 4~6: 後三張冷清圖 (各 2.5 秒)
//     // step 7: 決定進入柑仔店的結尾文字 (3.5 秒)
//     const timerDurations = [2500, 2500, 2500, 3500, 2500, 2500, 2500, 3500]; 

//     // 如果還沒播到第 8 階段 (step 8)，就繼續計時
//     if (step < 8) {
//       const timer = setTimeout(() => {
//         setStep((prev) => prev + 1);
//       }, timerDurations[step]);
      
//       return () => clearTimeout(timer);
//     } else {
//       // step 8 代表連最後的文字都播完了，正式進入遊戲
//       router.push('/main');
//     }
//   }, [step, router]);

//   // 控制打字機特效 (只在 step === 3 時觸發)
//   useEffect(() => {
//     if (step === 3) {
//       let i = 0;
//       setTypedText('');
//       const typingInterval = setInterval(() => {
//         setTypedText(fullText.slice(0, i + 1));
//         i++;
//         if (i === fullText.length) {
//           clearInterval(typingInterval);
//         }
//       }, 300);
      
//       return () => clearInterval(typingInterval);
//     }
//   }, [step]);

//   // 右下角略過按鈕處理
//   const handleSkip = () => {
//     // 點擊略過時，不直接進遊戲，而是把階段設定為 7 (結尾文字)
//     setStep(7);
//   };

//   return (
//     <main className="relative flex h-screen w-screen items-center justify-center bg-black overflow-hidden">
      
//       {/* 利用迴圈與 Tailwind 渲染前三張圖 (1.png ~ 3.png)
//         使用 transition-opacity duration-1000 ease-in-out 直接把 CSS 寫在 className 裡
//       */}
//       {[1, 2, 3].map((num, idx) => (
//         <img
//           key={num}
//           src={`/images/${num}.webp`}
//           alt={`Story part ${num}`}
//           className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
//             step >= idx && step < 3 ? 'opacity-100' : 'opacity-0'
//           }`}
//         />
//       ))}

//       {/* 階段 3：黑畫面 + 打字機文字 */}
//       <div className={`absolute z-10 text-white text-4xl tracking-[0.5em] font-serif transition-opacity duration-1000 ${
//         step === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'
//       }`}>
//         {typedText}
//       </div>

//       {/* 利用迴圈與 Tailwind 渲染後三張圖 (4.png ~ 6.png) */}
//       {[4, 5, 6].map((num, idx) => {
//         const activeStep = idx + 4; // 對應的 step 為 4, 5, 6
//         return (
//           <img
//             key={num}
//             src={`/images/${num}.webp`} 
//             alt={`Story part ${num}`}
//             className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
//               step >= activeStep && step < 7 ? 'opacity-100' : 'opacity-0'
//             }`}
//           />
//         );
//       })}

//       {/* 階段 7：進場前的結尾文字 */}
//       <div className={`absolute z-20 flex flex-col items-center justify-center text-white font-serif transition-opacity duration-1000 ${
//         step === 7 ? 'opacity-100' : 'opacity-0 pointer-events-none'
//       }`}>
//         <p className="mb-4 text-3xl tracking-[0.2em]">這時的你決定進入柑仔店一探究竟</p>
//         <p className="text-2xl tracking-[0.3em] text-gray-300">找回阿公的回憶碎片...</p>
//       </div>

//       {/* 右下角跳過按鈕
//         當進入 step 7 (結尾文字) 時，自動隱藏跳過按鈕
//       */}
//       <button
//         onClick={handleSkip}
//         className={`absolute bottom-10 right-10 z-50 rounded-full border border-white/40 bg-black/30 px-6 py-2 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white ${
//           step >= 7 ? 'opacity-0 pointer-events-none' : 'opacity-100'
//         }`}
//       >
//         跳過動畫 ⏭
//       </button>
//     </main>
//   );
// }