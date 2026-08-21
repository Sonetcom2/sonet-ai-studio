
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function getAdminAnalytics() {
  // Verify that the current user is an administrator.
  await requireAdmin();

  const [
    usersResult,
    imagesResult,
    videosResult,
    subscriptionsResult,
    paymentsResult,
    videoCreditsResult,
  ] = await Promise.all([
    // Total users
    supabaseAdmin
      .from("profiles")
      .select("*", {
        count: "exact",
        head: true,
      }),

    // Total images
    supabaseAdmin
      .from("images")
      .select("*", {
        count: "exact",
        head: true,
      }),

    // Total videos
    supabaseAdmin
      .from("video_generations")
      .select("*", {
        count: "exact",
        head: true,
      }),

    // Active subscriptions
    supabaseAdmin
      .from("subscriptions")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "active"),

    // Payments
    // Paystack stores amount in kobo.
    supabaseAdmin
      .from("payments")
      .select("amount, status, currency"),

    // Credits consumed by video generation
    supabaseAdmin
      .from("video_generations")
      .select("credits_used"),
  ]);

  // Log database errors without crashing the entire analytics page.
  if (usersResult.error) {
    console.error(
      "Admin Analytics Users Error:",
      usersResult.error
    );
  }

  if (imagesResult.error) {
    console.error(
      "Admin Analytics Images Error:",
      imagesResult.error
    );
  }

  if (videosResult.error) {
    console.error(
      "Admin Analytics Videos Error:",
      videosResult.error
    );
  }

  if (subscriptionsResult.error) {
    console.error(
      "Admin Analytics Subscriptions Error:",
      subscriptionsResult.error
    );
  }

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

  // --------------------------------------------------
  // TOTAL REVENUE
  //
  // Paystack payment.amount is stored in kobo.
  //
  // ₦5,000  = 500,000 kobo
  // ₦25,000 = 2,500,000 kobo
  //
  // Convert kobo to naira by dividing by 100.
  // --------------------------------------------------

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
      ) / 100;

  // --------------------------------------------------
  // TOTAL CREDITS USED
  // --------------------------------------------------

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
