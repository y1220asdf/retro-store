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
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* 背景圖 */}
        <Image
        src="/images/start.webp"
        alt=""
        fill
        priority
        className="object-cover"
        />
    
        {/* ==================== 時光穿越白光 ==================== */}
          <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          initial={{
          opacity: 0,
          background:
          "radial-gradient(circle at center, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 100%)",
          }}
          animate={
          isTransitioning
          ? {
          opacity: [0, 0.3, 0.6, 1],
          scale: [1, 1.2, 1.5, 2],
          }
          : {}
          }
          transition={{
          duration: 2.0,
          ease: "easeInOut",
          }}
          style={{
          background:
          "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, rgba(255,255,255,0) 80%)",
          }}
          />

          {/* 最後整個畫面變白 */}
          <motion.div
          className="absolute inset-0 z-50 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={isTransitioning ? { opacity: 1 } : { opacity: 0 }}
          transition={{
          delay: 1.3,
          duration: 1.2,
          ease: "easeIn",
          }}
          />


        {/* ==================== 開始遊戲按鈕 ==================== */}
        <div className="absolute left-[51%] top-[68%] -translate-x-1/2 z-20">
          <motion.div
            className="cursor-pointer"
            onClick={handleStartGame}
            whileHover={!isTransitioning ? { scale: 1.08 } : {}}
            whileTap={!isTransitioning ? { scale: 0.96 } : {}}
            animate={
              isTransitioning
                ? {
                    opacity: 0,
                    scale: 0.9,
                  }
                : {
                    opacity: 1,
                  }
            }
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.5,
            }}
          >
            <Image
              src="/images/start_button.png"
              alt="開始遊戲"
              width={308}
              height={28}
              priority
              className="
                w-[120px]
                sm:w-[160px]
                md:w-[220px]
                lg:w-[308px]
                h-auto
              "
            />
          </motion.div>
        </div>
        

        {/* ==================== 全白轉場 ==================== */}
        <motion.div
          className="absolute inset-0 z-50 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={
            isTransitioning
              ? { opacity: 1 }
              : { opacity: 0 }
          }
          transition={{
            delay: 1.2,
            duration: 1.0,
            ease: "linear",
          }}
        />
    </main>
  );
}