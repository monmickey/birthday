"use client";

import React, { useState, useEffect } from "react";
import { FaHome, FaImage, FaHeart, FaMusic, FaCheck, FaTrash, FaLink, FaCalendarAlt, FaSlidersH, FaUser, FaKey, FaEye, FaEyeSlash, FaVolumeUp } from "react-icons/fa";
import { getBirthdayPage, saveBirthdayPage } from "@/lib/supabase";
import { formatDateTimeLocalValue } from "@/lib/date";
import { BirthdayConfig, PhotoItem, WishItem, TimelineItem } from "@/config/types";

type TabType = "general" | "photos" | "timeline" | "wishes" | "letter" | "theme" | "settings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [slug, setSlug] = useState("default");
  const [config, setConfig] = useState<BirthdayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showSecretCode, setShowSecretCode] = useState(false);

  // For adding new items
  const [newPhoto, setNewPhoto] = useState<Partial<PhotoItem>>({ title: "", description: "", date: "" });
  const [newTimeline, setNewTimeline] = useState<Partial<TimelineItem>>({ date: "", title: "", description: "" });
  const [newWish, setNewWish] = useState<Partial<WishItem>>({ text: "", sender: "" });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getBirthdayPage(slug);
      setConfig(data);
      setLoading(false);
    }
    loadData();
  }, [slug]);

  const handleSave = async () => {
    if (!config) return;
    if (!/^\d{4}$/.test(config.secretCode || "")) {
      alert("Secret passcode must be exactly 4 digits.");
      return;
    }
    setSaving(true);
    setSaveSuccess(false);
    const success = await saveBirthdayPage(slug, config);
    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert("Failed to save configuration.");
    }
  };

  // Helper to convert files to base64
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "timeline"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "photo") {
        setNewPhoto((prev) => ({ ...prev, url: base64String }));
      } else {
        setNewTimeline((prev) => ({ ...prev, image: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to convert & save local audio files to base64
  const handleAudioUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetKey: "bgMusicUrl" | "clickSfx" | "giftOpenSfx" | "confettiSfx" | "fireworksSfx"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Audio file is quite large (over 8MB). Uploading may take longer and hit storage limits.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (config) {
        setConfig({
          ...config,
          music: {
            ...config.music,
            [targetKey]: base64String,
          },
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Photo management
  const addPhoto = () => {
    if (!config || !newPhoto.url) return;
    const item: PhotoItem = {
      id: Date.now(),
      url: newPhoto.url,
      title: newPhoto.title || "Untitled",
      description: newPhoto.description || "",
      date: newPhoto.date || new Date().getFullYear().toString(),
    };
    setConfig({
      ...config,
      photos: [...config.photos, item],
    });
    setNewPhoto({ title: "", description: "", date: "" });
  };

  const removePhoto = (id: number) => {
    if (!config) return;
    setConfig({
      ...config,
      photos: config.photos.filter((p) => p.id !== id),
    });
  };

  // Timeline management
  const addTimeline = () => {
    if (!config || !newTimeline.title || !newTimeline.date) return;
    const item: TimelineItem = {
      date: newTimeline.date,
      title: newTimeline.title,
      description: newTimeline.description || "",
      image: newTimeline.image || "",
    };
    setConfig({
      ...config,
      timeline: [...config.timeline, item],
    });
    setNewTimeline({ date: "", title: "", description: "" });
  };

  const removeTimeline = (idx: number) => {
    if (!config) return;
    setConfig({
      ...config,
      timeline: config.timeline.filter((_, i) => i !== idx),
    });
  };

  // Wishes management
  const addWish = () => {
    if (!config || !newWish.text || !newWish.sender) return;
    const item: WishItem = {
      text: newWish.text,
      sender: newWish.sender,
    };
    setConfig({
      ...config,
      wishes: [...config.wishes, item],
    });
    setNewWish({ text: "", sender: "" });
  };

  const removeWish = (idx: number) => {
    if (!config) return;
    setConfig({
      ...config,
      wishes: config.wishes.filter((_, i) => i !== idx),
    });
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-[#050215] flex items-center justify-center text-white/50 text-sm">
        Loading Admin Configurations...
      </div>
    );
  }

  const birthdayDateTime = formatDateTimeLocalValue(config.birthdayDate);
  const [birthdayDateValue, birthdayTimeValue] = birthdayDateTime.split("T");

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-[#0a0522] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-xl">🛠️</span>
            <span className="text-sm font-extrabold uppercase tracking-widest text-white">
              Surprise Admin
            </span>
          </div>

          {/* Quick Slug Switcher */}
          <div className="mb-8">
            <label className="text-[10px] uppercase font-bold tracking-widest text-white/40 block mb-2">
              Surprise Page Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary font-mono"
              placeholder="e.g. sophia"
            />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: "general", label: "General", icon: <FaUser /> },
              { id: "photos", label: "Polaroids", icon: <FaImage /> },
              { id: "timeline", label: "Journey Timeline", icon: <FaCalendarAlt /> },
              { id: "wishes", label: "Wishes Wall", icon: <FaHeart /> },
              { id: "letter", label: "Message Letter", icon: <FaHome /> },
              { id: "theme", label: "Theme & Music", icon: <FaMusic /> },
              { id: "settings", label: "Passcode & Toggles", icon: <FaSlidersH /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 text-xs font-bold tracking-wider uppercase transition-all text-left ${activeTab === tab.id
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Global Save Button */}
        <div className="mt-8 md:mt-0 space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs tracking-wider uppercase shadow-lg cursor-pointer flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50"
          >
            {saving ? (
              "Saving..."
            ) : saveSuccess ? (
              <>
                <FaCheck /> Saved Page
              </>
            ) : (
              "Save Configuration"
            )}
          </button>

          {/* Visit Live Link */}
          <a
            href={`/birthday/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-xl border border-white/10 text-white/80 hover:text-white font-bold text-[10px] tracking-wider uppercase flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10"
          >
            <FaLink /> View Live Page
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Info */}
          <div className="mb-10 flex flex-col md:flex-row md:items-baseline justify-between gap-2 pb-6 border-b border-white/5">
            <h1 className="text-2xl md:text-3xl font-black text-white capitalize">
              {activeTab} Settings
            </h1>
            <span className="text-xs text-white/40 font-mono">
              Configuring URL: /birthday/{slug}
            </span>
          </div>

          {/* Tab content conditional rendering */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-white/50 block mb-2">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={config.recipientName}
                  onChange={(e) => setConfig({ ...config, recipientName: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-white/50 block mb-2">
                  Birthday Date & Time
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/35 block mb-2">
                      Date
                    </span>
                    <input
                      type="date"
                      value={birthdayDateValue || ""}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        setConfig({
                          ...config,
                          birthdayDate: `${e.target.value}T${birthdayTimeValue || "00:00"}`,
                        });
                      }}
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-semibold [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/35 block mb-2">
                      Time
                    </span>
                    <input
                      type="time"
                      value={birthdayTimeValue || "00:00"}
                      onChange={(e) => {
                        if (!e.target.value) return;
                        setConfig({
                          ...config,
                          birthdayDate: `${birthdayDateValue || new Date().toISOString().slice(0, 10)}T${e.target.value}`,
                        });
                      }}
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-semibold [color-scheme:dark]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 mt-2">
                  Countdown uses this exact local date and time.
                </p>
              </div>
            </div>
          )}

          {activeTab === "photos" && (
            <div className="space-y-8">
              {/* Add photo card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add Polaroid Photo</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Date / Year"
                    value={newPhoto.date}
                    onChange={(e) => setNewPhoto({ ...newPhoto, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none"
                  />
                </div>

                <textarea
                  placeholder="Short Description"
                  value={newPhoto.description}
                  onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none h-20"
                />

                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "photo")}
                    className="w-full text-xs text-white/55 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90 file:cursor-pointer"
                  />

                  {newPhoto.url && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                      <img src={newPhoto.url} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <button
                    onClick={addPhoto}
                    className="py-2.5 px-6 rounded-xl bg-accent text-white font-bold text-xs uppercase cursor-pointer hover:bg-opacity-95"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Photo list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Current Photos ({config.photos.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.photos.map((photo) => (
                    <div key={photo.id} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5 gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                          <img src={photo.url} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{photo.title}</h4>
                          <span className="text-[10px] text-white/40 block mt-0.5">{photo.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="text-white/40 hover:text-red-400 p-2 cursor-pointer transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-8">
              {/* Add milestone */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add Journey Milestone</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Milestone Date (e.g. May 25, 2025)"
                    value={newTimeline.date}
                    onChange={(e) => setNewTimeline({ ...newTimeline, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={newTimeline.title}
                    onChange={(e) => setNewTimeline({ ...newTimeline, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none"
                  />
                </div>

                <textarea
                  placeholder="Milestone Description"
                  value={newTimeline.description}
                  onChange={(e) => setNewTimeline({ ...newTimeline, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none h-20"
                />

                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "timeline")}
                    className="w-full text-xs text-white/55 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:opacity-90 file:cursor-pointer"
                  />

                  {newTimeline.image && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10">
                      <img src={newTimeline.image} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <button
                    onClick={addTimeline}
                    className="py-2.5 px-6 rounded-xl bg-accent text-white font-bold text-xs uppercase cursor-pointer hover:bg-opacity-95"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Milestones list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Current Milestones ({config.timeline.length})</h3>
                <div className="space-y-3">
                  {config.timeline.map((item, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/5 gap-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                            <img src={item.image} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{item.title}</h4>
                          <span className="text-[10px] text-white/40 block mt-0.5">{item.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTimeline(idx)}
                        className="text-white/40 hover:text-red-400 p-2 cursor-pointer transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "wishes" && (
            <div className="space-y-8">
              {/* Add wish */}
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add Birthday Wish Card</h3>

                <input
                  type="text"
                  placeholder="Sender Name (e.g. Alex)"
                  value={newWish.sender}
                  onChange={(e) => setNewWish({ ...newWish, sender: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none"
                />

                <textarea
                  placeholder="Greeting / Wish Message"
                  value={newWish.text}
                  onChange={(e) => setNewWish({ ...newWish, text: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs focus:outline-none h-20"
                />

                <button
                  onClick={addWish}
                  className="py-2.5 px-6 rounded-xl bg-accent text-white font-bold text-xs uppercase cursor-pointer hover:bg-opacity-95 block ml-auto"
                >
                  Add Card
                </button>
              </div>

              {/* Wishes list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Current wishes ({config.wishes.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.wishes.map((item, idx) => (
                    <div key={idx} className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-white/5 gap-3 h-32 text-left">
                      <p className="text-xs text-white/80 line-clamp-3">&quot;{item.text}&quot;</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] font-bold text-gradient-purple-pink">— {item.sender}</span>
                        <button
                          onClick={() => removeWish(idx)}
                          className="text-white/40 hover:text-red-400 p-1 cursor-pointer transition-colors"
                        >
                          <FaTrash size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "letter" && (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-white/50 block mb-2">
                  Message Paragraphs (Split by line breaks)
                </label>
                <textarea
                  value={config.personalLetter.paragraphs.join("\n\n")}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      personalLetter: {
                        ...config.personalLetter,
                        paragraphs: e.target.value.split("\n\n").filter(Boolean),
                      },
                    })
                  }
                  className="w-full h-80 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm leading-relaxed"
                  placeholder="Enter message. Use double-newline to start a new paragraph."
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-white/50 block mb-2">
                  Signature Label
                </label>
                <input
                  type="text"
                  value={config.personalLetter.signature}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      personalLetter: {
                        ...config.personalLetter,
                        signature: e.target.value,
                      },
                    })
                  }
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block mb-2">
                    Primary Accent
                  </label>
                  <input
                    type="color"
                    value={config.theme.primaryColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        theme: { ...config.theme, primaryColor: e.target.value },
                      })
                    }
                    className="w-full h-10 rounded-xl bg-white/5 border border-white/10 p-1 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block mb-2">
                    Secondary Accent
                  </label>
                  <input
                    type="color"
                    value={config.theme.secondaryColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        theme: { ...config.theme, secondaryColor: e.target.value },
                      })
                    }
                    className="w-full h-10 rounded-xl bg-white/5 border border-white/10 p-1 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block mb-2">
                    Third Accent
                  </label>
                  <input
                    type="color"
                    value={config.theme.accentColor}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        theme: { ...config.theme, accentColor: e.target.value },
                      })
                    }
                    className="w-full h-10 rounded-xl bg-white/5 border border-white/10 p-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-white/50 block mb-2">
                  Cake Layers count
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={config.cakeStyle.layers}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      cakeStyle: { ...config.cakeStyle, layers: parseInt(e.target.value) || 3 },
                    })
                  }
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-semibold"
                />
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/15 border border-secondary/20 text-secondary flex items-center justify-center">
                    <FaMusic size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Music Setup</h3>
                    <p className="text-xs text-white/50 mt-1">Choose the background track and the starting volume for visitors.</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/50 block">
                      Background Music Audio URL / File
                    </label>
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold uppercase">
                      Supports URL or Local File
                    </span>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={config.music.bgMusicUrl?.startsWith("data:") ? "[Uploaded Local Audio File]" : config.music.bgMusicUrl || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          music: { ...config.music, bgMusicUrl: e.target.value },
                        })
                      }
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-mono"
                      placeholder="https://example.com/song.mp3 or upload below"
                    />
                    <div className="flex items-center gap-3">
                      <label className="flex-1 py-3 px-4 rounded-xl border border-dashed border-white/10 hover:border-primary/50 bg-white/5 text-center text-xs font-bold text-white/60 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-2">
                        <span>📤 Upload Local Audio File</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioUpload(e, "bgMusicUrl")}
                          className="hidden"
                        />
                      </label>
                      {config.music.bgMusicUrl?.startsWith("data:") && (
                        <button
                          type="button"
                          onClick={() => setConfig({ ...config, music: { ...config.music, bgMusicUrl: "" } })}
                          className="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 font-bold text-xs uppercase cursor-pointer transition-all"
                        >
                          Clear File
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-white/40 mt-2">
                    Use a direct audio file URL such as MP3, WAV, or OGG, or upload a local file. YouTube watch links will not play.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <label className="text-xs uppercase font-bold tracking-widest text-white/50">
                      Default Music Volume
                    </label>
                    <span className="text-xs text-white/70 font-mono flex items-center gap-2">
                      <FaVolumeUp size={12} />
                      {Math.round((config.music.bgMusicVolume ?? 0.4) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((config.music.bgMusicVolume ?? 0.4) * 100)}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        music: {
                          ...config.music,
                          bgMusicVolume: Number(e.target.value) / 100,
                        },
                      })
                    }
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    { label: "Click SFX", key: "clickSfx" },
                    { label: "Gift Open SFX", key: "giftOpenSfx" },
                    { label: "Confetti SFX", key: "confettiSfx" },
                    { label: "Fireworks SFX", key: "fireworksSfx" },
                  ].map((item) => {
                    const value = config.music[item.key as keyof typeof config.music] as string;
                    const isBase64 = value?.startsWith("data:");
                    return (
                      <div key={item.key} className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/45 block mb-1">
                          {item.label}
                        </label>
                        <input
                          type="text"
                          value={isBase64 ? "[Uploaded Local SFX File]" : value || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              music: { ...config.music, [item.key]: e.target.value },
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-xs font-mono"
                          placeholder="Paste URL or upload below"
                        />
                        <div className="flex gap-2">
                          <label className="flex-1 py-2 px-3 rounded-lg border border-dashed border-white/10 hover:border-primary/50 bg-white/5 text-center text-[10px] font-bold text-white/50 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-1.5">
                            <span>📤 Upload File</span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleAudioUpload(e, item.key as any)}
                              className="hidden"
                            />
                          </label>
                          {isBase64 && (
                            <button
                              type="button"
                              onClick={() =>
                                setConfig({
                                  ...config,
                                  music: { ...config.music, [item.key]: "" },
                                })
                              }
                              className="px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 font-bold text-[10px] uppercase cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center">
                    <FaKey size={14} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Secret Passcode</h3>
                    <p className="text-xs text-white/50 mt-1">This is the 4-digit code visitors enter before opening the surprise page.</p>
                  </div>
                </div>

                <div className="max-w-sm">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-white/50 block mb-2">
                    Page Password
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showSecretCode ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={config.secretCode || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          secretCode: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary text-sm font-mono tracking-[0.45em]"
                      placeholder="0000"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretCode((value) => !value)}
                      aria-label={showSecretCode ? "Hide passcode" : "Show passcode"}
                      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/65 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      {showSecretCode ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40 mt-2">
                    Use exactly 4 digits so it matches the keypad on the birthday page.
                  </p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Surprise Page Features</h3>
                <p className="text-xs text-white/50">Configure interactive effects running across sections.</p>

                <div className="space-y-3.5 pt-2">
                  {[
                    { label: "Enable Confetti Explosions", key: "confetti" },
                    { label: "Enable Finale Fireworks", key: "fireworks" },
                    { label: "Enable Drifting Background Elements", key: "decorations" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <span className="text-xs font-semibold text-white/80">{item.label}</span>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <div className="w-9 h-5 bg-white/10 rounded-full border border-white/15 relative">
                          <div className="w-4 h-4 bg-primary rounded-full absolute top-[1px] right-[1px]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
