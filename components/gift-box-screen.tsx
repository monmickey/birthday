"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface GiftBoxScreenProps {
  onOpen: () => void;
  playSfx: (type: "giftOpen" | "confetti" | "click") => void;
  playMusic: () => void;
}

export default function GiftBoxScreen({ onOpen, playSfx, playMusic }: GiftBoxScreenProps) {
  const [boxState, setBoxState] = useState<"idle" | "shaking" | "open">("idle");

  const handleBoxClick = () => {
    if (boxState !== "idle") return;

    // Start Shaking
    setBoxState("shaking");
    playSfx("click");

    setTimeout(() => {
      // Open the box
      setBoxState("open");
      playSfx("giftOpen");
      playSfx("confetti");
      playMusic();

      // Launch Confetti Explosion
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#a855f7", "#ec4899", "#3b82f6"],
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#a855f7", "#ec4899", "#3b82f6"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Proceed to gallery after explosion
      setTimeout(() => {
        onOpen();
      }, 2500);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Sparkles background */}
      <div className="absolute top-[35%] w-80 h-80 rounded-full glow-spot-purple opacity-30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center select-none"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 mb-8">
          🎁 Tap to Open
        </span>

        <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2">
          Your Surprise is Ready!
        </h2>
        <p className="text-white/60 text-sm mb-12 max-w-xs">
          Click the box below to reveal what has been made for you.
        </p>

        {/* Gift Box Container */}
        <div className="relative w-64 h-64 flex items-center justify-center cursor-pointer">
          <motion.div
            onClick={handleBoxClick}
            animate={
              boxState === "shaking"
                ? {
                    x: [0, -10, 10, -10, 10, -8, 8, -5, 5, 0],
                    y: [0, -5, 5, -5, 5, -3, 3, -2, 2, 0],
                    rotate: [0, -3, 3, -3, 3, -2, 2, -1, 1, 0],
                  }
                : boxState === "open"
                ? { scale: [1, 1.1, 0.9, 1] }
                : { y: [0, -8, 0] }
            }
            transition={
              boxState === "shaking"
                ? { duration: 1.2, ease: "easeInOut" }
                : boxState === "open"
                ? { duration: 0.6 }
                : { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }
            whileHover={boxState === "idle" ? { scale: 1.05 } : {}}
            className="relative w-48 h-48 flex flex-col items-center justify-end"
          >
            {/* Box Lid */}
            <motion.div
              animate={
                boxState === "open"
                  ? { y: -80, rotate: -15, opacity: 0, scale: 0.8 }
                  : {}
              }
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-10 w-52 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg shadow-md z-30 flex items-center justify-center"
            >
              {/* Lid Ribbon Horizontal */}
              <div className="absolute top-0 bottom-0 left-[45%] right-[45%] bg-amber-400 shadow-sm" />
              {/* Lid Ribbon Bow */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-12 h-8 flex justify-center z-40">
                <div className="w-6 h-6 border-4 border-amber-400 rounded-full transform -rotate-45 -mr-1" />
                <div className="w-6 h-6 border-4 border-amber-400 rounded-full transform rotate-45 -ml-1" />
              </div>
            </motion.div>

            {/* Box Body */}
            <div className="w-48 h-36 bg-gradient-to-r from-rose-600 to-pink-600 rounded-b-xl shadow-2xl relative z-20 overflow-hidden">
              {/* Body Ribbon Vertical */}
              <div className="absolute top-0 bottom-0 left-[45%] right-[45%] bg-amber-400" />
              
              {/* Inside Glow on Open */}
              <AnimatePresence>
                {boxState === "open" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    className="absolute inset-0 bg-yellow-300/40 mix-blend-screen filter blur-md"
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Shadow beneath box */}
            <div className="absolute -bottom-2 w-40 h-4 bg-black/40 rounded-full filter blur-sm z-10" />
          </motion.div>

          {/* Sparkles Overlay */}
          {boxState === "idle" && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-2 left-6 text-yellow-300 animate-pulse text-sm">✨</span>
              <span className="absolute top-8 right-6 text-pink-300 animate-pulse text-xs" style={{ animationDelay: "0.5s" }}>✨</span>
              <span className="absolute bottom-6 left-8 text-purple-300 animate-pulse text-sm" style={{ animationDelay: "1s" }}>✨</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
