import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    throw new Error("FORBIDDEN");
  }

  if (String(profile.role).toUpperCase() !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    profile,
  };
}