"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import configData from "@/config/birthday-config.json";
import { TimelineItem } from "@/config/types";

export default function MemoryTimeline() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([]);

  useEffect(() => {
    setTimelineEvents(configData.timeline);
  }, []);

  return (
    <section className="py-24 relative z-10 px-4 max-w-4xl mx-auto">
      <div className="absolute top-[30%] left-[5%] w-80 h-80 rounded-full glow-spot-pink opacity-25 blur-3xl pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
          🗺️ Our Journey
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 text-white">
          Our Memory Timeline
        </h2>
        <p className="text-white/60 text-sm md:text-base mt-3 max-w-md mx-auto">
          Scroll down to revisit the milestone moments and chapters we've written together.
        </p>
      </motion.div>

      {/* Timeline Path */}
      <div className="relative">
        {/* Central glowing vertical line */}
        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary via-secondary to-accent opacity-50" />
        </div>

        {/* Timeline Items */}
        <div className="space-y-16">
          {timelineEvents.map((item, idx) => {
            const isEven = idx % 2 === 0;
            
            return (
              <div
                key={idx}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  isEven ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Timeline center bullet */}
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-4 border-dark-bg bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_rgba(236,72,153,0.6)] z-20" />

                {/* Left/Right Card slot */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? "md:pr-12 text-left md:text-right" : "md:pl-12 text-left"}`}>
                  <motion.div
                    initial={{
                      opacity: 0,
                      x: isEven ? 50 : -50,
                    }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, damping: 18 }}
                    className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl group hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Event Image */}
                    {item.image && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 relative bg-neutral-900 border border-white/5">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    {/* Date Tag */}
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 inline-block mb-3">
                      {item.date}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-tight">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 text-xs md:text-sm leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </motion.div>
                </div>

                {/* Empty side spacer for alignment on desktop */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
