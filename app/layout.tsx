import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// 引入音樂播放器組件
import AudioPlayer from "../components/AudioPlayer";

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
      <body className="min-h-full flex flex-col">
        {/* 🔊 音樂播放器必須乖乖待在 body 裡面，且不可以在它自己的檔案裡寫 html/body */}
        <AudioPlayer />
        
        {/* 遊戲的實際頁面內容 */}
        {children}
      </body>
    </html>
  );
}