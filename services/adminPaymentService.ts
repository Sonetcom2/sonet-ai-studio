import { createClient } from "@/lib/supabase/server";

export async function getAllPayments() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payments")
    .select(`
      id,
      user_id,
      amount,
      currency,
      provider,
      reference,
      status,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin Payments Error:", error);
    return [];
  }

  return data;
}