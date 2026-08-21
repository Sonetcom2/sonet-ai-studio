import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error(
      "requireAdmin auth error:",
      authError.message
    );

    throw new Error("UNAUTHORIZED");
  }

  if (!user) {
    console.error(
      "requireAdmin: No authenticated Supabase user."
    );

    throw new Error("UNAUTHORIZED");
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "requireAdmin profile error:",
      profileError.message
    );

    throw new Error("FORBIDDEN");
  }

  if (!profile) {
    throw new Error("FORBIDDEN");
  }

  if (
    String(profile.role).toUpperCase() !== "ADMIN"
  ) {
    console.error(
      "requireAdmin: User is not an ADMIN.",
      {
        userId: user.id,
        role: profile.role,
      }
    );

    throw new Error("FORBIDDEN");
  }

  return {
    user,
    profile,
  };
}