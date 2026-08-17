import { createClient } from "@/lib/supabase/server";

export async function getAllPayments() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    profile.role !== "ADMIN"
  ) {
    throw new Error("Forbidden.");
  }

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
    throw new Error("Unable to load payments.");
  }

  return data ?? [];
}