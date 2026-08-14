import { supabaseAdmin } from "@/lib/supabase/admin";

export type SiteSettings = {
  id: string;
  site_name: string;
  maintenance_mode: boolean;
  free_credits: number;
  pro_price: number;
  pro_credits: number;
  premium_price: number;
  image_generation_cost: number;
  video_generation_cost: number;
  created_at: string;
  updated_at: string;
};

export async function getSettings(): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Get Settings Error:", error);
    throw new Error("Unable to load settings.");
  }

  return data as SiteSettings;
}

export async function updateSettings(
  settings: Partial<
    Pick<
      SiteSettings,
      | "site_name"
      | "maintenance_mode"
      | "free_credits"
      | "pro_price"
      | "pro_credits"
      | "premium_price"
      | "image_generation_cost"
      | "video_generation_cost"
    >
  >
): Promise<SiteSettings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("Update Settings Error:", error);
    throw new Error("Unable to update settings.");
  }

  return data as SiteSettings;
}