"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type StoryStep = {
  type: "image" | "text" | "flash";
  duration: number;
  src?: string;
  text?: string;
};

const storySteps: StoryStep[] = [
  // 柑仔店空景
  { type: "image", src: "/images/end.webp", duration: 1800 },

  // 主角個別操作機關畫面：一般節奏，不特別變短
  { type: "image", src: "/images/end1.1.webp", duration: 1300 },
  { type: "image", src: "/images/end1.2.webp", duration: 1300 },
  { type: "image", src: "/images/end1.3.webp", duration: 1300 },
  { type: "image", src: "/images/end1.4.webp", duration: 1300 },
  { type: "image", src: "/images/end1.5.webp", duration: 1600 },

  // 黑幕打字機
  {
    type: "text",
    text: "恭喜你找到所有阿公的回憶碎片",
    duration: 5200,
  },

  // 桌面上的回憶碎片從近到遠
  { type: "image", src: "/images/end3.1.webp", duration: 700 },
  { type: "image", src: "/images/end3.2.webp", duration: 700 },
  { type: "image", src: "/images/end3.3.webp", duration: 1500 },

  // 主角走出柑仔店
  { type: "image", src: "/images/end4.1.webp", duration: 650 },
  { type: "image", src: "/images/end4.2.webp", duration: 1400 },

  // 阿公走出主畫面
  { type: "image", src: "/images/end5.1.webp", duration: 650 },
  { type: "image", src: "/images/end5.2.webp", duration: 650 },
  { type: "image", src: "/images/end5.3.webp", duration: 1400 },

  // 兩人相擁
  { type: "image", src: "/images/end6.webp", duration: 2600 },

  // 白幕喀擦效果，暫時不使用音效
  { type: "flash", duration: 350 },

  // 照片效果
  { type: "image", src: "/images/end7.1.webp", duration: 1800 },
  { type: "image", src: "/images/end7.2.webp", duration: 2400 },

  // 最終結局圖，停在這裡
  { type: "image", src: "/images/end8.webp", duration: 999999 },
];

const uniqueSrcs = [
  ...new Set(
    storySteps
      .filter((step) => step.type === "image" && step.src)
      .map((step) => step.src as string)
  ),
];

const finalStepIndex = storySteps.length - 1;
const finalImageSrc = "/images/end8.webp";

function getFadeDuration(step: StoryStep | undefined) {
  if (!step) return 800;
  if (step.type === "text") return 800;
  if (step.type === "flash") return 0;
  if (step.duration <= 500) return 80;
  if (step.duration <= 1200) return 250;
  return 600;
}

export default function Ending() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [prevSrc, setPrevSrc] = useState<string | undefined>(undefined);
  const [typedText, setTypedText] = useState("");

  const currentStep = storySteps[step] ?? storySteps[finalStepIndex];
  const currentSrc =
    currentStep.type === "image" ? currentStep.src : undefined;

  const isText = currentStep.type === "text";
  const isFlash = currentStep.type === "flash";
  const fadeDuration = getFadeDuration(currentStep);

  const isFinalImage =
    step === finalStepIndex &&
    currentStep.type === "image" &&
    currentStep.src === finalImageSrc;

  // 主計時器
  useEffect(() => {
    if (step >= finalStepIndex) return;

    const timer = setTimeout(() => {
      const leavingStep = storySteps[step];

      if (leavingStep.type === "image" && leavingStep.src) {
        setPrevSrc(leavingStep.src);
      }

      setStep((current) => Math.min(current + 1, finalStepIndex));
    }, currentStep.duration);

    return () => clearTimeout(timer);
  }, [step, currentStep.duration]);

  // 打字機效果
  useEffect(() => {
    const current = storySteps[step];

    if (current.type !== "text" || !current.text) return;

    const fullText = current.text;
    let index = 0;

    setTypedText("");

    const typingTimer = setInterval(() => {
      index += 1;
      setTypedText(fullText.slice(0, index));

      if (index >= fullText.length) {
        clearInterval(typingTimer);
      }
    }, 130);

    return () => clearInterval(typingTimer);
  }, [step]);

  // 跳過動畫，直接到最後一張
  const handleSkip = () => {
    const leavingStep = storySteps[step];

    if (leavingStep.type === "image" && leavingStep.src) {
      setPrevSrc(leavingStep.src);
    }

    setStep(finalStepIndex);
  };

  // 重新開始，回到首頁 page.tsx
  const handleRestart = () => {
    router.push("/");
  };

  return (
    <main className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black">
      {/* 圖片層：沿用 intro 的 cross-dissolve 邏輯 */}
      {uniqueSrcs.map((src) => {
        const isCurrent = !isText && !isFlash && currentSrc === src;
        const isPrev =
          !isText && !isFlash && prevSrc === src && currentSrc !== src;

        let opacity = 0;
        let zIndex = 0;
        let transition = "none";

        if (isCurrent) {
          opacity = 1;
          zIndex = 2;
          transition = `opacity ${fadeDuration}ms ease-in-out`;
        } else if (isPrev) {
          opacity = 1;
          zIndex = 1;
          transition = "none";
        }

        return (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              opacity,
              zIndex,
              transition,
              willChange: "opacity",
            }}
            priority={src === "/images/end.webp" || src === finalImageSrc}
          />
        );
      })}

      {/* 黑幕文字 */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center bg-black"
        style={{
          opacity: isText ? 1 : 0,
          transition: "opacity 800ms ease-in-out",
          pointerEvents: isText ? "auto" : "none",
        }}
      >
        <div className="pointer-events-none absolute inset-0 z-10 film-grain opacity-40" />
        <div className="pointer-events-none absolute inset-0 z-10 film-flicker" />
        <div className="pointer-events-none absolute left-[8%] top-0 z-10 h-full w-[2px] bg-white/10" />
        <div className="pointer-events-none absolute right-[12%] top-0 z-10 h-full w-[1px] bg-white/10" />

        <div className="relative z-30 whitespace-pre-line px-8 text-center font-serif text-3xl leading-[2.1] tracking-[0.25em] text-white md:text-4xl">
          {typedText}
          <span className="ml-1 animate-pulse">|</span>
        </div>
      </div>

      {/* 白幕拍照 flash，無音效版 */}
      {isFlash && (
        <div className="pointer-events-none absolute inset-0 z-30 flash-screen" />
      )}

      {/* 最終 end8 上的透明重新開始按鈕 */}
      {isFinalImage && (
        <button
          onClick={handleRestart}
          title="重新開始"
          aria-label="重新開始"
          className="absolute left-1/2 top-[54%] z-50 h-[62px] w-[170px] -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-transparent md:h-[76px] md:w-[210px]"
        />
      )}

      {/* 跳過按鈕 */}
      <button
        onClick={handleSkip}
        className={`absolute bottom-10 right-10 z-50 rounded-full border border-white/40 bg-black/30 px-6 py-2 text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white ${
          isFinalImage ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        跳過動畫
      </button>

      <style jsx>{`
        .film-grain {
          background-image:
            radial-gradient(
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

        .flash-screen {
          background: white;
          animation: cameraFlash 350ms ease-out forwards;
        }

        @keyframes cameraFlash {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          35% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}