"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface RecipientScreenProps {
  onNext: (name: string) => void;
  playClick: () => void;
}

export default function RecipientScreen({ onNext, playClick }: RecipientScreenProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    playClick();
    onNext(name.trim());
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[30%] w-80 h-80 rounded-full glow-spot-pink opacity-30 blur-3xl" />

      {/* Recipient Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="glass-panel max-w-md w-full rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 border border-white/10"
      >
        <span className="text-5xl mb-6 block select-none">💖</span>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
          Who's receiving this surprise?
        </h2>
        <p className="text-white/60 text-xs md:text-sm mb-8">
          Enter your name so we can load your personalized surprise card.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(false);
              }}
              className={`w-full px-6 py-4 rounded-2xl bg-white/5 border text-white placeholder-white/40 focus:outline-none transition-all duration-300 ${
                error
                  ? "border-red-500/50 focus:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  : "border-white/10 focus:border-primary focus:bg-white/10 shadow-[0_0_20px_rgba(168,85,247,0.1)] focus:shadow-[0_0_25px_rgba(168,85,247,0.25)]"
              } text-center font-semibold text-lg`}
            />
            {error && (
              <span className="text-red-400 text-xs font-semibold mt-1 block">
                Please enter a name to continue.
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold tracking-wider hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all cursor-pointer border border-white/10 ripple-btn text-base"
          >
            Continue 🚀
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
