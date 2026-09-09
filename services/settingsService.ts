import { supabaseAdmin } from "@/lib/supabase/admin";

export type SiteSettings = {
  id: string;
  site_name: string;
  maintenance_mode: boolean;

  free_credits: number;

  pro_price: number;
  pro_credits: number;

  premium_price: number;
  premium_credits: number;

  image_generation_cost: number;
  video_generation_cost: number;
  voice_generation_cost: number;
  assistant_generation_cost: number;

  created_at: string;
  updated_at: string;
};

type SettingsUpdate = Partial<
  Pick<
    SiteSettings,
    | "site_name"
    | "maintenance_mode"
    | "free_credits"
    | "pro_price"
    | "pro_credits"
    | "premium_price"
    | "premium_credits"
    | "image_generation_cost"
    | "video_generation_cost"
    | "voice_generation_cost"
    | "assistant_generation_cost"
  >
>;

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Get Settings Error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      `Unable to load settings: ${error.message}`
    );
  }

  return data as SiteSettings;
}

export async function updateSettings(
  settings: SettingsUpdate
): Promise<SiteSettings> {
  const current = await getSettings();

  const { data, error } = await supabaseAdmin
    .from("settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id)
    .select("*")
    .single();

  if (error) {
    console.error("Update Settings Error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw new Error(
      `Settings update failed: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Settings update returned no data."
    );
  }

  return data as SiteSettings;
}