import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getReceipt(reference: string) {
  const { data, error } = await supabaseAdmin
    .from("payments")
    .select(
      "id, user_id, reference, amount, status, created_at"
    )
    .eq("reference", reference)
    .single();

  if (error) {
    console.error("Get receipt error:", error);
    throw new Error("Receipt not found.");
  }

  return data;
}