import { createClient } from "@/lib/supabase/server";

export async function getAllImages() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("images")
    .select(`
      id,
      prompt,
      image_url,
      created_at,
      user_id
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin Images Error:", error);
    return [];
  }

  return data;
}