import { createClient } from "@/lib/supabase/client";

export async function deleteImage(id: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("images")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete Image Error:", error);
    throw error;
  }

  return true;
}