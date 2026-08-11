import { createClient } from "@/lib/supabase/server";

export async function suspendUser(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      status: "SUSPENDED",
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Admin Suspend User Error:", error);
    throw new Error(error.message);
  }

  return data;
}