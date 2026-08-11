import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function uploadImage(
  base64Image: string,
  userId: string
) {
  // Remove the data:image/png;base64, part
  const base64Data = base64Image.split(",")[1];

  const bytes = Uint8Array.from(
    atob(base64Data),
    (c) => c.charCodeAt(0)
  );

  const fileName = `${userId}/${Date.now()}.png`;

  const { error } = await supabase.storage
    .from("generated-images")
    .upload(fileName, bytes, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("generated-images")
    .getPublicUrl(fileName);

  return publicUrl;
}