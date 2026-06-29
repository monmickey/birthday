"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { PhotoItem } from "@/config/types";

interface CameraGalleryProps {
  photos?: PhotoItem[];
  playSfx: (type: "click" | "giftOpen") => void;
}

interface StackedPhoto extends PhotoItem {
  rotate: number;
  offsetX: number;
  offsetY: number;
  zIndex: number;
}

export default function CameraGallery({ photos = [], playSfx }: CameraGalleryProps) {
  const [allPhotos, setAllPhotos] = useState<PhotoItem[]>([]);
  const [photoQueue, setPhotoQueue] = useState<PhotoItem[]>([]);
  const [displayedStack, setDisplayedStack] = useState<StackedPhoto[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    setAllPhotos(photos);
    setPhotoQueue(photos);
  }, [photos]);

  const handleCameraTap = () => {
    if (photoQueue.length === 0) {
      // Loop queue if empty to let them replay
      setPhotoQueue(allPhotos);
      setDisplayedStack([]);
      playSfx("click");
      return;
    }

    playSfx("click"); // camera shutter click
    
    // Get first item in queue
    const nextPhoto = photoQueue[0];
    setPhotoQueue((prev) => prev.slice(1));

    // Create stacked card details
    const rotate = (Math.random() - 0.5) * 20; // -10deg to 10deg
    const offsetX = (Math.random() - 0.5) * 30; // -15px to 15px
    const offsetY = (Math.random() - 0.5) * 30; // -15px to 15px
    const zIndex = displayedStack.length + 1;

    setDisplayedStack((prev) => [
      ...prev,
      { ...nextPhoto, rotate, offsetX, offsetY, zIndex },
    ]);
  };

  const clearTopCard = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    playSfx("click");
    setDisplayedStack((prev) => prev.filter((p) => p.id !== id));
  };

  // Floral Bouquet Sticker SVG
  const FloralSticker = () => (
    <div className="w-24 h-24 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] select-none pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Wrapping paper */}
        <polygon points="50,90 25,60 75,60" fill="#fbcfe8" stroke="white" strokeWidth="4" />
        {/* Flowers */}
        <circle cx="40" cy="45" r="12" fill="#fb7185" />
        <circle cx="40" cy="45" r="5" fill="#fef08a" />
        
        <circle cx="60" cy="45" r="11" fill="#60a5fa" />
        <circle cx="60" cy="45" r="4.5" fill="#fef08a" />
        
        <circle cx="50" cy="35" r="13" fill="#c084fc" />
        <circle cx="50" cy="35" r="5.5" fill="#fef08a" />
        
        {/* Green Leaves */}
        <path d="M22,45 C15,35 30,35 30,45 Z" fill="#34d399" />
        <path d="M78,45 C85,35 70,35 70,45 Z" fill="#34d399" />
      </svg>
    </div>
  );

  return (
    <section className="py-24 relative z-10 px-4 max-w-4xl mx-auto text-center flex flex-col items-center">
      {/* Decorative floral decal */}
      <div className="absolute left-[5%] bottom-[5%] z-10 hidden sm:block">
        <FloralSticker />
      </div>

      {/* Header */}
      <div className="mb-12">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 block mb-2">
          Featured Moments
        </span>
        <h2 className="text-3xl md:text-5xl font-black font-serif text-slate-800">
          Press for a memory
        </h2>
      </div>

      {/* Interactive Camera Device */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleCameraTap}
        className="w-44 h-32 relative cursor-pointer mb-8 select-none"
      >
        <svg viewBox="0 0 140 100" className="w-full h-full drop-shadow-[0_12px_24px_rgba(249,115,22,0.3)]">
          {/* Main Orange Camera Body */}
          <rect x="10" y="20" width="120" height="70" rx="16" fill="#f97316" stroke="white" strokeWidth="4" />
          {/* Top Panel Accent */}
          <path d="M20,20 L120,20 L110,35 L30,35 Z" fill="#ffedd5" />
          {/* Top Shutter Button */}
          <rect x="30" y="10" width="20" height="10" rx="3" fill="#ef4444" />
          <rect x="90" y="12" width="25" height="8" rx="2" fill="#94a3b8" />
          {/* Central Camera Lens */}
          <circle cx="70" cy="55" r="28" fill="#e2e8f0" stroke="white" strokeWidth="4" />
          <circle cx="70" cy="55" r="22" fill="#1e293b" />
          <circle cx="70" cy="55" r="16" fill="#0f172a" />
          {/* Glass Lens reflection shine */}
          <circle cx="64" cy="49" r="5" fill="white" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Counter text */}
      <p className="text-xs font-bold text-slate-500 tracking-wider mb-12">
        {photoQueue.length > 0 ? (
          <>
            Tap the camera — <span className="text-orange-500 font-extrabold">{photoQueue.length}</span> memories left
          </>
        ) : (
          "No memories left in rolls! Tap to restart stack."
        )}
      </p>

      {/* Polaroid Deck Stack Area */}
      <div className="relative w-full max-w-sm h-[320px] mb-12">
        <AnimatePresence>
          {displayedStack.map((item) => (
            <motion.div
              key={item.id}
              initial={{ scale: 0.2, y: -100, opacity: 0, rotate: 0 }}
              animate={{
                scale: 1,
                y: item.offsetY,
                x: item.offsetX,
                opacity: 1,
                rotate: item.rotate,
              }}
              exit={{ scale: 0.8, opacity: 0, y: 150, rotate: item.rotate * 1.5 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              style={{ zIndex: item.zIndex }}
              className="absolute inset-0 m-auto w-64 h-80 bg-[#fcfbf9] p-3 pb-6 rounded-md shadow-xl border border-black/5 flex flex-col justify-between"
            >
              {/* Sticker tape top decoration */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-14 h-5 bg-white/40 backdrop-blur-[2px] shadow-sm transform -rotate-1 border border-white/20" />

              {/* Photo viewport */}
              <div className="relative w-full h-[75%] bg-neutral-900 overflow-hidden rounded-sm">
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
              </div>

              {/* Polaroid bottom caption */}
              <div className="pt-2 flex justify-between items-end font-sans">
                <div className="text-left">
                  <h4 className="text-xs font-extrabold text-neutral-800 leading-tight truncate max-w-[150px]">
                    {item.title}
                  </h4>
                  <span className="text-[9px] font-bold text-neutral-400 mt-0.5 block">{item.date}</span>
                </div>
                <button
                  onClick={(e) => clearTopCard(e, item.id)}
                  className="text-neutral-300 hover:text-red-400 p-1.5 transition-colors cursor-pointer"
                  aria-label="Remove card"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
