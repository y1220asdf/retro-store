"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


import React from 'react';

export default function ScaleGame() {
  const router = useRouter();
  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ 
        // 1. 這裡放你的柑仔店背景圖路徑
        backgroundImage: "url('/images/scale_1.webp')" 
      }}
    >
      {/* 頂部文字提示區（如：請量出540克紅豆） */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-amber-50 border-2 border-amber-800 px-6 py-2 rounded-md shadow-md z-10 text-center">
        <h2 className="text-xl font-bold text-amber-900">目標：請量出 540 克紅豆</h2>
      </div>

      {/* 遊戲主操作區：所有道具都在這裡面進行絕對定位 */}
      <div className="w-full h-full relative">
        
        {/* 2. 放置天秤圖片（置中在畫面中下方偏櫃檯的位置） */}
        <img 
          // 這裡假設你的天秤圖片叫做 balance.png，一樣放在 images 資料夾下
          src="/images/scale_balance.webp" 
          alt="天秤"
          className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 w-[350px] h-auto object-contain select-none"
        />

        {/* ⬅ 返回主導覽按鈕 */}
        <button
            onClick={() => router.push('/main')}
            className="absolute top-4 left-4 z-20 flex items-center justify-center rounded-full border border-amber-900/40 bg-amber-50/90 px-4 py-2 text-sm font-bold text-amber-900 backdrop-blur-sm transition-all hover:bg-amber-100 active:scale-95 shadow-md"
          >
          ⬅ 返回柑仔店
        </button>
      
      </div>
    </div>
  );
}