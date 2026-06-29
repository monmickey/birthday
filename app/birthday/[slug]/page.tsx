"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

import dynamic from "next/dynamic";

// Backgrounds & Globals (Dynamically loaded on client)
const Particles = dynamic(() => import("@/components/particles"), { ssr: false });
const BackgroundDecorations = dynamic(() => import("@/components/background-decorations"), { ssr: false });
import CustomCursor from "@/components/cursor";
import ThemeToggle from "@/components/theme-toggle";

// Setup Stages
import PasscodeScreen from "@/components/passcode-screen";
import CountdownScreen from "@/components/countdown-screen";

// Post-unlock sections loaded dynamically
const CameraGallery = dynamic(() => import("@/components/camera-gallery"), { ssr: false });
const MemoryTimeline = dynamic(() => import("@/components/memory-timeline"), { ssr: false });
const CakeSlice = dynamic(() => import("@/components/cake-slice"), { ssr: false });
const BirthdayLetter = dynamic(() => import("@/components/birthday-letter"), { ssr: false });
const WishesWall = dynamic(() => import("@/components/wishes-wall"), { ssr: false });
const FinalCelebration = dynamic(() => import("@/components/final-celebration"), { ssr: false });


// Hooks & Database
import { useAudio } from "@/hooks/useAudio";
import { getBirthdayPage, getBirthdayPageLight, readFromLocalStorage } from "@/lib/supabase";
import { parseBirthdayDate } from "@/lib/date";
import { BirthdayConfig } from "@/config/types";

function BirthdayPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params.slug as string) || "default";
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<BirthdayConfig | null>(null);

  const {
    isPlayingBg,
    isMuted,
    audioError,
    volume,
    playBgMusic,
    pauseBgMusic,
    stopBgMusic,
    playSfx,
    toggleMute,
    setVolume,
  } = useAudio(config?.music);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Dynamic config fetch with SWR Cache-First loading pattern + Light/Full 2-phase load
  useEffect(() => {
    let active = true;

    async function loadData() {
      // 1. Instantly load from localStorage if cached to bypass loading spinner
      const cached = readFromLocalStorage(slug);
      if (cached) {
        setConfig(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Fetch lightweight configuration first to render passcode screen immediately
      try {
        const lightData = await getBirthdayPageLight(slug);
        if (active) {
          setConfig((prev) => {
            // Keep cached heavy arrays if they are already present
            if (prev && (prev.photos.length > 0 || prev.music.bgMusicUrl)) {
              return {
                ...lightData,
                photos: prev.photos,
                timeline: prev.timeline,
                wishes: prev.wishes,
                music: prev.music,
              };
            }
            return lightData;
          });
          setLoading(false);
        }

        // 3. Fetch heavy assets in the background
        const fullData = await getBirthdayPage(slug);
        if (active) {
          setConfig(fullData);
        }
      } catch (err) {
        console.error("Supabase dynamic page fetch error:", err);
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [slug]);

  // Override config parameters if query strings exist
  useEffect(() => {
    if (!config) return;
    const nameParam = searchParams.get("name");
    const codeParam = searchParams.get("code");
    const dateParam = searchParams.get("date");

    const needsUpdate =
      (nameParam && nameParam !== config.recipientName) ||
      (codeParam && codeParam !== config.secretCode) ||
      (dateParam && dateParam !== config.birthdayDate);

    if (needsUpdate) {
      setConfig((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          recipientName: nameParam || prev.recipientName,
          secretCode: codeParam || prev.secretCode,
          birthdayDate: dateParam || prev.birthdayDate,
        };
      });
    }
  }, [searchParams, config]);

  const handleUnlockSuccess = () => {
    // If birthday is in the future, show countdown; otherwise go straight in
    const isFuture = config && new Date(config.birthdayDate).getTime() > Date.now();
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
        <rect x="44" y="30" width="12" height="60" fill="#f59e0b" />
        <circle cx="40" cy="22" r="10" fill="none" stroke="#f59e0b" strokeWidth="6" />
        <circle cx="60" cy="22" r="10" fill="none" stroke="#f59e0b" strokeWidth="6" />
      </svg>
    </div>
  );

  // Blue Cursive "Birthday!" Bubble SVG Logo
  const BirthdayBubble = () => (
    <div className="w-48 h-20 relative select-none pointer-events-none filter drop-shadow-[0_8px_16px_rgba(59,130,246,0.2)]">
      <svg viewBox="0 0 200 80" className="w-full h-full">
        <rect x="10" y="10" width="180" height="60" rx="30" fill="#3b82f6" stroke="white" strokeWidth="3" />
        <path d="M160,20 Q170,10 180,30" stroke="#f43f5e" strokeWidth="4" fill="none" />
        <text x="100" y="48" fill="white" fontSize="24" fontWeight="black" fontFamily="cursive" textAnchor="middle">
          Birthday!
        </text>
      </svg>
    </div>
  );

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center text-slate-500 text-sm">
        Initializing dynamic surprise page...
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen transition-colors duration-500 overflow-x-hidden font-sans ${isDark ? "bg-gradient-to-b from-[#050215] via-[#12052c] to-[#20053a] text-slate-100" : "bg-gradient-to-b from-[#e0f2fe] via-[#f0f9ff] to-[#e0f2fe] text-slate-800"}`}>
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
              recipientName={config.recipientName}
              correctCode={config.secretCode || "0541"}
              onSuccess={handleUnlockSuccess}
              playSfx={playSfx}
            />
          </motion.div>
        ) : showCountdown && config ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-screen"
          >
            <CountdownScreen
              targetDate={config.birthdayDate}
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


            <section className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 relative">
              <div className="absolute left-[10%] bottom-[12%] z-10 hidden sm:block">
                <GiftSticker />
              </div>

              <div className="mb-6">
                <BirthdayBubble />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-600 mb-2">
                A Birthday Made Just For You
              </span>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight font-serif mb-4">
                Happy Birthday, <br />
                <span className="text-sky-600 block mt-2">{config.recipientName}</span>
              </h1>

              <div className="flex items-center justify-center gap-1 bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-full px-5 py-2 shadow-sm mb-6 select-none font-semibold text-slate-700 text-sm">
                <span>📂</span>
                <span className="font-mono">{parseBirthdayDate(config.birthdayDate).getFullYear()}</span>
                <span>📂</span>
              </div>

              <p className="text-xs md:text-sm text-slate-500 font-bold max-w-sm mb-12 leading-relaxed">
                 {config.photos.length}   Some little memories. One very special person. Happy Birthday, {config.recipientName} ✨
              </p>

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

            {/* Camera clicker polaroids section */}
            <div id="camera-gallery" className="w-full border-t border-slate-200/20">
              <CameraGallery photos={config.photos} playSfx={playSfx} />
            </div>

            {/* Journey Timeline milestones section */}
            <div id="journey-timeline" className="w-full border-t border-slate-200/20 bg-white/5">
              <MemoryTimeline timeline={config.timeline} />
            </div>

            {/* Cake Slicing section */}
            <div id="cake-slice" className="w-full border-t border-slate-200/20 bg-white/5">
              <CakeSlice
                playSfx={playSfx}
                onSliceComplete={() => {
                  const target = document.getElementById("birthday-letter");
                  if (target) target.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </div>

            {/* Note letter book section */}
            <div id="birthday-letter" className="w-full border-t border-slate-200/20">
              <BirthdayLetter friendName={config.recipientName} />
            </div>

            {/* Wishes wall section */}
            <div id="wishes-wall" className="w-full border-t border-slate-200/20 bg-white/5">
              <WishesWall wishes={config.wishes} />
            </div>

            {/* Finale celebration dynamic dashboard */}
            <div id="final-celebration" className="w-full border-t border-slate-200/20">
              <FinalCelebration
                recipientName={config.recipientName}
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

export default function BirthdayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-sky-50 flex items-center justify-center text-slate-500 text-sm">
          Loading dynamic page...
        </div>
      }
    >
      <BirthdayPageContent />
    </Suspense>
  );
}
