"use client";

import React, { useEffect, useState, useRef } from "react";

interface TrailItem {
  id: number;
  x: number;
  y: number;
  char: string;
  size: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    // Detect mobile touch devices to hide cursor
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    checkTouch();

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);

      // Spawn a trail element occasionally
      if (Math.random() < 0.15) {
        const emojis = ["✨", "💖", "⭐", "🎉", "🎈"];
        const char = emojis[Math.floor(Math.random() * emojis.length)];
        const id = nextId.current++;
        setTrail((prev) => [
          ...prev,
          {
            id,
            x: e.clientX + (Math.random() - 0.5) * 15,
            y: e.clientY + (Math.random() - 0.5) * 15,
            char,
            size: Math.random() * 12 + 10,
          },
        ]);

        // Clean up trail item
        setTimeout(() => {
          setTrail((prev) => prev.filter((item) => item.id !== id));
        }, 1000);
      }
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.style.cursor === "pointer";
      
      setIsHovered(!!isClickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (isTouchDevice || isHidden) return null;

  return (
    <>
      {/* Target Cursor Ring */}
      <div
        className="custom-cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isHovered ? "40px" : "20px",
          height: isHovered ? "40px" : "20px",
          borderColor: isHovered ? "#ec4899" : "#a855f7",
          backgroundColor: isHovered ? "rgba(236,72,153,0.15)" : "transparent",
        }}
      />
      {/* Target Cursor Dot */}
      <div
        className="custom-cursor-dot"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
          backgroundColor: isHovered ? "#a855f7" : "#ec4899",
        }}
      />

      {/* Trailing Emojis */}
      {trail.map((item) => (
        <span
          key={item.id}
          className="fixed pointer-events-none select-none z-9999 text-center animate-fade-out"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            fontSize: `${item.size}px`,
            transform: "translate(-50%, -50%)",
            opacity: 0.8,
            animation: "trailFloat 1s forwards ease-out",
          }}
        >
          {item.char}
        </span>
      ))}

      <style jsx global>{`
        @keyframes trailFloat {
          0% {
            transform: translate(-50%, -50%) scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(0.2) translateY(-25px);
            opacity: 0;
          }
        }
        
        /* Hide native cursor for a custom-cursor vibe, but let clickable links keep pointer look */
        body, a, button, input {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
