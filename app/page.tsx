"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from 'next/image';
import { motion } from 'framer-motion';
  

export default function Home() {

  const router = useRouter();
  // 記錄是否開始播放穿越動畫
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 點擊開始按鈕的處理函式
  const handleStartGame = () => {
    if (isTransitioning) return; // 防止重複點擊
    setIsTransitioning(true);

    // 延遲 2.5 秒後（等發光與全白動畫結束），再手動切換到 /intro
    setTimeout(() => {
      router.push("/intro");
    }, 2500);
  };

  return (
    <main
      className="relative h-screen w-screen overflow-hidden bg-black"
      style={{
        backgroundImage: "url('/images/start.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ==================== 門的白光特效層 ==================== */}
      <motion.div
        className="absolute z-5 pointer-events-none rounded-sm bg-white"
        style={{
          left: "50.5%",
          top: "75%",
          width: "338px",
          height: "428px",
        }}
        initial={{ 
          x: "-50%", 
          y: "-50%", 
          opacity: 0, 
          filter: "blur(20px) drop-shadow(0 0 0px rgba(255,255,255,0))" 
        }}
        animate={isTransitioning ? {
          opacity: [0, 0.8, 1], // 漸漸變亮
          filter: [
            "blur(20px) drop-shadow(0 0 10px rgba(255,255,255,0.5))",
            "blur(10px) drop-shadow(0 0 40px rgba(255,255,255,0.9))",
            "blur(0px) drop-shadow(0 0 100px rgba(255,255,255,1))"
          ]
        } : {}}
        transition={{
          duration: 1.5, // 門發光持續 1.5 秒
          ease: "easeIn"
        }}
      />

      {/* ==================== 開始遊戲按鈕 ==================== */}
      <div className="absolute bottom-[15%] left-[50.5%] -translate-x-1/2 z-10">
        <motion.div
          className="relative cursor-pointer"
          onClick={handleStartGame}
          whileHover={!isTransitioning ? { scale: 1.08 } : {}}
          whileTap={!isTransitioning ? { scale: 0.96 } : {}}
          // 開始穿越時，按鈕自己慢慢淡出消失
          animate={isTransitioning ? { opacity: 0, scale: 0.9, pointerEvents: "none" } : { opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.5 }}
        >
          <Image
            src="/images/start_button.png"
            alt="開始遊戲"
            width={308} 
            height={28} 
            className="w-full h-auto object-contain" 
            priority
          />
        </motion.div>
      </div>

      {/* ==================== 全螢幕白屏轉場層 ==================== */}
      <motion.div
        className="absolute inset-0 z-50 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        // 接續在門發光之後（利用 delay），讓整個畫面吞噬在白光中
        animate={isTransitioning ? { opacity: 1 } : { opacity: 0 }}
        transition={{
          delay: 1.2,      // 門發光到一半時，全螢幕開始變白
          duration: 1.0,    // 白屏大約閃爍擴散 1 秒
          ease: "linear"
        }}
      />
    </main>
  );
}