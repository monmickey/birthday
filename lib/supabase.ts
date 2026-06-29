import { createClient } from "@supabase/supabase-js";
import { BirthdayConfig, PhotoItem, WishItem, TimelineItem } from "@/config/types";
import defaultData from "@/config/birthday-config.json";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// LocalStorage Helper Keys
const LOCAL_STORAGE_KEY_PREFIX = "birthday_surprise_page_";

/** Read from localStorage (client-side only) */
export function readFromLocalStorage(slug: string): BirthdayConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${slug}`);
    return stored ? (JSON.parse(stored) as BirthdayConfig) : null;
  } catch {
    return null;
  }
}

/** Write to localStorage (client-side only) with QuotaExceeded fallback */
function writeToLocalStorage(slug: string, config: BirthdayConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(config));
  } catch (error) {
    console.warn("localStorage quota exceeded. Attempting to save configuration without large local files.", error);
    try {
      // Create a deep copy and strip large base64 strings to save space
      const strippedConfig = JSON.parse(JSON.stringify(config)) as BirthdayConfig;

      if (strippedConfig.music.bgMusicUrl?.startsWith("data:")) {
        strippedConfig.music.bgMusicUrl = "";
      }
      const sfxKeys: Array<keyof typeof strippedConfig.music> = ["clickSfx", "giftOpenSfx", "confettiSfx", "fireworksSfx"];
      sfxKeys.forEach((key) => {
        if (typeof strippedConfig.music[key] === "string" && strippedConfig.music[key].startsWith("data:")) {
          (strippedConfig.music as any)[key] = "";
        }
      });

      strippedConfig.photos = strippedConfig.photos.map((p) => ({
        ...p,
        url: p.url.startsWith("data:") ? "" : p.url,
      }));

      strippedConfig.timeline = strippedConfig.timeline.map((t) => ({
        ...t,
        image: t.image.startsWith("data:") ? "" : t.image,
      }));

      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(strippedConfig));
      console.log("Cached stripped text configuration successfully to localStorage.");
    } catch (innerError) {
      console.error("Failed to write stripped fallback to localStorage:", innerError);
    }
  }
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
// getBirthdayPage
// ============================================================
export async function getBirthdayPage(slug: string): Promise<BirthdayConfig> {
  // --- No Supabase configured: use localStorage ---
  if (!isSupabaseConfigured || !supabaseClient) {
    return readFromLocalStorage(slug) ?? buildDefault();
  }

  try {
    // 1. Fetch main page details
    const { data: page, error: pageError } = await supabaseClient
      .from("birthday_pages")
      .select("*")
      .eq("slug", slug)
      .single();

    if (pageError || !page) {
      // Table may not exist yet — fall back gracefully
      console.warn(`Supabase: slug "${slug}" not found. Falling back to localStorage/default.`);
      return readFromLocalStorage(slug) ?? buildDefault();
    }

    // 2, 3, 4. Fetch linked child tables in parallel using Promise.all to optimize load times
    const [photosResult, messagesResult, timelineResult] = await Promise.all([
      supabaseClient.from("photos").select("*").eq("page_id", page.id).order("created_at", { ascending: true }),
      supabaseClient.from("messages").select("*").eq("page_id", page.id).order("created_at", { ascending: true }),
      supabaseClient.from("timeline").select("*").eq("page_id", page.id).order("created_at", { ascending: true }),
    ]);

    const photos = photosResult.data || [];
    const messages = messagesResult.data || [];
    const timeline = timelineResult.data || [];

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
    console.error("Supabase load failed. Falling back to localStorage.", error?.message || error);
    // Always fall back to localStorage, never crash
    return readFromLocalStorage(slug) ?? buildDefault();
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
    writeToLocalStorage(slug, config);
    return true;
  }

  // Always mirror to localStorage as instant offline cache
  writeToLocalStorage(slug, config);

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
