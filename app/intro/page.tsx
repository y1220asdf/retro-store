"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type StoryStep = {
  type: string;
  duration: number;
  src?: string;
  text?: string;
};

const storySteps: StoryStep[] = [
  { type: "image", src: "/images/0.webp",   duration: 1600 },
  { type: "image", src: "/images/1.1.webp", duration: 750  },
  { type: "image", src: "/images/1.2.webp", duration: 750  },
  { type: "image", src: "/images/1.3.webp", duration: 950  },
  { type: "image", src: "/images/2.1.webp", duration: 950  },
  { type: "image", src: "/images/2.2.webp", duration: 950  },
  { type: "image", src: "/images/2.3.webp", duration: 1300 },
  { type: "image", src: "/images/3.1.webp", duration: 2600 },
  { type: "text",  text: "20年後......",          duration: 4000 },
  { type: "image", src: "/images/4.1.webp", duration: 2400 },
  { type: "image", src: "/images/4.2.webp", duration: 2400 },
  { type: "image", src: "/images/5.1.webp", duration: 2500 },
  { type: "image", src: "/images/6.1.webp", duration: 520  },
  { type: "image", src: "/images/6.2.webp", duration: 520  },
  { type: "image", src: "/images/6.3.webp", duration: 1100 },
  { type: "image", src: "/images/7.1.webp", duration: 2300 },
  { type: "image", src: "/images/8.1.webp", duration: 850  },
  { type: "image", src: "/images/8.2.webp", duration: 850  },
  { type: "image", src: "/images/8.3.webp", duration: 1300 },
  { type: "text",  text: "這時的你決定進入柑仔店一探究竟\n找回阿公的回憶碎片...", duration: 4300 },
];

const uniqueSrcs = [...new Set(
  storySteps
    .filter((s) => s.type === "image" && s.src)
    .map((s) => s.src as string)
)];

const finalStepIndex = storySteps.length - 1;

// ── crossfade 時間 ─────────────────────────────────────────
function getFadeDuration(s: StoryStep | undefined) {
  if (!s || s.type === "text") return 800;
  if (s.duration <= 500)  return 80;
  if (s.duration <= 1200) return 250;
  return 600;
}

export default function Intro() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prevSrc, setPrevSrc] = useState<string | undefined>(undefined);
  const [typedText, setTypedText] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  const currentStep = storySteps[step] ?? storySteps[finalStepIndex];
  const currentSrc  = currentStep?.type === "image" ? currentStep.src : undefined;
  const isText      = currentStep?.type === "text";
  const fadeDuration = getFadeDuration(currentStep);

  // ── 主計時器 ──────────────────────────────────────────────
  useEffect(() => {
    if (step >= storySteps.length) {
      setTransitioning(true);
      const t = setTimeout(() => router.push("/main"), 2200);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      // ✅ step 推進前同步記下當前圖為 prev，下一 render 兩層同時就位
      const leaving = storySteps[step];
      if (leaving?.type === "image" && leaving.src) {
        setPrevSrc(leaving.src);
      }
      setStep((s) => s + 1);
    }, currentStep.duration);

    return () => clearTimeout(t);
  }, [step, router]);

  // ── 打字機 ────────────────────────────────────────────────
  useEffect(() => {
    const s = storySteps[step];
    if (s?.type !== "text" || !s.text) return;

    const textToType = s.text;
    let i = 0;
    setTypedText("");

    const id = setInterval(() => {
      i++;
      setTypedText(textToType.slice(0, i));
      if (i >= textToType.length) clearInterval(id);
    }, 130);

    return () => clearInterval(id);
  }, [step]);

  const handleSkip = () => setStep(storySteps.length);

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-black overflow-hidden">

      {/*
        ── 圖片層：真正的 cross-dissolve ───────────────────────
        每張圖永遠 render，用 zIndex + opacity 控制：
          - currentSrc  → z:2, opacity:1（帶 transition 淡入）
          - prevSrc     → z:1, opacity:1（不帶 transition，原地墊住）
          - 其他        → z:0, opacity:0
        新圖淡入時，舊圖靜靜墊在下面，黑底永遠不會露出來。
      */}
      {uniqueSrcs.map((src) => {
        const isCurrent = !isText && !transitioning && currentSrc === src;
        const isPrev    = !isText && !transitioning && prevSrc === src && currentSrc !== src;

        let opacity = 0;
        let zIndex  = 0;
        let transition = "none";

        if (isCurrent) {
          opacity    = 1;
          zIndex     = 2;
          transition = `opacity ${fadeDuration}ms ease-in-out`;
        } else if (isPrev) {
          opacity    = 1;   // 靜止墊底，不加 transition
          zIndex     = 1;
          transition = "none";
        }

        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            className="object-cover"
            style={{ opacity, zIndex, transition, willChange: "opacity" }}
          />
        );
      })}

      {/* 文字黑幕 */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center bg-black"
        style={{
          opacity: isText && !transitioning ? 1 : 0,
          transition: "opacity 800ms ease-in-out",
          pointerEvents: isText && !transitioning ? "auto" : "none",
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-10 film-grain opacity-40" />
        <div className="pointer-events-none absolute inset-0 z-10 film-flicker" />
        <div className="pointer-events-none absolute left-[8%]  top-0 z-10 h-full w-[2px] bg-white/10" />
        <div className="pointer-events-none absolute right-[12%] top-0 z-10 h-full w-[1px] bg-white/10" />
        <div className="relative z-30 whitespace-pre-line text-center text-white text-3xl md:text-4xl leading-[2.1] tracking-[0.25em] font-serif">
          {typedText}
          <span className="ml-1 animate-pulse">|</span>
        </div>
      </div>

      {/* 進場轉場黑幕 */}
      <div
        className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black"
        style={{
          opacity: transitioning ? 1 : 0,
          transition: "opacity 800ms ease-in-out",
          pointerEvents: "none",
        }}
      >
        <p
          className="text-white/80 font-serif tracking-[0.3em] text-xl"
          style={{
            opacity: transitioning ? 1 : 0,
            transition: "opacity 600ms ease-in-out 600ms",
          }}
        >
          進入柑仔店...
        </p>
        <div
          className="mt-6 h-px bg-white/30"
          style={{
            width: transitioning ? "120px" : "0px",
            transition: "width 800ms ease-in-out 800ms",
          }}
        />
      </div>

      {/* 跳過按鈕 */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-10 right-10 z-50 rounded-full border border-white/40 bg-black/30 px-6 py-2 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white ${
          step >= finalStepIndex || transitioning ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        跳過動畫 ⏭
      </button>

      <style jsx>{`
        .film-grain {
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,.18) 0, transparent 1px),
            radial-gradient(circle at 70% 60%, rgba(255,255,255,.12) 0, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,.10) 0, transparent 1px);
          background-size: 90px 90px, 120px 120px, 70px 70px;
          animation: grainMove .35s steps(2) infinite;
        }
        @keyframes grainMove {
          0%   { transform: translate(0,0); }
          25%  { transform: translate(-2%,1%); }
          50%  { transform: translate(1%,-2%); }
          75%  { transform: translate(-1%,2%); }
          100% { transform: translate(0,0); }
        }
        .film-flicker {
          background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,.08) 50%, transparent 100%);
          mix-blend-mode: screen;
          animation: flicker 1.4s infinite;
        }
        @keyframes flicker {
          0%,100% { opacity:.12; }
          20%     { opacity:.28; }
          45%     { opacity:.08; }
          70%     { opacity:.22; }
        }
      `}</style>
    </main>
  );
}