import { createClient } from "@/lib/supabase/client";

export async function getRecentVideos() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("video_generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}