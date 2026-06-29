"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseBirthdayDate } from "@/lib/date";

interface CountdownScreenProps {
  targetDate: string;
  onComplete: () => void;
  playClick: () => void;
}

export default function CountdownScreen({ targetDate, onComplete, playClick }: CountdownScreenProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isDone, setIsDone] = useState(false);

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const target = parseBirthdayDate(targetDate).getTime();
    let interval: NodeJS.Timeout;
    let timer: NodeJS.Timeout;

    const calculateTime = () => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setIsDone(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (interval) clearInterval(interval);
        
        // Wait 1.5 seconds displaying "Almost there..." then proceed
        timer = setTimeout(() => {
          onCompleteRef.current();
        }, 1500);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    
    const diff = target - Date.now();
    if (diff > 0) {
      interval = setInterval(calculateTime, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [targetDate]);

  const handleSkip = () => {
    playClick();
    setIsDone(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  if (!timeLeft) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">
        Aligning standard time...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Glow spots */}
      <div className="absolute top-[40%] w-96 h-96 rounded-full glow-spot-purple opacity-30 blur-3xl" />

      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="almost-there"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-panel max-w-md w-full rounded-3xl p-10 md:p-12 shadow-2xl relative z-10 border border-white/10"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent rounded-full mx-auto mb-6"
            />
            <h2 className="text-3xl font-extrabold text-white mb-2 animate-pulse">
              Almost there...
            </h2>
            <p className="text-white/60 text-sm">
              Unlocking your special birthday experience right now!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="countdown-timer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel max-w-2xl w-full rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 border border-white/10"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 mb-6 inline-block">
              ⏳ Countdown to Surprise
            </span>

            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
              Birthday Countdown
            </h1>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-6 mb-8 max-w-md mx-auto">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((unit, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-2xl p-3 md:p-5 border border-white/10 flex flex-col items-center justify-center min-w-[70px] md:min-w-[90px]"
                >
                  <motion.span
                    key={unit.value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-3xl md:text-4xl font-extrabold text-gradient-purple-pink"
                  >
                    {unit.value.toString().padStart(2, "0")}
                  </motion.span>
                  <span className="text-[10px] md:text-xs uppercase font-bold tracking-wider text-white/50 mt-1">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-white/60 text-xs md:text-sm mb-6">
              Wait for the timer to tick down or unlock early below.
            </p>

            {/* Quick Skip Button for Testing */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSkip}
              className="px-6 py-2.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs tracking-wider transition-all cursor-pointer"
            >
              Skip Countdown ⚡
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
