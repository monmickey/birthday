-- ============================================================
-- Birthday Surprise Website — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- Enable UUID extension (already on by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. birthday_pages
-- Main config record for each surprise page
-- ============================================================
CREATE TABLE IF NOT EXISTS birthday_pages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          TEXT UNIQUE NOT NULL,          -- e.g. "sophia", "default"
  recipient_name TEXT NOT NULL DEFAULT 'Friend',
  secret_code   TEXT NOT NULL DEFAULT '2026',   -- 4-digit keypad code
  birthday_date TEXT NOT NULL,                  -- ISO-like local datetime string
  theme         JSONB NOT NULL DEFAULT '{}',    -- ThemeConfig object
  music         JSONB NOT NULL DEFAULT '{}',    -- Music URLs object
  personal_letter JSONB NOT NULL DEFAULT '{}', -- PersonalLetterConfig object
  settings      JSONB NOT NULL DEFAULT '{}',    -- misc flags
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_birthday_pages_updated_at
BEFORE UPDATE ON birthday_pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 2. photos
-- Polaroid photos linked to a birthday page
-- ============================================================
CREATE TABLE IF NOT EXISTS photos (
  id          BIGSERIAL PRIMARY KEY,
  page_id     UUID REFERENCES birthday_pages(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,              -- base64 data URL or external URL
  title       TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  date        TEXT NOT NULL DEFAULT '',   -- display date string e.g. "2023"
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. messages (wishes wall)
-- Birthday wishes linked to a page
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         BIGSERIAL PRIMARY KEY,
  page_id    UUID REFERENCES birthday_pages(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  sender     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. timeline
-- Journey milestone entries linked to a page
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline (
  id          BIGSERIAL PRIMARY KEY,
  page_id     UUID REFERENCES birthday_pages(id) ON DELETE CASCADE,
  date        TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- Allow anyone with the anon key to read/write (for this app).
-- In production, tighten these policies.
-- ============================================================
ALTER TABLE birthday_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline        ENABLE ROW LEVEL SECURITY;

-- Allow full access via anon key (public app, no auth required)
CREATE POLICY "allow_all_birthday_pages" ON birthday_pages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_photos"         ON photos          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_messages"       ON messages        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_timeline"       ON timeline        FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Optional: seed a default page so the app works immediately
-- ============================================================
INSERT INTO birthday_pages (slug, recipient_name, secret_code, birthday_date, theme, music, personal_letter, settings)
VALUES (
  'default',
  'Sophia',
  '2026',
  '2026-07-01T00:00:00',
  '{
    "primaryColor": "#a855f7",
    "secondaryColor": "#ec4899",
    "accentColor": "#3b82f6",
    "backgroundGradient": ["#050215", "#12052c", "#20053a"],
    "fonts": { "primary": "Inter", "accent": "Playfair Display" }
  }',
  '{
    "bgMusicUrl": "",
    "giftOpenSfx": "",
    "clickSfx": "",
    "confettiSfx": "",
    "fireworksSfx": ""
  }',
  '{
    "paragraphs": [
      "Dear Sophia, today is your special day and I wanted to take a moment to tell you just how amazing you are.",
      "You light up every room you walk into and make every moment brighter just by being in it.",
      "I hope this birthday brings you all the joy, love, and happiness that you so generously give to everyone around you.",
      "Thank you for being you. Happy Birthday! 🎂"
    ],
    "signature": "With all my love ❤️"
  }',
  '{"animationsEnabled": true, "confettiEnabled": true, "fireworksEnabled": true}'
)
ON CONFLICT (slug) DO NOTHING;
