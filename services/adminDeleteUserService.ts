
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function deleteUser(userId: string) {
  const supabase = await createClient();

  // Verify the currently authenticated user is an admin.
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: currentProfile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

  if (
    profileError ||
    !currentProfile ||
    String(currentProfile.role).toUpperCase() !== "ADMIN"
  ) {
    throw new Error("FORBIDDEN");
  }

  // Prevent an admin from accidentally deleting their own account.
  if (userId === currentUser.id) {
    throw new Error("You cannot delete your own admin account.");
  }

  // Delete the user's profile first.
  const { error: deleteProfileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (deleteProfileError) {
    console.error(
      "Admin Delete User Profile Error:",
      deleteProfileError
    );

    throw new Error(deleteProfileError.message);
  }

  // Delete the corresponding Supabase Auth account.
  const { error: deleteAuthError } =
    await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteAuthError) {
    console.error(
      "Admin Delete User Auth Error:",
      deleteAuthError
    );

    throw new Error(deleteAuthError.message);
  }

  return {
    success: true,
  };
}
