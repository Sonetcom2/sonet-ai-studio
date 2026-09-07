import { createClient } from "@/lib/supabase/server";

export async function getPaymentHistory() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, user_id, amount, currency, provider, reference, status, plan, payment_method, customer_note, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Payment history error:", error);
    return [];
  }

  return data ?? [];
}