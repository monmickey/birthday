"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface CakeSliceProps {
  playSfx: (type: "confetti" | "click") => void;
  onSliceComplete: () => void;
}

export default function CakeSlice({ playSfx, onSliceComplete }: CakeSliceProps) {
  const [sliceProgress, setSliceProgress] = useState(0);
  const [isCut, setIsCut] = useState(false);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCut) return;
    const value = parseInt(e.target.value);
    setSliceProgress(value);

    if (value >= 95) {
      setIsCut(true);
      playSfx("confetti");
      
      // Major confetti celebration burst
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#ec4899", "#f43f5e", "#ffedd5", "#fbcfe8"],
      });

      setTimeout(() => {
        onSliceComplete();
      }, 2000);
    }
  };

  return (
    <section className="py-24 relative z-10 px-4 max-w-4xl mx-auto text-center flex flex-col items-center select-none">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 glow-spot-purple opacity-20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="mb-12">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 block mb-2">
          A Sweet Little Ritual
        </span>
        <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800">
          Cut the cake
        </h2>
      </div>

      {/* Cake Vector Display */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-10">
        <AnimatePresence mode="wait">
          {!isCut ? (
            /* Solid Cake */
            <motion.div
              key="solid-cake"
              className="relative w-48 h-48 flex items-center justify-center"
            >
              <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
                {/* Cake plate stand */}
                <ellipse cx="80" cy="120" rx="70" ry="12" fill="#e2e8f0" stroke="white" strokeWidth="3" />
                
                {/* Red/Strawberry Cake Layer Base */}
                <path d="M25,85 L25,110 A55 11 0 0 0 135,110 L135,85 Z" fill="#e11d48" />
                <ellipse cx="80" cy="85" rx="55" ry="11" fill="#f43f5e" />

                {/* White whipped frosting top layer */}
                <path d="M35,62 L35,80 A45 9 0 0 0 125,80 L125,62 Z" fill="#fdf2f8" />
                <ellipse cx="80" cy="62" rx="45" ry="9" fill="white" />

                {/* Whipped frosting drips */}
                <path d="M35,62 Q45,74 55,62 Q65,72 75,62 Q85,74 95,62 Q105,72 115,62 Q125,72 125,62 A45 9 0 0 1 35,62 Z" fill="#db2777" opacity="0.8" />

                {/* Green mint leaves and decorative sticks on top */}
                <circle cx="80" cy="58" r="6" fill="#10b981" />
                <circle cx="68" cy="58" r="4.5" fill="#f43f5e" />
                <circle cx="92" cy="58" r="4.5" fill="#f43f5e" />
                {/* Chocolate sticks */}
                <rect x="74" y="38" width="4" height="20" rx="1" fill="#451a03" transform="rotate(-15 76 48)" />
                <rect x="82" y="38" width="4" height="20" rx="1" fill="#451a03" transform="rotate(15 84 48)" />
              </svg>

              {/* Dotted cut line guide */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: "rotate(-25deg)" }}
              >
                <div className="w-[180px] border-b-2 border-dashed border-sky-400 opacity-60" />
              </div>
            </motion.div>
          ) : (
            /* Split/Cut Cake Slices */
            <motion.div
              key="cut-cake"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-48 h-48 flex items-center justify-center"
            >
              {/* Slice Left */}
              <motion.div
                animate={{ x: -25, y: -5, rotate: -5 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="absolute w-24 h-48 left-0 flex items-center justify-end"
              >
                <svg viewBox="0 0 80 160" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]">
                  <path d="M80,120 L10,120 A70 12 0 0 1 80,108" fill="#e2e8f0" stroke="white" strokeWidth="3" />
                  <path d="M80,85 L25,85 L25,110 A55 11 0 0 0 80,121" fill="#e11d48" />
                  <path d="M80,85 A55 11 0 0 0 25,85 Z" fill="#f43f5e" />
                  <path d="M80,62 L35,62 L35,80 A45 9 0 0 0 80,89" fill="#fdf2f8" />
                  <path d="M80,62 A45 9 0 0 0 35,62 Z" fill="white" />
                  <path d="M35,62 Q45,74 55,62 Q65,72 75,62 L80,62 L80,62 A45 9 0 0 1 35,62 Z" fill="#db2777" opacity="0.8" />
                  <circle cx="68" cy="58" r="4.5" fill="#f43f5e" />
                </svg>
              </motion.div>

              {/* Slice Right */}
              <motion.div
                animate={{ x: 25, y: 5, rotate: 5 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="absolute w-24 h-48 right-0 flex items-center justify-start"
              >
                <svg viewBox="80 0 80 160" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.06)]">
                  <path d="M80,108 A70 12 0 0 1 150,120 L80,120" fill="#e2e8f0" stroke="white" strokeWidth="3" />
                  <path d="M80,121 A55 11 0 0 0 135,110 L135,85 L80,85" fill="#e11d48" />
                  <path d="M135,85 A55 11 0 0 0 80,85 Z" fill="#f43f5e" />
                  <path d="M80,89 A45 9 0 0 0 125,80 L125,62 L80,62" fill="#fdf2f8" />
                  <path d="M125,62 A45 9 0 0 0 80,62 Z" fill="white" />
                  <path d="M80,62 L85,62 Q95,74 105,62 Q115,72 125,62 A45 9 0 0 1 80,62 Z" fill="#db2777" opacity="0.8" />
                  <circle cx="80" cy="58" r="6" fill="#10b981" />
                  <circle cx="92" cy="58" r="4.5" fill="#f43f5e" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Slicing Track / Knife Drag Slider */}
      <div className="w-full max-w-xs relative flex flex-col items-center gap-3">
        <div className="w-full h-8 bg-sky-500/10 border border-sky-200/50 rounded-full flex items-center px-2 relative">
          
          {/* Draggable Knife Slider Track input */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliceProgress}
            onChange={handleSliderChange}
            disabled={isCut}
            className="w-full h-full opacity-0 absolute inset-0 cursor-ew-resize z-20"
          />

          {/* Slicing Progress filled color */}
          <div 
            className="h-4 bg-sky-500 rounded-full transition-all duration-100 opacity-60"
            style={{ width: `${sliceProgress}%` }}
          />

          {/* Draggable Knife emoji pointer thumb position */}
          <div
            className="absolute z-10 text-2xl transition-all duration-100 select-none pointer-events-none"
            style={{ left: `calc(${sliceProgress}% - 14px)` }}
          >
            🔪
          </div>
        </div>

        {/* Drag Helper Guide */}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-1 select-none">
          🔪 Drag across the cake to slice it
        </span>
      </div>
    </section>
  );
}
