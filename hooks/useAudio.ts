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

function normalizeAudioUrl(value?: string) {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes("drive.google.com")) {
      const fileMatch = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      const id = fileMatch?.[1] || parsed.searchParams.get("id");
      if (id) {
        return `https://drive.google.com/uc?export=download&id=${id}`;
      }
    }

    if (hostname.includes("dropbox.com")) {
      const params = new URLSearchParams(parsed.search);
      params.set("raw", "1");
      parsed.search = params.toString();
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return trimmed;
  }
}

function getAudioErrorMessage(url: string) {
  if (!url) {
    return "No background audio URL is configured.";
  }

  if (/youtube\.com|youtu\.be/i.test(url)) {
    return "YouTube links won’t play as background audio here. Use a direct MP3, WAV, or OGG file URL instead.";
  }

  return "The audio URL could not be loaded. Please use a direct MP3, WAV, or OGG file link.";
}

export function useAudio(musicConfig: MusicConfig = configData.music) {
  const [isPlayingBg, setIsPlayingBg] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customVolume, setCustomVolume] = useState<number | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const volume = customVolume ?? getSafeVolume(musicConfig.bgMusicVolume);

  const bgMusicRef = useRef<Howl | null>(null);
  const sfxRefs = useRef<{ [key: string]: Howl }>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initialVolume = getSafeVolume(musicConfig.bgMusicVolume);
    const resolvedAudioUrl = normalizeAudioUrl(musicConfig.bgMusicUrl);

    if (!resolvedAudioUrl) {
      setAudioError("No background audio URL is configured.");
      return;
    }

    setAudioError(null);

    bgMusicRef.current = new Howl({
      src: [resolvedAudioUrl],
      html5: true,
      loop: true,
      volume: initialVolume,
      onload: () => setAudioError(null),
      onloaderror: (_id, error) => {
        console.error("Background audio failed to load", error);
        setAudioError(getAudioErrorMessage(resolvedAudioUrl));
      },
      onplayerror: (_id, error) => {
        console.error("Background audio play was blocked", error);
        setAudioError("Playback was blocked by the browser. Click play again after interacting with the page.");
      },
    });

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
  }, [musicConfig.bgMusicUrl, musicConfig.bgMusicVolume, musicConfig.clickSfx, musicConfig.giftOpenSfx, musicConfig.confettiSfx, musicConfig.fireworksSfx]);

  const playBgMusic = () => {
    if (!bgMusicRef.current) return;
    if (!bgMusicRef.current.playing()) {
      bgMusicRef.current.play();
      bgMusicRef.current.fade(0, volume, 2000);
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
    audioError,
    playBgMusic,
    pauseBgMusic,
    stopBgMusic,
    playSfx,
    toggleMute,
    volume,
    setVolume,
  };
}
