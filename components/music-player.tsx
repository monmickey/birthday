"use client";

import React from "react";
import { FaPlay, FaPause, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

interface MusicPlayerProps {
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

export default function MusicPlayer({
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
}: MusicPlayerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-full px-5 py-3 flex items-center gap-4 transition-all duration-300 hover:scale-105 hover:border-primary/40 shadow-lg select-none">
      {/* Sound Visualizer Waves */}
      {isPlaying && !isMuted && (
        <div className="flex items-end gap-[3.5px] h-4 w-6 px-1">
          <div className="w-[3px] bg-secondary rounded-full animate-bounce" style={{ height: "60%", animationDuration: "1s" }} />
          <div className="w-[3px] bg-primary rounded-full animate-bounce" style={{ height: "100%", animationDuration: "0.8s", animationDelay: "0.15s" }} />
          <div className="w-[3px] bg-accent rounded-full animate-bounce" style={{ height: "40%", animationDuration: "1.2s", animationDelay: "0.3s" }} />
          <div className="w-[3px] bg-secondary rounded-full animate-bounce" style={{ height: "80%", animationDuration: "0.9s", animationDelay: "0.05s" }} />
        </div>
      )}

      {/* Play/Pause Control */}
      <button
        onClick={onTogglePlay}
        className="text-white/80 hover:text-white transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label={isPlaying ? "Pause Music" : "Play Music"}
      >
        {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
      </button>

      {/* Mute Control */}
      <button
        onClick={onToggleMute}
        className="text-white/80 hover:text-white transition-colors duration-200 focus:outline-none cursor-pointer"
        aria-label={isMuted ? "Unmute Music" : "Mute Music"}
      >
        {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
      </button>

      <span className="text-xs text-white/50 font-bold uppercase tracking-widest">BGM</span>
    </div>
  );
}
