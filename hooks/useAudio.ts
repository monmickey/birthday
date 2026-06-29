"use client";

/**
 * Optimized no-op Audio hook.
 * Removed all audio initialization, Howler loading, and sound playback to completely
 * remove audio capabilities from the application while maintaining React component prop compatibility.
 * 
 * Supports optional arguments to remain compatible with existing call sites.
 */
export function useAudio(_config?: any) {
  return {
    isPlayingBg: false,
    isMuted: true,
    audioError: null,
    playBgMusic: () => {},
    pauseBgMusic: () => {},
    stopBgMusic: () => {},
    playSfx: (_type?: any) => {},
    toggleMute: () => {},
    volume: 0,
    setVolume: () => {},
  };
}
