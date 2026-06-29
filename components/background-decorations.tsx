"use client";

import React from "react";
import { motion } from "framer-motion";

const BALLOON_COLORS = [
  "from-pink-400 to-rose-500 shadow-pink-400/20",
  "from-purple-400 to-indigo-500 shadow-purple-400/20",
  "from-blue-400 to-sky-500 shadow-blue-400/20",
  "from-yellow-300 to-amber-400 shadow-yellow-300/20",
  "from-emerald-400 to-teal-500 shadow-emerald-400/20",
];

export default function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Glow spots */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full glow-spot-purple animate-pulse-glow" style={{ animationDelay: "0s" }} />
      <div className="absolute top-[40%] right-[5%] w-96 h-96 rounded-full glow-spot-pink animate-pulse-glow" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-[10%] left-[20%] w-80 h-80 rounded-full glow-spot-blue animate-pulse-glow" style={{ animationDelay: "4s" }} />

      {/* Drifting Clouds */}
      <div className="absolute top-[15%] left-0 w-full h-[20%] overflow-hidden opacity-30 select-none">
        {/* Cloud 1 */}
        <div 
          className="absolute text-6xl text-white/50 animate-drift-cloud" 
          style={{ animationDuration: "50s", animationDelay: "0s", top: "10%" }}
        >
          ☁️
        </div>
        {/* Cloud 2 */}
        <div 
          className="absolute text-8xl text-white/40 animate-drift-cloud" 
          style={{ animationDuration: "75s", animationDelay: "-25s", top: "40%" }}
        >
          ☁️
        </div>
        {/* Cloud 3 */}
        <div 
          className="absolute text-5xl text-white/60 animate-drift-cloud" 
          style={{ animationDuration: "60s", animationDelay: "-10s", top: "60%" }}
        >
          ☁️
        </div>
      </div>

      {/* Floating Balloons */}
      {Array.from({ length: 8 }).map((_, i) => {
        const colorClass = BALLOON_COLORS[i % BALLOON_COLORS.length];
        const delay = i * 2.5;
        const leftPercent = 5 + (i * 12) % 90;
        const scale = 0.6 + (i % 3) * 0.15;
        
        return (
          <motion.div
            key={`bg-balloon-${i}`}
            initial={{ y: "110vh", x: 0 }}
            animate={{
              y: "-15vh",
              x: [0, (i % 2 === 0 ? 20 : -20), 0],
            }}
            transition={{
              y: { duration: 25 + (i % 4) * 4, repeat: Infinity, ease: "linear", delay },
              x: { duration: 5 + (i % 3) * 1.5, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute w-10 h-14 rounded-full"
            style={{ left: `${leftPercent}%` }}
          >
            <div
              className={`w-full h-full rounded-3xl bg-gradient-to-br ${colorClass} shadow-md relative filter brightness-110 flex items-center justify-center`}
              style={{ transform: `scale(${scale})` }}
            >
              {/* Highlight */}
              <div className="absolute top-1.5 left-1.5 w-2 h-3 bg-white/20 rounded-full" />
              {/* Knot */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[2px] w-1.5 h-1.5 border-t-4 border-t-inherit border-x-4 border-x-transparent" />
              {/* String */}
              <svg className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-16 overflow-visible" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none">
                <path d="M 6,0 Q 10,8 6,16 T 6,32 T 6,48" />
              </svg>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
