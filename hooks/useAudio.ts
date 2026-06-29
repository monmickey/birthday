"use client";

import { useEffect, useState, useRef } from "react";
import { Howl } from "howler";
import configData from "@/config/birthday-config.json";
import { BirthdayConfig } from "@/config/types";

type MusicConfig = BirthdayConfig["music"];

const DEFAULT_BG_VOLUME = 0.4;

function getSafeVolume(volume?: number) {
  if (typeof volume !== "number" || Number.isNaN(volume)) {
    return DEFAULT_BG_VOLUME;
  }

  return Math.min(1, Math.max(0, volume));
}

export function useAudio(musicConfig: MusicConfig = configData.music) {
  const [isPlayingBg, setIsPlayingBg] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customVolume, setCustomVolume] = useState<number | null>(null);
  const volume = customVolume ?? getSafeVolume(musicConfig.bgMusicVolume);
  
  const bgMusicRef = useRef<Howl | null>(null);
  const sfxRefs = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initialVolume = getSafeVolume(musicConfig.bgMusicVolume);

    // Load Background Music
    bgMusicRef.current = new Howl({
      src: [musicConfig.bgMusicUrl],
      html5: true, // play larger files without buffering
      loop: true,
      volume: initialVolume,
    });

    // Load SFXs
    sfxRefs.current = {
      click: new Howl({ src: [musicConfig.clickSfx], volume: 0.5 }),
      giftOpen: new Howl({ src: [musicConfig.giftOpenSfx], volume: 0.6 }),
      confetti: new Howl({ src: [musicConfig.confettiSfx], volume: 0.5 }),
      fireworks: new Howl({ src: [musicConfig.fireworksSfx], volume: 0.4 }),
    };

    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.unload();
      }
      Object.values(sfxRefs.current).forEach((sfx) => sfx.unload());
    };
  }, [musicConfig]);

  const playBgMusic = () => {
    if (!bgMusicRef.current) return;
    if (!bgMusicRef.current.playing()) {
      bgMusicRef.current.play();
      bgMusicRef.current.fade(0, volume, 2000); // Smooth fade in
      setIsPlayingBg(true);
    }
  };

  const pauseBgMusic = () => {
    if (!bgMusicRef.current) return;
    if (bgMusicRef.current.playing()) {
      bgMusicRef.current.fade(volume, 0, 1000);
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

  const setVolume = (nextVolume: number) => {
    const safeVolume = getSafeVolume(nextVolume);
    setCustomVolume(safeVolume);
    bgMusicRef.current?.volume(safeVolume);
    if (safeVolume > 0 && isMuted) {
      toggleMute();
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
    volume,
    setVolume,
  };
}
