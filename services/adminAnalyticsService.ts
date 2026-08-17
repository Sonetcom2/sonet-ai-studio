import { createClient } from "@/lib/supabase/server";

export async function getAdminAnalytics() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized.");
  }

  const { data: profile, error: profileError } =
    await supabase
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

  const [
    usersResult,
    imagesResult,
    videosResult,
    subscriptionsResult,
    paymentsResult,
    videoCreditsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("images")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("video_generations")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("subscriptions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "active"),

    supabase
      .from("payments")
      .select("amount, status"),

    supabase
      .from("video_generations")
      .select("credits_used"),
  ]);

  if (paymentsResult.error) {
    console.error(
      "Admin Analytics Payments Error:",
      paymentsResult.error
    );
  }

  if (videoCreditsResult.error) {
    console.error(
      "Admin Analytics Video Credits Error:",
      videoCreditsResult.error
    );
  }

  const totalRevenue =
    (paymentsResult.data ?? [])
      .filter(
        (payment) =>
          String(payment.status).toUpperCase() ===
          "SUCCESS"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

  const creditsUsed =
    (videoCreditsResult.data ?? []).reduce(
      (total, video) =>
        total + Number(video.credits_used || 0),
      0
    );

  return {
    totalUsers: usersResult.count ?? 0,
    totalImages: imagesResult.count ?? 0,
    totalVideos: videosResult.count ?? 0,
    activeSubscribers:
      subscriptionsResult.count ?? 0,
    totalRevenue,
    creditsUsed,
  };
}