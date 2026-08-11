import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAdminDashboardStats() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  /*
   * Total Users
   */

  const { count: totalUsers } = await supabaseAdmin
    .from("profiles")
    .select("*", {
      count: "exact",
      head: true,
    });

  /*
   * Total Images
   */

  const { count: totalImages } = await supabaseAdmin
    .from("images")
    .select("*", {
      count: "exact",
      head: true,
    });

  /*
   * Total Revenue
   *
   * We'll connect this later.
   */

  const totalRevenue = 0;

  /*
   * Credits Used
   *
   * We'll calculate this later.
   */

  const creditsUsed = 0;

  return {
    totalUsers: totalUsers ?? 0,
    totalImages: totalImages ?? 0,
    totalRevenue,
    creditsUsed,
  };
}