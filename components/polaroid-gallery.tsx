"use client";
import React, { useState, useEffect } from "react";
import { motion as motionImport, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaTimes, FaSearchPlus } from "react-icons/fa";
import configData from "@/config/birthday-config.json";
import { PhotoItem } from "@/config/types";

export default function PolaroidGallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    setPhotos(configData.photos);
  }, []);

  const openLightbox = (idx: number) => {
    setActiveIdx(idx);
  };

  const closeLightbox = () => {
    setActiveIdx(null);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIdx === null) return;
    setActiveIdx((prev) => (prev! - 1 + photos.length) % photos.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setActiveIdx((prev) => (prev! + 1) % photos.length);
      if (e.key === "ArrowLeft") setActiveIdx((prev) => (prev! - 1 + photos.length) % photos.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx, photos]);

  return (
    <section className="py-24 relative z-10 px-4 max-w-6xl mx-auto text-center">
      <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full glow-spot-purple opacity-25 blur-3xl pointer-events-none" />

      {/* Title */}
      <motionImport.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          📸 Capture the Moments
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-white">
          Our Polaroid Memory Wall
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-md mx-auto">
          Hover to zoom in and click on any polaroid to open the lightbox of memories.
        </p>
      </motionImport.div>

      {/* Grid Wall */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-center">
        {photos.map((item, idx) => {
          // Generate a static random rotation angle for each polaroid based on its ID
          const rotate = (item.id % 2 === 0 ? 1 : -1) * ((item.id * 3) % 6);
          
          return (
            <motionImport.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (idx % 4) * 0.1 }}
              whileHover={{ 
                scale: 1.08, 
                rotate: 0, 
                zIndex: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
              }}
              onClick={() => openLightbox(idx)}
              className="bg-[#fcfbf9] p-3 pb-6 rounded-md shadow-lg border border-black/5 cursor-pointer text-left relative flex flex-col justify-between h-72"
              style={{ rotate: `${rotate}deg` }}
            >
              {/* Paper Tape Effect */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-6 bg-white/20 backdrop-blur-[2px] shadow-sm transform -rotate-2 z-10 border border-white/10" />

              {/* Photo Image */}
              <div className="relative w-full h-[80%] bg-neutral-900 overflow-hidden rounded-sm group">
                <img
                  src={item.url}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                />
                {/* Search glass hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <FaSearchPlus className="text-white text-2xl" />
                </div>
              </div>

              {/* Polaroid Footer Text */}
              <div className="pt-3 font-medium select-none flex flex-col justify-end">
                <p className="text-xs text-neutral-800 font-bold truncate">
                  {item.title}
                </p>
                <p className="text-[9px] text-neutral-500 font-bold mt-0.5">
                  {item.date}
                </p>
              </div>
            </motionImport.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeIdx !== null && (
          <motionImport.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md cursor-zoom-out"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all focus:outline-none cursor-pointer z-55"
              aria-label="Close lightbox"
            >
              <FaTimes size={18} />
            </button>

            {/* Prev Button */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white bg-white/10 p-3.5 rounded-full hover:bg-white/20 transition-all focus:outline-none cursor-pointer z-55"
              aria-label="Previous photo"
            >
              <FaChevronLeft size={20} />
            </button>

            {/* Next Button */}
            <button
              onClick={nextPhoto}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white bg-white/10 p-3.5 rounded-full hover:bg-white/20 transition-all focus:outline-none cursor-pointer z-55"
              aria-label="Next photo"
            >
              <FaChevronRight size={20} />
            </button>

            {/* Content Wrapper */}
            <motionImport.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#fcfbf9] max-w-2xl w-full p-4 md:p-6 pb-8 md:pb-10 rounded-lg shadow-2xl flex flex-col gap-4 border border-black/5 cursor-default max-h-[85vh] overflow-y-auto"
            >
              {/* Image */}
              <div className="relative w-full h-[55vh] max-h-[450px] bg-neutral-900 rounded overflow-hidden">
                <img
                  src={photos[activeIdx].url}
                  alt={photos[activeIdx].title}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Details */}
              <div className="text-left font-sans flex flex-col justify-end">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-xl font-extrabold text-neutral-900 leading-tight">
                    {photos[activeIdx].title}
                  </h3>
                  <span className="text-xs font-bold text-neutral-500 bg-neutral-200/50 px-2 py-0.5 rounded">
                    {photos[activeIdx].date}
                  </span>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                  {photos[activeIdx].description}
                </p>
              </div>
            </motionImport.div>
          </motionImport.div>
        )}
      </AnimatePresence>
    </section>
  );
}
