"use client";

import { useEffect, useState, useRef } from "react";
import { Howl } from "howler";
import configData from "@/config/birthday-config.json";

export function useAudio() {
  const [isPlayingBg, setIsPlayingBg] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const bgMusicRef = useRef<Howl | null>(null);
  const sfxRefs = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Background Music
    bgMusicRef.current = new Howl({
      src: [configData.music.bgMusicUrl],
      html5: true, // play larger files without buffering
      loop: true,
      volume: 0.4,
    });

    // Load SFXs
    sfxRefs.current = {
      click: new Howl({ src: [configData.music.clickSfx], volume: 0.5 }),
      giftOpen: new Howl({ src: [configData.music.giftOpenSfx], volume: 0.6 }),
      confetti: new Howl({ src: [configData.music.confettiSfx], volume: 0.5 }),
      fireworks: new Howl({ src: [configData.music.fireworksSfx], volume: 0.4 }),
    };

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.unload();
      }
      Object.values(sfxRefs.current).forEach((sfx) => sfx.unload());
    };
  }, []);

  const playBgMusic = () => {
    if (!bgMusicRef.current) return;
    if (!bgMusicRef.current.playing()) {
      bgMusicRef.current.play();
      bgMusicRef.current.fade(0, 0.4, 2000); // Smooth fade in
      setIsPlayingBg(true);
    }
  };

  const pauseBgMusic = () => {
    if (!bgMusicRef.current) return;
    if (bgMusicRef.current.playing()) {
      bgMusicRef.current.fade(0.4, 0, 1000);
      setTimeout(() => {
        bgMusicRef.current?.pause();
        setIsPlayingBg(false);
      }, 1000);
    }
  };

  const stopBgMusic = () => {
    if (!bgMusicRef.current) return;
    bgMusicRef.current.stop();
    setIsPlayingBg(false);
  };

  const playSfx = (type: "click" | "giftOpen" | "confetti" | "fireworks") => {
    const sfx = sfxRefs.current[type];
    if (sfx) {
      if (isMuted) {
        sfx.mute(true);
      } else {
        sfx.mute(false);
      }
      sfx.play();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (bgMusicRef.current) {
      bgMusicRef.current.mute(nextMuted);
    }
    Object.values(sfxRefs.current).forEach((sfx) => {
      sfx.mute(nextMuted);
    });
  };

  return {
    isPlayingBg,
    isMuted,
    playBgMusic,
    pauseBgMusic,
    stopBgMusic,
    playSfx,
    toggleMute,
  };
}
