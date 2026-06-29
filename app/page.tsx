"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

// Backgrounds & Globals
import Particles from "@/components/particles";
import BackgroundDecorations from "@/components/background-decorations";
import CustomCursor from "@/components/cursor";
import ThemeToggle from "@/components/theme-toggle";

// Setup Stages
import PasscodeScreen from "@/components/passcode-screen";
import CountdownScreen from "@/components/countdown-screen";
import CameraGallery from "@/components/camera-gallery";
import CakeSlice from "@/components/cake-slice";
import BirthdayLetter from "@/components/birthday-letter";
import WishesWall from "@/components/wishes-wall";
import FinalCelebration from "@/components/final-celebration";
import MusicPlayer from "@/components/music-player";

// Hooks
import { useAudio } from "@/hooks/useAudio";
import configData from "@/config/birthday-config.json";
import { getBirthdayPage } from "@/lib/supabase";
import { parseBirthdayDate } from "@/lib/date";

function HomeContent() {
  const searchParams = useSearchParams();
  const {
    isPlayingBg,
    isMuted,
    playBgMusic,
    pauseBgMusic,
    stopBgMusic,
    playSfx,
    toggleMute,
  } = useAudio();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [friendName, setFriendName] = useState(configData.recipientName);
  const [secretCode, setSecretCode] = useState(configData.secretCode || "0541");
  const [targetDate, setTargetDate] = useState(configData.birthdayDate);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Sync parameters
  useEffect(() => {
    const nameParam = searchParams.get("name");
    if (nameParam) setFriendName(nameParam);
    const codeParam = searchParams.get("code");
    if (codeParam) setSecretCode(codeParam);
    const dateParam = searchParams.get("date");
    if (dateParam) setTargetDate(dateParam);
  }, [searchParams]);

  // Load saved config from localStorage (admin edits)
  useEffect(() => {
    getBirthdayPage("default").then((cfg) => {
      setFriendName(cfg.recipientName);
      if (cfg.secretCode) setSecretCode(cfg.secretCode);
      if (cfg.birthdayDate) setTargetDate(cfg.birthdayDate);
    });
  }, []);

  const handleUnlockSuccess = () => {
    // If birthday is in the future, show countdown; otherwise go straight in
    const isFuture = parseBirthdayDate(targetDate).getTime() > Date.now();
    if (isFuture) {
      setShowCountdown(true);
    } else {
      setIsUnlocked(true);
    }
    playBgMusic();
  };

  const handleReplay = () => {
    stopBgMusic();
    setIsUnlocked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Gift Sticker SVG
  const GiftSticker = () => (
    <div className="w-20 h-20 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] animate-sway select-none pointer-events-none">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="15" y="40" width="70" height="50" rx="6" fill="#f43f5e" stroke="white" strokeWidth="4" />
        <rect x="10" y="30" width="80" height="15" rx="4" fill="#ef4444" stroke="white" strokeWidth="4" />
        {/* Ribbon Vertical */}
        <rect x="44" y="30" width="12" height="60" fill="#f59e0b" />
        {/* Bow */}
        <circle cx="40" cy="22" r="10" fill="none" stroke="#f59e0b" strokeWidth="6" />
        <circle cx="60" cy="22" r="10" fill="none" stroke="#f59e0b" strokeWidth="6" />
      </svg>
    </div>
  );

  // Cursive Blue "Birthday!" Bubble SVG Logo
  const BirthdayBubble = () => (
    <div className="w-48 h-20 relative select-none pointer-events-none filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.2)]">
      <svg viewBox="0 0 200 80" className="w-full h-full">
        {/* Main Blue Bubble */}
        <rect x="10" y="10" width="180" height="60" rx="30" fill="#3b82f6" stroke="white" strokeWidth="3" />
        {/* Red ribbon outline decoration */}
        <path d="M160,20 Q170,10 180,30" stroke="#f43f5e" strokeWidth="4" fill="none" />
        {/* Bubbly Text */}
        <text x="100" y="48" fill="white" fontSize="24" fontWeight="black" fontFamily="cursive" textAnchor="middle">
          Birthday!
        </text>
      </svg>
    </div>
  );

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-x-hidden font-sans ${isDark ? "bg-gradient-to-b from-[#050215] via-[#12052c] to-[#20053a] text-slate-100" : "bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e0f2fe] text-slate-800"}`}>
      {/* Background elements */}
      <Particles />
      <BackgroundDecorations />
      <CustomCursor />
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} playSfx={playSfx} />

      <AnimatePresence mode="wait">
        {!isUnlocked && !showCountdown ? (
          <motion.div
            key="lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen"
          >
            <PasscodeScreen
              recipientName={friendName}
              correctCode={secretCode}
              onSuccess={handleUnlockSuccess}
              playSfx={playSfx}
            />
          </motion.div>
        ) : showCountdown ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen"
          >
            <CountdownScreen
              targetDate={targetDate}
              onComplete={() => { setShowCountdown(false); setIsUnlocked(true); }}
              playClick={() => playSfx("click")}
            />
          </motion.div>
        ) : (
          <motion.main
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full flex flex-col items-center"
          >
            {/* SECTION 2: Welcome Intro Section */}
            <MusicPlayer
              isPlaying={isPlayingBg}
              isMuted={isMuted}
              onTogglePlay={isPlayingBg ? pauseBgMusic : playBgMusic}
              onToggleMute={toggleMute}
            />

            <section className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 relative">
              {/* Gift decal sticker bottom left */}
              <div className="absolute left-[10%] bottom-[12%] z-10 hidden sm:block">
                <GiftSticker />
              </div>

              {/* Blue "Birthday!" Cursive Bubble Logo */}
              <div className="mb-6">
                <BirthdayBubble />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-600 mb-2">
                A Birthday Made Just For You
              </span>

              <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight font-serif mb-4">
                Happy Birthday, <br />
                <span className="text-sky-600 block mt-2">{friendName}</span>
              </h1>

              {/* Folder badge year display */}
              <div className="flex items-center justify-center gap-1 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-full px-5 py-2 shadow-sm mb-6 select-none font-semibold text-slate-700 text-sm">
                <span>📂</span>
                <span className="font-mono">{parseBirthdayDate(targetDate).getFullYear()}</span>
                <span>📂</span>
              </div>

              {/* Count details description */}
              <p className="text-xs md:text-sm text-slate-500 font-bold max-w-sm mb-12 leading-relaxed">
                {configData.photos.length} little memories. One very special person. Happy Birthday, {friendName} ✨
              </p>

              {/* Scroll down indicator */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex flex-col items-center gap-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                onClick={() => {
                  const letterSec = document.getElementById("camera-gallery");
                  if (letterSec) letterSec.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                  Scroll
                </span>
                <FaChevronDown className="text-sky-600 text-sm" />
              </motion.div>
            </section>

            {/* Camera memories slider clicker section */}
            <div id="camera-gallery" className="w-full border-t border-slate-200/20">
              <CameraGallery photos={configData.photos} playSfx={playSfx} />
            </div>

            {/* Cake Slicing Ritual Section */}
            <div id="cake-slice" className="w-full border-t border-slate-200/20 bg-white/5">
              <CakeSlice
                playSfx={playSfx}
                onSliceComplete={() => {
                  const target = document.getElementById("birthday-letter");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            {/* Handwritten note letter board section */}
            <div id="birthday-letter" className="w-full border-t border-slate-200/20">
              <BirthdayLetter friendName={friendName} />
            </div>

            {/* Floating wishes wall board section */}
            <div id="wishes-wall" className="w-full border-t border-slate-200/20 bg-white/5">
              <WishesWall />
            </div>

            {/* Finale fireworks & dynamic sharing screen */}
            <div id="final-celebration" className="w-full border-t border-slate-200/20">
              <FinalCelebration
                recipientName={friendName}
                onReplay={handleReplay}
                playSfx={playSfx}
              />
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sky-50 flex items-center justify-center text-slate-500 text-sm">
          Loading birthday surprise...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
