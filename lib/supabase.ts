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

/**
 * Gets a complete BirthdayConfig for a given slug.
 * Resolves from Supabase if configured, or falls back to localStorage/defaultData.
 */
export async function getBirthdayPage(slug: string): Promise<BirthdayConfig> {
  if (!isSupabaseConfigured || !supabaseClient) {
    console.warn("Supabase not configured. Falling back to local storage.");
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${slug}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Error parsing local storage data", e);
        }
      }
    }
    // Return default template data
    return {
      ...defaultData,
      recipientName: defaultData.recipientName,
    } as BirthdayConfig;
  }

  try {
    // 1. Fetch main page details
    const { data: page, error: pageError } = await supabaseClient
      .from("birthday_pages")
      .select("*")
      .eq("slug", slug)
      .single();

    if (pageError || !page) {
      console.warn(`Slug "${slug}" not found in Supabase. Returning template fallback.`);
      return defaultData as BirthdayConfig;
    }

    // 2. Fetch linked photos
    const { data: photos, error: photosError } = await supabaseClient
      .from("photos")
      .select("*")
      .eq("page_id", page.id)
      .order("created_at", { ascending: true });

    // 3. Fetch linked wishes/messages
    const { data: messages, error: messagesError } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("page_id", page.id)
      .order("created_at", { ascending: true });

    // 4. Fetch linked timeline milestones
    const { data: timeline, error: timelineError } = await supabaseClient
      .from("timeline")
      .select("*")
      .eq("page_id", page.id)
      .order("created_at", { ascending: true });

    // Combine database table structures into BirthdayConfig interface
    return {
      recipientName: page.recipient_name,
      birthdayDate: page.birthday_date,
      theme: page.theme,
      music: page.music,
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
        layers: page.theme.layers || 3,
        frostingColor: page.theme.frostingColor || "#ec4899",
        candleCount: page.theme.candleCount || 5,
      },
    };
  } catch (error) {
    console.error("Supabase load failed. Falling back to default data.", error);
    return defaultData as BirthdayConfig;
  }
}

/**
 * Saves a complete BirthdayConfig for a given slug.
 * Resolves to Supabase if configured, or falls back to localStorage.
 */
export async function saveBirthdayPage(slug: string, config: BirthdayConfig): Promise<boolean> {
  if (!isSupabaseConfigured || !supabaseClient) {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${slug}`, JSON.stringify(config));
      // Also write to default to sync fallback
      if (slug === "default") {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}default`, JSON.stringify(config));
      }
      return true;
    }
    return false;
  }

  try {
    // 1. Insert or update the birthday_pages table
    const pagePayload = {
      slug,
      recipient_name: config.recipientName,
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

    // Check if page already exists
    const { data: existingPage } = await supabaseClient
      .from("birthday_pages")
      .select("id")
      .eq("slug", slug)
      .single();

    let pageId = existingPage?.id;

    if (pageId) {
      const { error: updateError } = await supabaseClient
        .from("birthday_pages")
        .update(pagePayload)
        .eq("id", pageId);

      if (updateError) throw updateError;
    } else {
      const { data: newPage, error: insertError } = await supabaseClient
        .from("birthday_pages")
        .insert(pagePayload)
        .select("id")
        .single();

      if (insertError) throw insertError;
      pageId = newPage.id;
    }

    // 2. Refresh photos
    await supabaseClient.from("photos").delete().eq("page_id", pageId);
    if (config.photos.length > 0) {
      const photosPayload = config.photos.map((p) => ({
        page_id: pageId,
        url: p.url,
        title: p.title,
        description: p.description,
        date: p.date,
      }));
      const { error: photoErr } = await supabaseClient.from("photos").insert(photosPayload);
      if (photoErr) throw photoErr;
    }

    // 3. Refresh wishes/messages
    await supabaseClient.from("messages").delete().eq("page_id", pageId);
    if (config.wishes.length > 0) {
      const wishesPayload = config.wishes.map((w) => ({
        page_id: pageId,
        text: w.text,
        sender: w.sender,
      }));
      const { error: wishErr } = await supabaseClient.from("messages").insert(wishesPayload);
      if (wishErr) throw wishErr;
    }

    // 4. Refresh timeline
    await supabaseClient.from("timeline").delete().eq("page_id", pageId);
    if (config.timeline.length > 0) {
      const timelinePayload = config.timeline.map((t) => ({
        page_id: pageId,
        date: t.date,
        title: t.title,
        description: t.description,
        image: t.image,
      }));
      const { error: timeErr } = await supabaseClient.from("timeline").insert(timelinePayload);
      if (timeErr) throw timeErr;
    }

    return true;
  } catch (error) {
    console.error("Failed to save configuration to Supabase", error);
    return false;
  }
}
