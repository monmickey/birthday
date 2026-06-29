"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBackspace } from "react-icons/fa";

interface PasscodeScreenProps {
  recipientName: string;
  correctCode: string;
  onSuccess: () => void;
  playSfx: (type: "click" | "giftOpen") => void;
}

export default function PasscodeScreen({
  recipientName,
  correctCode,
  onSuccess,
  playSfx,
}: PasscodeScreenProps) {
  const [code, setCode] = useState<string[]>([]);
  const [isError, setIsError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (code.length >= 4) return;
    playSfx("click");
    const newCode = [...code, num];
    setCode(newCode);

    if (newCode.length === 4) {
      const codeString = newCode.join("");
      if (codeString === correctCode) {
        setTimeout(() => {
          playSfx("giftOpen");
          onSuccess();
        }, 300);
      } else {
        setTimeout(() => {
          setIsError(true);
          playSfx("click");
          setTimeout(() => {
            setIsError(false);
            setCode([]);
          }, 800);
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (code.length === 0) return;
    playSfx("click");
    setCode((prev) => prev.slice(0, -1));
  };

  // SVG Balloon Sticker
  const BalloonSticker = () => (
    <div className="w-24 h-24 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] animate-float-slow select-none pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* White outline for sticker look */}
        <circle cx="50" cy="50" r="44" fill="white" />
        {/* Balloons */}
        <ellipse cx="40" cy="40" rx="12" ry="16" fill="#f43f5e" />
        <ellipse cx="60" cy="42" rx="11" ry="15" fill="#3b82f6" />
        <ellipse cx="46" cy="56" rx="12" ry="16" fill="#10b981" />
        <ellipse cx="58" cy="58" rx="10" ry="14" fill="#f59e0b" />
        {/* Strings */}
        <path d="M40,56 Q45,75 50,85" stroke="#ccc" strokeWidth="2" fill="none" />
        <path d="M60,57 Q55,75 50,85" stroke="#ccc" strokeWidth="2" fill="none" />
        <path d="M46,72 Q48,80 50,85" stroke="#ccc" strokeWidth="2" fill="none" />
        {/* Knot */}
        <polygon points="48,83 52,83 50,87" fill="#888" />
      </svg>
    </div>
  );

  // SVG Party Hat Sticker
  const PartyHatSticker = () => (
    <div className="w-20 h-20 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] animate-float-medium select-none pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,5 92,85 8,85" fill="white" stroke="white" strokeWidth="6" strokeLinejoin="round" />
        {/* Stripes */}
        <polygon points="50,8 90,82 10,82" fill="#ec4899" />
        <path d="M25,50 L75,50 L68,62 L32,62 Z" fill="#fbbf24" />
        <path d="M35,30 L65,30 L58,42 L42,42 Z" fill="#10b981" />
        <path d="M15,70 L85,70 L78,82 L22,82 Z" fill="#3b82f6" />
        {/* Pom pom */}
        <circle cx="50" cy="8" r="8" fill="#fbcfe8" />
        <circle cx="50" cy="8" r="5" fill="#f472b6" />
      </svg>
    </div>
  );

  // SVG Cake Slice Sticker
  const CakeSticker = () => (
    <div className="w-20 h-20 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] animate-float-fast select-none pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path d="M10,80 L90,80 L75,40 L25,40 Z" fill="white" stroke="white" strokeWidth="6" strokeLinejoin="round" />
        {/* Cake Layers */}
        <path d="M15,78 L85,78 L78,60 L22,60 Z" fill="#db2777" />
        <path d="M22,60 L78,60 L74,48 L26,48 Z" fill="#fdf2f8" />
        <path d="M26,48 L74,48 L70,38 L30,38 Z" fill="#f472b6" />
        {/* Frosting Drips */}
        <path d="M30,38 Q50,45 70,38 L68,36 Q50,30 32,36 Z" fill="#db2777" />
        {/* Strawberry on top */}
        <path d="M50,22 Q56,22 53,32 Q47,32 47,26 Z" fill="#ef4444" />
      </svg>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e0f2fe] overflow-hidden p-4">
      {/* Drifting Clouds Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[-10%] text-9xl text-white/50 animate-drift-cloud" style={{ animationDuration: "60s" }}>☁️</div>
        <div className="absolute top-[50%] left-[-20%] text-8xl text-white/40 animate-drift-cloud" style={{ animationDuration: "80s", animationDelay: "-30s" }}>☁️</div>
      </div>

      {/* Symmetrical Floating Decal Stickers */}
      <div className="absolute left-[8%] top-[15%] z-10 hidden sm:block">
        <BalloonSticker />
      </div>
      <div className="absolute left-[10%] bottom-[12%] z-10 hidden sm:block">
        <PartyHatSticker />
      </div>
      <div className="absolute right-[8%] top-[25%] z-10 hidden sm:block">
        <CakeSticker />
      </div>

      {/* Main Passcode Verification Panel */}
      <motion.div
        animate={isError ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white/40 z-20 flex flex-col items-center"
      >
        {/* Bubbly "HAPPY BIRTHDAY!" title */}
        <h2 className="text-xl md:text-2xl font-black tracking-widest text-center flex gap-1 mb-6 font-mono select-none">
          <span className="text-pink-500">H</span>
          <span className="text-green-500">A</span>
          <span className="text-orange-500">P</span>
          <span className="text-blue-500">P</span>
          <span className="text-yellow-500">Y</span>
          <span className="text-purple-500 ml-2">B</span>
          <span className="text-emerald-500">I</span>
          <span className="text-rose-500">R</span>
          <span className="text-sky-500">T</span>
          <span className="text-amber-500">H</span>
          <span className="text-teal-500">D</span>
          <span className="text-indigo-500">A</span>
          <span className="text-pink-500">Y</span>
          <span className="text-purple-500">!</span>
        </h2>

        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 mb-1.5">
          A Little Surprise Awaits
        </span>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight font-serif mb-2">
          For {recipientName}
        </h1>

        <p className="text-xs text-slate-500 font-bold tracking-wide mb-5">
          Enter the secret code to open it.
        </p>

        {/* Secret Key Message Hint */}
        <div className="bg-sky-500/10 border border-sky-200/40 rounded-full px-5 py-2 flex items-center gap-2 mb-8 select-none">
          <span className="text-xs">🔑</span>
          <span className="text-[10px] md:text-xs font-bold text-sky-700 tracking-wide">
            The day this story secretly started ❤️
          </span>
        </div>

        {/* Enter Code Dot Indicators */}
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                isError
                  ? "bg-red-500 scale-110"
                  : code.length > idx
                  ? "bg-sky-500 scale-110"
                  : "bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* 3x4 Keypad Panel */}
        <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full max-w-[260px] justify-center text-center">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-14 h-14 rounded-full bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 text-slate-800 font-bold text-lg flex items-center justify-center transition-all cursor-pointer select-none font-mono"
            >
              {num}
            </button>
          ))}

          {/* Row 4 */}
          <div className="w-14 h-14" /> {/* Spacer */}
          <button
            onClick={() => handleKeyPress("0")}
            className="w-14 h-14 rounded-full bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 text-slate-800 font-bold text-lg flex items-center justify-center transition-all cursor-pointer select-none font-mono"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-14 h-14 rounded-full bg-red-50 hover:bg-red-100 text-red-500 font-bold text-lg flex items-center justify-center transition-all cursor-pointer select-none"
            aria-label="Delete"
          >
            <FaBackspace size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
