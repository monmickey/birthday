import { createClient } from "@supabase/supabase-js";
import { BirthdayConfig, PhotoItem, WishItem, TimelineItem } from "@/config/types";
import defaultData from "@/config/birthday-config.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Custom fetch wrapper with a timeout to prevent hanging connections (e.g., when Supabase is paused or offline)
const FETCH_TIMEOUT_MS = 4000; // 4 seconds

const fetchWithTimeout = (url: URL | RequestInfo, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => {
    console.warn(`[fetchWithTimeout] Request to ${url} timed out! Aborting...`);
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  console.log(`[fetchWithTimeout] Dispatching fetch to: ${url}`);
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).then((res) => {
    console.log(`[fetchWithTimeout] Response received from ${url}: Status ${res.status}`);
    return res;
  }).catch((err) => {
    console.error(`[fetchWithTimeout] Fetch to ${url} failed:`, err);
    throw err;
  }).finally(() => clearTimeout(id));
};

// Cache the Supabase client globally in development to prevent "Multiple GoTrueClient" warnings during HMR
const globalForSupabase = globalThis as unknown as {
  supabaseClient: any;
};

export const supabaseClient = globalForSupabase.supabaseClient || (
  isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          fetch: fetchWithTimeout,
        },
        auth: {
          persistSession: false, // Prevents local storage collisions and multiple GoTrueClient warnings since auth is not used
        },
      })
    : null
);

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseClient = supabaseClient;
}



/** Build the default config with correct secretCode */
function buildDefault(): BirthdayConfig {
  return {
    ...defaultData,
    secretCode: (defaultData as any).secretCode || "0541",
  } as BirthdayConfig;
}

function normalizeMusic(music: Partial<BirthdayConfig["music"]> | null | undefined): BirthdayConfig["music"] {
  const defaults = (defaultData as BirthdayConfig).music;

  return {
    ...defaults,
    ...(music || {}),
    bgMusicVolume:
      typeof music?.bgMusicVolume === "number"
        ? Math.min(1, Math.max(0, music.bgMusicVolume))
        : defaults.bgMusicVolume ?? 0.4,
  };
}

// ============================================================
// Test connection — returns true if tables are accessible
// ============================================================
export async function testSupabaseConnection(): Promise<{
  ok: boolean;
  message: string;
}> {
  if (!isSupabaseConfigured || !supabaseClient) {
    return { ok: false, message: "Supabase not configured (missing env variables)." };
  }
  try {
    const { error } = await supabaseClient
      .from("birthday_pages")
      .select("id")
      .limit(1);
    if (error) {
      return {
        ok: false,
        message: `DB error: ${error.message}. Run the SQL schema first.`,
      };
    }
    return { ok: true, message: "Connected to Supabase successfully!" };
  } catch (e: any) {
    return {
      ok: false,
      message: `Network error: ${e?.message || "Failed to fetch"}. Check your URL/key.`,
    };
  }
}

// ============================================================
// getBirthdayPageLight
// ============================================================
export async function getBirthdayPageLight(slug: string): Promise<BirthdayConfig> {
  console.log(`[getBirthdayPageLight] Called for slug: "${slug}"`);
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log(`[getBirthdayPageLight] Supabase not configured. Using fallback config.`);
    return buildDefault();
  }

  try {
    console.log(`[getBirthdayPageLight] Fetching main page row from Supabase (light)...`);
    const { data: page, error: pageError } = await supabaseClient
      .from("birthday_pages")
      .select("id, slug, recipient_name, secret_code, birthday_date, theme, personal_letter, settings")
      .eq("slug", slug)
      .single();

    if (pageError || !page) {
      console.warn(`[getBirthdayPageLight] Page row not found or error. pageError:`, pageError);
      return buildDefault();
    }

    return {
      recipientName: page.recipient_name,
      secretCode: page.secret_code || "0541",
      birthdayDate: page.birthday_date,
      theme: page.theme,
      music: normalizeMusic(null), // Empty music to bypass huge base64 payload
      photos: [],
      wishes: [],
      timeline: [],
      personalLetter: page.personal_letter,
      cakeStyle: {
        layers: page.theme?.layers || 3,
        frostingColor: page.theme?.frostingColor || "#ec4899",
        candleCount: page.theme?.candleCount || 5,
      },
    };
  } catch (error: any) {
    console.error("[getBirthdayPageLight] Exception caught:", error?.message || error);
    return buildDefault();
  }
}

// ============================================================
// getBirthdayPage
// ============================================================
export async function getBirthdayPage(slug: string): Promise<BirthdayConfig> {
  console.log(`[getBirthdayPage] Called for slug: "${slug}"`);
  // --- No Supabase configured: use fallback config ---
  if (!isSupabaseConfigured || !supabaseClient) {
    console.log(`[getBirthdayPage] Supabase not configured. Using fallback config.`);
    return buildDefault();
  }

  try {
    console.log(`[getBirthdayPage] Fetching main page and child tables in a single joined query...`);
    const { data: page, error: pageError } = await supabaseClient
      .from("birthday_pages")
      .select(`
        id,
        recipient_name,
        secret_code,
        birthday_date,
        theme,
        music,
        personal_letter,
        photos(id, url, title, description, date),
        messages(text, sender),
        timeline(date, title, description, image)
      `)
      .eq("slug", slug)
      .order("created_at", { referencedTable: "photos", ascending: true })
      .order("created_at", { referencedTable: "messages", ascending: true })
      .order("created_at", { referencedTable: "timeline", ascending: true })
      .single();

    if (pageError || !page) {
      console.warn(`[getBirthdayPage] Page row not found or error. pageError:`, pageError);
      return buildDefault();
    }

    const photos = page.photos || [];
    const messages = page.messages || [];
    const timeline = page.timeline || [];
    console.log(`[getBirthdayPage] Combined data fetched successfully. Photos: ${photos.length}, Wishes: ${messages.length}, Timeline: ${timeline.length}`);

    return {
      recipientName: page.recipient_name,
      secretCode: page.secret_code || "0541",
      birthdayDate: page.birthday_date,
      theme: page.theme,
      music: normalizeMusic(page.music),
      photos: (photos || []).map((p: any) => ({
        id: p.id,
        url: p.url,
        title: p.title || "",
        description: p.description || "",
        date: p.date || "",
      })),
      wishes: (messages || []).map((m: any) => ({
        text: m.text,
        sender: m.sender,
      })),
      timeline: (timeline || []).map((t: any) => ({
        date: t.date,
        title: t.title,
        description: t.description,
        image: t.image || "",
      })),
      personalLetter: page.personal_letter,
      cakeStyle: {
        layers: page.theme?.layers || 3,
        frostingColor: page.theme?.frostingColor || "#ec4899",
        candleCount: page.theme?.candleCount || 5,
      },
    };
  } catch (error: any) {
    console.error("[getBirthdayPage] Exception caught:", error?.message || error);
    return buildDefault();
  }
}

// ============================================================
// saveBirthdayPage
// ============================================================
export async function saveBirthdayPage(
  slug: string,
  config: BirthdayConfig
): Promise<boolean> {
  // --- No Supabase configured: save to localStorage only ---
  if (!isSupabaseConfigured || !supabaseClient) {
    console.error("Supabase not configured. Cannot save.");
    return false;
  }

  try {
    const pagePayload = {
      slug,
      recipient_name: config.recipientName,
      secret_code: config.secretCode || "0541",
      birthday_date: config.birthdayDate,
      theme: config.theme,
      music: config.music,
      settings: {
        animationsEnabled: true,
        confettiEnabled: true,
        fireworksEnabled: true,
      },
      personal_letter: config.personalLetter,
    };

    // Upsert the main page row
    const { data: upserted, error: upsertError } = await supabaseClient
      .from("birthday_pages")
      .upsert(pagePayload, { onConflict: "slug" })
      .select("id")
      .single();

    if (upsertError || !upserted) {
      console.error("Supabase upsert failed:", upsertError?.message);
      return false;
    }

    const pageId = upserted.id;

    // Refresh photos
    await supabaseClient.from("photos").delete().eq("page_id", pageId);
    if (config.photos.length > 0) {
      const { error: photoErr } = await supabaseClient.from("photos").insert(
        config.photos.map((p) => ({
          page_id: pageId,
          url: p.url,
          title: p.title,
          description: p.description,
          date: p.date,
        }))
      );
      if (photoErr) throw photoErr;
    }

    // Refresh wishes/messages
    await supabaseClient.from("messages").delete().eq("page_id", pageId);
    if (config.wishes.length > 0) {
      const { error: wishErr } = await supabaseClient.from("messages").insert(
        config.wishes.map((w) => ({
          page_id: pageId,
          text: w.text,
          sender: w.sender,
        }))
      );
      if (wishErr) throw wishErr;
    }

    // Refresh timeline
    await supabaseClient.from("timeline").delete().eq("page_id", pageId);
    if (config.timeline.length > 0) {
      const { error: timeErr } = await supabaseClient.from("timeline").insert(
        config.timeline.map((t) => ({
          page_id: pageId,
          date: t.date,
          title: t.title,
          description: t.description,
          image: t.image,
        }))
      );
      if (timeErr) throw timeErr;
    }

    return true;
  } catch (error: any) {
    console.error("Supabase save failed:", error?.message || error);
    return false;
  }
}
