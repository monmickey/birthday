"use client";

import React from "react";
import { motion } from "framer-motion";

interface LandingScreenProps {
  onNext: () => void;
  playClick: () => void;
}

export default function LandingScreen({ onNext, playClick }: LandingScreenProps) {
  const handleClick = () => {
    playClick();
    onNext();
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[20%] w-72 h-72 rounded-full glow-spot-purple opacity-40 blur-3xl" />

      {/* Landing Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="glass-panel max-w-lg w-full rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 border border-white/10"
      >
        {/* Pulsing floating gift illustration */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
          className="w-32 h-32 mx-auto mb-8 cursor-pointer relative"
          onClick={handleClick}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-50 blur-xl animate-pulse" />
          <div className="relative w-full h-full flex items-center justify-center text-6xl select-none">
            🎁
          </div>
        </motion.div>

        {/* Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
        >
          Someone made something <br />
          <span className="text-gradient-purple-pink relative drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            special for you ❤️
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-white/70 text-sm md:text-base font-medium tracking-wide mb-10 max-w-sm mx-auto"
        >
          You've received a custom surprise birthday experience.
        </motion.p>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold tracking-wider hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all cursor-pointer border border-white/10 ripple-btn text-base"
        >
          Open Surprise ✨
        </motion.button>
      </motion.div>
    </div>
  );
}
