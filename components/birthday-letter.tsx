"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import configData from "@/config/birthday-config.json";

interface BirthdayLetterProps {
  friendName: string;
}

export default function BirthdayLetter({ friendName }: BirthdayLetterProps) {
  const [typedText, setTypedText] = useState<string[]>([]);
  const [currentParagraphIdx, setCurrentParagraphIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [startTyping, setStartTyping] = useState(false);

  const letterConfig = configData.personalLetter;
  const paragraphs = letterConfig.paragraphs.map(p => p.replace("Sophia", friendName));

  // Trigger typing animation when component comes into viewport
  useEffect(() => {
    setStartTyping(true);
  }, []);

  useEffect(() => {
    if (!startTyping) return;
    if (currentParagraphIdx >= paragraphs.length) return;

    const currentParagraph = paragraphs[currentParagraphIdx];
    
    if (currentCharIdx < currentParagraph.length) {
      const timer = setTimeout(() => {
        setTypedText((prev) => {
          const next = [...prev];
          if (!next[currentParagraphIdx]) {
            next[currentParagraphIdx] = "";
          }
          next[currentParagraphIdx] += currentParagraph[currentCharIdx];
          return next;
        });
        setCurrentCharIdx((prev) => prev + 1);
      }, 15); // rapid typing
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentParagraphIdx((prev) => prev + 1);
        setCurrentCharIdx(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [startTyping, currentParagraphIdx, currentCharIdx, paragraphs]);

  // Floral Bouquet Sticker SVG
  const FloralSticker = () => (
    <div className="w-24 h-24 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] select-none pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polygon points="50,90 25,60 75,60" fill="#fbcfe8" stroke="white" strokeWidth="4" />
        <circle cx="40" cy="45" r="12" fill="#fb7185" />
        <circle cx="40" cy="45" r="5" fill="#fef08a" />
        <circle cx="60" cy="45" r="11" fill="#60a5fa" />
        <circle cx="60" cy="45" r="4.5" fill="#fef08a" />
        <circle cx="50" cy="35" r="13" fill="#c084fc" />
        <circle cx="50" cy="35" r="5.5" fill="#fef08a" />
        <path d="M22,45 C15,35 30,35 30,45 Z" fill="#34d399" />
        <path d="M78,45 C85,35 70,35 70,45 Z" fill="#34d399" />
      </svg>
    </div>
  );

  return (
    <section className="py-24 relative z-10 px-4 max-w-4xl mx-auto text-center flex flex-col items-center select-none">
      {/* Background elements */}
      <div className="absolute top-[25%] left-[10%] w-72 h-72 rounded-full glow-spot-purple opacity-20 blur-3xl pointer-events-none" />

      {/* Decal Floral Sticker bottom left */}
      <div className="absolute left-[5%] bottom-[5%] z-10 hidden sm:block">
        <FloralSticker />
      </div>

      {/* Header Title */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800">
          A note for you
        </h2>
      </div>

      {/* Transparent Lined Notepad Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full max-w-xl bg-white/70 backdrop-blur-md rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/40 text-left relative z-20 flex flex-col min-h-[400px] overflow-hidden"
      >
        {/* Margin line on the left of notebook paper */}
        <div className="absolute left-10 top-0 bottom-0 w-[1.5px] bg-red-200/60 z-10" />

        {/* Lined Notebook Page */}
        <div 
          className="pl-8 flex-1 font-serif text-sm md:text-base text-slate-700 leading-relaxed font-semibold pr-2"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)",
            backgroundAttachment: "local",
            lineHeight: "28px",
            paddingTop: "6px"
          }}
        >
          {/* Date header */}
          <div className="text-[10px] md:text-xs font-bold text-sky-600/80 uppercase tracking-widest mb-4">
            🗒️ {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div className="space-y-4">
            {typedText.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}

            {/* Blinking cursor */}
            {currentParagraphIdx < paragraphs.length && (
              <span className="inline-block w-2 h-4 bg-sky-500 animate-pulse ml-0.5" />
            )}

            {/* Handwritten Signature */}
            {currentParagraphIdx >= paragraphs.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="pt-6 font-serif italic text-right text-slate-800 font-black"
              >
                {letterConfig.signature}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
