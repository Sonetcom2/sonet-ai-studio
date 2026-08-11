import { createClient } from "@/lib/supabase/server";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  const [
    usersResult,
    imagesResult,
    videosResult,
    subscriptionsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("images")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("videos")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: usersResult.count ?? 0,

    totalImages: imagesResult.count ?? 0,

    totalVideos: videosResult.count ?? 0,

    activeSubscribers:
      subscriptionsResult.count ?? 0,

    totalRevenue: 0,

    creditsUsed: 0,
  };
}