// components/OrientationPrompt.tsx
"use client";

export default function OrientationPrompt() {
  return (
    <>
      {/* 注入自訂的翻轉動畫 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rotatePhone {
          0%, 10% { transform: rotate(0deg); }
          40%, 60% { transform: rotate(-90deg); }
          90%, 100% { transform: rotate(0deg); }
        }
        .animate-rotate-phone {
          animation: rotatePhone 2.5s ease-in-out infinite;
        }
      `}} />

      {/* 
        這層 Overlay 的魔法在於 Tailwind 的 class:
        - hidden: 預設隱藏 (電腦版看不到)
        - max-md:portrait:flex : 只有在「手機版尺寸 (max-md)」且「直向 (portrait)」時才會變成 flex 顯示出來
        - z-[9999]: 確保它蓋在所有遊戲畫面的最上層
      */}
      <div className="hidden max-md:portrait:flex fixed inset-0 z-[9999] bg-zinc-950 flex-col items-center justify-center text-amber-50 select-none backdrop-blur-md">
        
        <div className="w-[85%] max-w-sm bg-zinc-900 border-2 border-amber-900/50 p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center">
          
          {/* 動畫手機 Icon */}
          <div className="text-6xl mb-8 animate-rotate-phone drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
            📱
          </div>
          
          <h2 className="text-2xl font-black font-serif text-amber-500 mb-3 tracking-widest">
            請旋轉手機
          </h2>
          
          <p className="text-amber-100/70 text-sm leading-relaxed font-bold">
            這家柑仔店有點寬<br/>
            橫向遊玩體驗更佳喔！
          </p>

        </div>

      </div>
    </>
  );
}