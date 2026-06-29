"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Gallery", id: "memory-gallery" },
    { label: "Timeline", id: "memory-timeline" },
    { label: "Letter", id: "birthday-letter" },
    { label: "Wishes", id: "wishes-wall" },
    { label: "Cake", id: "birthday-cake" },
    { label: "Finale", id: "final-celebration" },
  ];

  const handleScrollTo = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-5xl rounded-full transition-all duration-300 ${
          scrolled
            ? "glass-panel py-3 px-6 shadow-lg border-white/10"
            : "bg-transparent py-5 px-4 border-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FaHeart className="text-secondary" size={16} />
            </motion.div>
            <span className="text-white font-extrabold text-xs tracking-widest uppercase group-hover:text-primary transition-colors">
              Birthday Surprise
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest font-bold text-white/70">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className="hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none relative py-1"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/80 hover:text-white border border-white/15 p-2 rounded-full cursor-pointer focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <FaTimes size={14} /> : <FaBars size={14} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-[92%] glass-panel rounded-3xl p-6 z-40 flex flex-col gap-4 text-center text-xs uppercase tracking-widest font-bold border border-white/10 md:hidden shadow-2xl"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className="text-white/80 hover:text-white py-3 border-b border-white/5 last:border-0 hover:bg-white/5 rounded-xl cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
