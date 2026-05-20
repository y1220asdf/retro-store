import Link from 'next/link';

export default function Home() {
  return (
    // 使用 Tailwind CSS 設定全螢幕背景
    <main
      className="relative flex h-screen w-screen flex-col items-center justify-center bg-black"
      style={{
        backgroundImage: "url('/images/start-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 這是一個透明的點擊區域 (Link)
        href="/main" 代表點擊後會前往「遊戲主畫面」
        我把它設定在畫面偏下方的位置，大小剛好可以覆蓋你圖片上的木牌按鈕
      */}
      <Link
        href="/main"
        className="absolute top-[60%] h-24 w-80 cursor-pointer rounded-full transition-transform hover:scale-105 active:scale-95"
        title="開始遊戲"
      >
        <span className="sr-only">開始遊戲</span>
      </Link>
    </main>
  );
}