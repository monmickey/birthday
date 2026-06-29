"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaLink, FaQrcode, FaRedo, FaDownload, FaTimes } from "react-icons/fa";
import confetti from "canvas-confetti";

interface FinalCelebrationProps {
  recipientName: string;
  onReplay: () => void;
  playSfx: (type: "click" | "fireworks" | "confetti") => void;
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  gravity: number;
  fade: number;
}

interface Rocket {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  color: string;
}

export default function FinalCelebration({ recipientName, onReplay, playSfx }: FinalCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareLink(window.location.href);
    }
  }, []);

  // Continuous Fireworks + click triggers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: FireworkParticle[] = [];
    let rockets: Rocket[] = [];
    const colors = ["#ff007f", "#ec4899", "#a855f7", "#3b82f6", "#00f0ff", "#fbbf24"];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createExplosion = (x: number, y: number, color: string) => {
      playSfx("fireworks");
      const count = 70;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: Math.random() * 2 + 1,
          gravity: 0.05,
          fade: Math.random() * 0.015 + 0.01,
        });
      }
    };

    const launchRocket = (tx?: number, ty?: number) => {
      const startX = Math.random() * canvas.width;
      const targetX = tx ?? Math.random() * canvas.width;
      const targetY = ty ?? Math.random() * (canvas.height * 0.5) + canvas.height * 0.1;
      
      const dx = targetX - startX;
      const dy = targetY - canvas.height;
      const angle = Math.atan2(dy, dx);
      const speed = Math.random() * 5 + 10;

      rockets.push({
        x: startX,
        y: canvas.height,
        tx: targetX,
        ty: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const draw = () => {
      ctx.fillStyle = "rgba(5, 2, 21, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rockets
      rockets.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        r.x += r.vx;
        r.y += r.vy;

        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - r.vx * 2, r.y - r.vy * 2);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (r.vy >= 0 || r.y <= r.ty) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(idx, 1);
        }
      });

      // Explosion Particles
      particles.forEach((p, idx) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.fade;

        if (p.alpha <= 0) {
          particles.splice(idx, 1);
        }
      });

      // Spawn rockets randomly
      if (Math.random() < 0.035 && rockets.length < 5) {
        launchRocket();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    draw();

    const handleCanvasClick = (e: MouseEvent) => {
      launchRocket(e.clientX, e.clientY);
    };
    canvas.addEventListener("click", handleCanvasClick);

    // Initial rockets splash
    for (let i = 0; i < 3; i++) {
      setTimeout(() => launchRocket(), i * 600);
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [playSfx]);

  const handleCopyLink = () => {
    playSfx("click");
    navigator.clipboard.writeText(shareLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleWhatsAppShare = () => {
    playSfx("click");
    const text = encodeURIComponent(
      `Hey! Check out this premium Birthday Surprise made for you! 💖: ${shareLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Compile a beautiful downloadable HTML booklet of their memories
  const handleDownloadMemories = () => {
    playSfx("click");
    
    // Create basic styling and layout booklet
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Happy Birthday Sophia - Memory Journal</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #050215; color: #f3f4f6; padding: 40px 20px; text-align: center; }
          .container { max-width: 800px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; padding: 40px; }
          h1 { color: #ec4899; margin-bottom: 30px; }
          .memory-card { border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding: 20px 0; text-align: left; }
          .memory-date { font-weight: bold; color: #a855f7; }
          .memory-title { font-size: 20px; font-weight: bold; margin: 8px 0; }
          .memory-desc { color: rgba(255, 255, 255, 0.7); line-height: 1.6; }
          .footer { margin-top: 40px; font-size: 14px; color: rgba(255, 255, 255, 0.4); }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Happy Birthday, ${recipientName}! 💖</h1>
          <p>This is a digital journal of your special memories. Print or save this page to cherish them forever.</p>
          
          <div class="memory-card">
            <div class="memory-date">A Special Letter</div>
            <div class="memory-title">To ${recipientName}</div>
            <p class="memory-desc">Wishing you a year filled with infinite smiles and beautiful moments! Thank you for bringing so much light into all of our lives. You deserve all the happiness this universe has to offer.</p>
          </div>
          
          <div class="footer">
            Made with love • ${new Date().toLocaleDateString()}
          </div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${recipientName}-birthday-memories.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden z-10 select-none py-16 px-4">
      {/* Background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-auto z-0" />

      {/* Floating Elements (hearts, stars) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "110vh", opacity: 0.8 }}
            animate={{ y: "-10vh", x: [0, i % 2 === 0 ? 15 : -15, 0] }}
            transition={{
              y: { duration: 15 + i * 2, repeat: Infinity, ease: "linear", delay: i * 2 },
              x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="absolute text-3xl select-none"
            style={{ left: `${10 + i * 15}%` }}
          >
            {i % 2 === 0 ? "💖" : "🎈"}
          </motion.div>
        ))}
      </div>

      {/* Center panel */}
      <div className="relative z-10 max-w-xl text-center pointer-events-none w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="glass-panel p-8 md:p-12 rounded-[2.5rem] border border-pink-500/20 shadow-[0_20px_50px_rgba(236,72,153,0.25)] flex flex-col items-center gap-6"
        >
          {/* Pulsing visual */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-4xl shadow-xl"
          >
            🎉
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Happy Birthday,
            <br />
            <span className="text-gradient-purple-pink drop-shadow-[0_0_25px_rgba(236,72,153,0.45)]">
              {recipientName}!
            </span>
          </h2>

          <p className="text-sm md:text-base text-white/70 max-w-sm font-medium leading-relaxed">
            I hope this surprise experience brought a big smile to your face. Wishing you the most magical and beautiful year ahead!
          </p>

          {/* Interactive controls (pointer events auto) */}
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playSfx("click");
                setShowShareModal(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all cursor-pointer"
            >
              <FaWhatsapp size={16} className="text-emerald-400" /> Share Wishes
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReplay}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <FaRedo size={12} /> Play Surprise Again
            </motion.button>
          </div>

          <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest pointer-events-none mt-2">
            Click anywhere to launch custom fireworks 🎆
          </span>
        </motion.div>
      </div>

      {/* Share / QR Code Modal Overlay */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel max-w-sm w-full p-8 rounded-3xl border border-white/10 shadow-2xl relative flex flex-col items-center text-center gap-6"
            >
              <button
                onClick={() => {
                  playSfx("click");
                  setShowShareModal(false);
                }}
                className="absolute top-4 right-4 text-white/50 hover:text-white cursor-pointer"
              >
                <FaTimes size={16} />
              </button>

              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-xl text-primary mb-2">
                🔗
              </div>

              <h3 className="text-xl font-bold text-white">Share This Surprise</h3>
              <p className="text-xs text-white/60">
                Share this magical layout with friends so they can witness the birthday celebration!
              </p>

              {/* QR Code */}
              <div className="bg-white p-3 rounded-2xl shadow-lg border border-white/15">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(shareLink)}`}
                  alt="QR Code"
                  loading="lazy"
                  decoding="async"
                  className="w-32 h-32"
                />
              </div>

              <div className="flex flex-col gap-2.5 w-full mt-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <FaWhatsapp size={14} /> Send via WhatsApp
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/5 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <FaLink size={12} /> {copySuccess ? "Link Copied!" : "Copy Surprise Link"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
