import { createClient } from "@/lib/supabase/server";

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error("Admin Delete User Error:", error);
    throw new Error(error.message);
  }

  return {
    success: true,
  };
}