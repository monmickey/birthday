"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface BirthdayCakeProps {
  playSfx: (type: "confetti" | "click") => void;
  onCakeComplete?: () => void;
}

interface Candle {
  id: number;
  x: string;
  delay: string;
  blown: boolean;
}

export default function BirthdayCake({ playSfx, onCakeComplete }: BirthdayCakeProps) {
  const [isAllBlown, setIsAllBlown] = useState(false);
  const [candles, setCandles] = useState<Candle[]>([
    { id: 1, x: "25%", delay: "0s", blown: false },
    { id: 2, x: "37%", delay: "0.2s", blown: false },
    { id: 3, x: "50%", delay: "0.4s", blown: false },
    { id: 4, x: "63%", delay: "0.1s", blown: false },
    { id: 5, x: "75%", delay: "0.3s", blown: false },
  ]);

  const handleCandleClick = (id: number) => {
    // Modify the candle state to blown
    setCandles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, blown: true } : c))
    );
    playSfx("click");

    // Single candle pop confetti
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.6 },
    });
  };

  useEffect(() => {
    const allBlown = candles.every((c) => c.blown);
    if (allBlown && candles.length > 0 && !isAllBlown) {
      setIsAllBlown(true);
      playSfx("confetti");

      // Blast main cake celebration confetti
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#a855f7", "#ec4899", "#3b82f6", "#fbbf24"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      if (onCakeComplete) {
        setTimeout(onCakeComplete, 2000);
      }
    }
  }, [candles, isAllBlown, playSfx, onCakeComplete]);

  const handleReset = () => {
    setCandles((prev) => prev.map((c) => ({ ...c, blown: false })));
    setIsAllBlown(false);
  };

  return (
    <section className="py-24 relative z-10 px-4 max-w-4xl mx-auto text-center">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 glow-spot-purple opacity-25 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          🕯️ Make a Wish
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-white">
          The Virtual Birthday Cake
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-md mx-auto">
          Click on each candle to blow them out and make a silent wish.
        </p>
      </motion.div>

      {/* Isometric Cake Display */}
      <div className="glass-panel max-w-md w-full mx-auto rounded-3xl p-8 shadow-2xl border border-white/10 flex flex-col items-center select-none relative z-10">
        
        {/* Cake Container */}
        <div className="relative w-64 h-64 mb-8 flex items-end justify-center">
          
          {/* Interactive Candles layer */}
          <div className="absolute top-6 left-0 right-0 h-16 z-20">
            {candles.map((candle) => (
              <div
                key={candle.id}
                onClick={() => !candle.blown && handleCandleClick(candle.id)}
                className={`absolute bottom-0 w-3 h-12 bg-gradient-to-t from-pink-500 via-purple-500 to-indigo-500 rounded-full cursor-pointer hover:scale-110 active:scale-95 transition-transform ${
                  candle.blown ? "cursor-default" : ""
                }`}
                style={{ left: candle.x }}
              >
                {/* Flame or Smoke */}
                <AnimatePresence>
                  {!candle.blown ? (
                    <motion.div
                      key="flame"
                      initial={{ scale: 0, y: 5 }}
                      animate={{
                        scale: [1, 1.15, 1],
                        y: 0,
                        rotate: [0, -4, 4, 0],
                      }}
                      exit={{ scale: 0 }}
                      transition={{
                        rotate: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                        scale: { repeat: Infinity, duration: 0.9, ease: "easeInOut" },
                      }}
                      className="absolute -top-5 left-1/2 -translate-x-1/2 w-4 h-6 rounded-full bg-gradient-to-t from-yellow-200 via-amber-500 to-red-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] origin-bottom"
                      style={{ animationDelay: candle.delay }}
                    >
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-3.5 rounded-full bg-white opacity-80" />
                    </motion.div>
                  ) : (
                    // Smoke Animation
                    <motion.div
                      key="smoke"
                      initial={{ opacity: 0.8, y: -5, scale: 0.8 }}
                      animate={{
                        opacity: 0,
                        y: -40,
                        x: [0, -10, 5, -5],
                        scale: 1.8,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white/20 blur-[1px] flex items-center justify-center pointer-events-none"
                    />
                  )}
                </AnimatePresence>

                {/* Candle wick */}
                <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[2px] h-1.5 bg-neutral-800" />
              </div>
            ))}
          </div>

          {/* Cake SVG Structure */}
          <svg
            viewBox="0 0 200 160"
            className="w-full h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
          >
            {/* Cake Base Stand */}
            <ellipse cx="100" cy="140" rx="90" ry="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path d="M 10,140 L 10,146 A 90 12 0 0 0 190 146 L 190,140 Z" fill="rgba(255,255,255,0.03)" />

            {/* Bottom Tier */}
            <path d="M 25,100 L 25,125 A 75 14 0 0 0 175 125 L 175,100 Z" fill="#2d150b" />
            <ellipse cx="100" cy="100" rx="75" ry="14" fill="#3d1e11" />
            
            {/* Frosting Drips Bottom */}
            <path d="M 25,100 Q 30,110 35,100 Q 40,115 45,100 Q 55,120 65,100 Q 75,105 85,100 Q 100,118 115,100 Q 130,105 140,100 Q 150,115 160,100 Q 170,108 175,100 A 75 14 0 0 1 25,100 Z" fill="#a855f7" opacity="0.85" />

            {/* Top Tier */}
            <path d="M 45,65 L 45,90 A 55 11 0 0 0 155 90 L 155,65 Z" fill="#db2777" />
            <ellipse cx="100" cy="65" rx="55" ry="11" fill="#ec4899" />

            {/* Frosting Drips Top */}
            <path d="M 45,65 Q 50,75 55,65 Q 65,80 75,65 Q 85,72 95,65 Q 105,78 115,65 Q 125,72 135,65 Q 145,78 155,65 A 55 11 0 0 1 45,65 Z" fill="#ffffff" opacity="0.9" />

            {/* Small decorative sprinkles/berries on top */}
            <circle cx="70" cy="63" r="3" fill="#a855f7" />
            <circle cx="85" cy="67" r="3" fill="#fbbf24" />
            <circle cx="100" cy="68" r="3.5" fill="#ef4444" />
            <circle cx="115" cy="67" r="3" fill="#3b82f6" />
            <circle cx="130" cy="63" r="3" fill="#10b981" />
          </svg>

          {/* Sparkles Overlay */}
          {!isAllBlown && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 text-yellow-300 animate-pulse text-sm">✨</div>
              <div className="absolute top-1/3 right-1/4 text-pink-300 animate-pulse text-xs" style={{ animationDelay: "0.5s" }}>✨</div>
              <div className="absolute bottom-1/3 left-1/3 text-purple-300 animate-pulse text-sm" style={{ animationDelay: "1s" }}>✨</div>
            </div>
          )}
        </div>

        {/* Reset Action Button */}
        {isAllBlown && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleReset}
            className="px-6 py-2.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs tracking-wider transition-all cursor-pointer"
          >
            🕯️ Relight Candles
          </motion.button>
        )}
      </div>
    </section>
  );
}
