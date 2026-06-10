import Link from "next/link";

export default function Home() {
  return (
    <main
      className="relative h-screen w-screen overflow-hidden bg-black"
      style={{
        backgroundImage: "url('/images/start.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link
        href="/intro"
        title="開始遊戲"
        className="
          group
          absolute
          left-[50.2%]
          top-[50.5%]
          -translate-x-1/2
          w-[300px]
          h-[420px]
          cursor-pointer
          rounded-xl
          overflow-hidden
          transition-transform
          duration-300
          hover:scale-[1.02]
          active:scale-95
        "
      >
        {/* 門框四邊透光 */}
        <div className="absolute left-0 top-0 h-full w-2 bg-amber-200/20 blur-md animate-pulse" />
        <div className="absolute right-0 top-0 h-full w-2 bg-amber-200/20 blur-md animate-pulse" />
        <div className="absolute left-0 top-0 h-2 w-full bg-amber-200/18 blur-md animate-pulse" />
        <div className="absolute left-0 bottom-0 h-2 w-full bg-amber-200/14 blur-md animate-pulse" />

        {/* hover 才出現薄薄毛玻璃 */}
        <div
          className="
            absolute
            inset-0
            rounded-xl
            bg-white/0
            backdrop-blur-0
            transition-all
            duration-300
            group-hover:bg-white/8
            group-hover:backdrop-blur-[2px]
          "
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="
              px-8
              py-3
              rounded-full
              bg-amber-100/25
              backdrop-blur-md
              border
              border-amber-100/45
              text-white
              text-xl
              font-bold
              tracking-[0.25em]
              drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]
              shadow-[0_0_18px_rgba(255,210,130,0.5)]
              transition-all
              duration-300
              group-hover:bg-amber-100/35
              group-hover:shadow-[0_0_28px_rgba(255,220,150,0.85)]
            "
          >
            開始遊戲
          </div>
        </div>

        <span className="sr-only">開始遊戲</span>
      </Link>
    </main>
  );
}