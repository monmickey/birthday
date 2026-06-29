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
  if (trimmed.startsWith("data:")) return trimmed;

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

function getAudioFormat(url: string): string[] | undefined {
  if (url.startsWith("data:")) {
    const match = url.match(/^data:audio\/([^;]+);/);
    if (match && match[1]) {
      const ext = match[1].toLowerCase();
      if (ext === "mpeg" || ext === "mp3") return ["mp3"];
      if (ext === "wav" || ext === "wave" || ext === "x-wav") return ["wav"];
      if (ext === "ogg") return ["ogg"];
      if (ext === "aac") return ["aac"];
      if (ext === "m4a" || ext === "x-m4a") return ["m4a"];
      if (ext === "webm") return ["webm"];
      return [ext];
    }
  }
  return undefined;
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

    const isBase64 = resolvedAudioUrl.startsWith("data:");
    const formats = getAudioFormat(resolvedAudioUrl);

    bgMusicRef.current = new Howl({
      src: [resolvedAudioUrl],
      html5: !isBase64, // Disable HTML5 audio for base64 to avoid browser player limitations
      format: formats,
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

    // Handle sound effects (may be URL or base64)
    const sfxList = [
      { key: "click", url: musicConfig.clickSfx, volume: 0.5 },
      { key: "giftOpen", url: musicConfig.giftOpenSfx, volume: 0.6 },
      { key: "confetti", url: musicConfig.confettiSfx, volume: 0.5 },
      { key: "fireworks", url: musicConfig.fireworksSfx, volume: 0.4 },
    ];

    const sfxs: { [key: string]: Howl } = {};
    sfxList.forEach((sfx) => {
      if (sfx.url) {
        const isSfxBase64 = sfx.url.startsWith("data:");
        sfxs[sfx.key] = new Howl({
          src: [sfx.url],
          volume: sfx.volume,
          html5: !isSfxBase64,
          format: isSfxBase64 ? getAudioFormat(sfx.url) : undefined,
        });
      }
    });
    sfxRefs.current = sfxs;

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
