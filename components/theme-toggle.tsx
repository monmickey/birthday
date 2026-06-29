"use client";

import React from "react";
import { FaSun, FaMoon } from "react-icons/fa";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  playSfx: (type: "click") => void;
}

export default function ThemeToggle({ isDark, onToggle, playSfx }: ThemeToggleProps) {
  const handleClick = () => {
    playSfx("click");
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 glass-panel rounded-full p-3.5 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-primary/40 shadow-lg text-slate-600 dark:text-yellow-400 bg-white/60 dark:bg-black/60 border border-white/20 dark:border-white/10 cursor-pointer focus:outline-none"
      aria-label="Toggle Theme"
    >
      {isDark ? <FaSun size={14} /> : <FaMoon size={14} />}
    </button>
  );
}
