"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  alpha: number;
  alphaSpeed: number;
  isStar: boolean;
}

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const colors = ["#a855f7", "#ec4899", "#3b82f6", "#d946ef", "#6366f1", "#fbcfe8", "#fef08a"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.25,
          speedY: (Math.random() - 0.5) * 0.25 - 0.15, // Upward movement
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.1,
          alphaSpeed: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
          isStar: Math.random() > 0.7,
        });
      }
    };

    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number, fillStyle: string, alpha: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      let step = Math.PI / spikes;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.restore();
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        if (p.isStar) {
          // Draw sparkling star
          drawStar(p.x, p.y, 4, p.size * 2, p.size * 0.8, p.color, p.alpha);
        } else {
          // Draw circular glowing particle
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
          gradient.addColorStop(0, p.color);
          gradient.addColorStop(1, "transparent");
          
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.restore();
        }

        // Update positions
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += p.alphaSpeed;

        if (p.alpha <= 0.1 || p.alpha >= 0.8) {
          p.alphaSpeed = -p.alphaSpeed;
        }

        p.alpha = Math.max(0.05, Math.min(0.8, p.alpha));

        // Wrap around borders
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawParticles();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
