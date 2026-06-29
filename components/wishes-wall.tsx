"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import configData from "@/config/birthday-config.json";
import { WishItem } from "@/config/types";

const GRADIENTS = [
  "from-pink-500/10 to-rose-500/10 border-pink-500/30",
  "from-purple-500/10 to-indigo-500/10 border-purple-500/30",
  "from-blue-500/10 to-sky-500/10 border-blue-500/30",
  "from-amber-500/10 to-yellow-500/10 border-amber-500/30",
  "from-emerald-500/10 to-teal-500/10 border-emerald-500/30",
];

export default function WishesWall() {
  const [wishes, setWishes] = useState<WishItem[]>([]);

  useEffect(() => {
    setWishes(configData.wishes);
  }, []);

  return (
    <section className="py-24 relative z-10 px-4 max-w-5xl mx-auto overflow-hidden">
      <div className="absolute top-[40%] right-[5%] w-80 h-80 rounded-full glow-spot-blue opacity-25 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
          💭 Wishes Wall
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-white">
          Kind Words & Birthday Wishes
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-sm mx-auto">
          Warm messages and congratulations sent from friends near and far.
        </p>
      </motion.div>

      {/* Floating Card Canvas */}
      <div className="relative min-h-[400px] w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {wishes.map((wish, idx) => {
          const gradient = GRADIENTS[idx % GRADIENTS.length];
          // Float parameters
          const duration = 5 + (idx % 3) * 1.5;
          const delay = idx * 0.4;
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                y: {
                  repeat: Infinity,
                  duration,
                  ease: "easeInOut",
                  delay,
                },
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
              }}
              whileHover={{
                scale: 1.05,
                borderColor: "rgba(255, 255, 255, 0.3)",
                boxShadow: "0 15px 30px rgba(168, 85, 247, 0.2)",
                zIndex: 10,
              }}
              className={`glass-panel bg-gradient-to-br ${gradient} p-6 rounded-3xl border shadow-xl flex flex-col justify-between h-44`}
            >
              <div className="relative">
                {/* Quote decoration */}
                <span className="absolute -top-3 -left-2 text-4xl text-white/10 select-none font-serif">
                  “
                </span>
                <p className="text-white/80 text-sm font-medium leading-relaxed pl-4 italic">
                  {wish.text}
                </p>
              </div>

              {/* Sender Details */}
              <div className="text-right">
                <span className="text-xs font-bold text-gradient-purple-pink uppercase tracking-widest">
                  — {wish.sender}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
