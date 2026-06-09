import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 引入音樂播放器組件
import AudioPlayer from "../components/AudioPlayer";
// 引入手機翻轉提示組件
import OrientationPrompt from "../components/OrientationPrompt";
// 引入剛剛做好的全螢幕按鈕組件
import FullscreenButton from "../components/FullscreenButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "時光柑仔店",
  description: "網頁期中專案 - 第七組解謎網頁遊戲",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-hidden bg-zinc-950">
        
        {/* 📱 全局手機翻轉提示 (只在直向手機螢幕顯示，會蓋在最上層) */}
        <OrientationPrompt />

        {/* 🔊 音樂播放器 */}
        <AudioPlayer />

        {/* 🖥️ 全局全螢幕控制按鈕 */}
        <FullscreenButton />
        
        {/* 遊戲的實際頁面內容 */}
        {children}
        
      </body>
    </html>
  );
}