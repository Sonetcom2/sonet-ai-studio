import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  // ============================
  // Get Current User
  // ============================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // ============================
  // Date Calculations
  // ============================

  const today = new Date();

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  // ============================
  // Total Images
  // ============================

  const { count: totalImages } = await supabase
    .from("images")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id);

  // ============================
  // Images Today
  // ============================

  const { count: imagesToday } = await supabase
    .from("images")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // ============================
  // Images This Month
  // ============================

  const { count: imagesThisMonth } = await supabase
    .from("images")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte("created_at", monthStart.toISOString());

  // ============================
  // Total Videos
  // ============================

  const { count: totalVideos } = await supabase
    .from("video_generations")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id);

  // ============================
  // Videos Today
  // ============================

  const { count: videosToday } = await supabase
    .from("video_generations")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .gte("created_at", todayStart.toISOString());

  // ============================
  // Storage Estimate
  // ============================

  const { data: images } = await supabase
    .from("images")
    .select("image_url")
    .eq("user_id", user.id);

  let storageUsed = 0;

  images?.forEach((img) => {
    storageUsed += img.image_url?.length ?? 0;
  });

  const storageUsedMB = (
    storageUsed /
    1024 /
    1024
  ).toFixed(2);

  // ============================
  // Recent Images
  // ============================

  const { data: recentImages } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(4);

  // ============================
  // Recent Videos
  // ============================

  const { data: recentVideos } = await supabase
    .from("video_generations")
    .select(
      "id, video_url, prompt, created_at, status, duration"
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(4);

  // ============================
  // User Profile
  // ============================

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("full_name, credits, plan")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "Dashboard Profile Error:",
      profileError.message
    );
  }

  // ============================
  // Return Dashboard Data
  // ============================

  return {
    user,

    fullName:
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email,

    credits: Number(profile?.credits ?? 0),

    plan: profile?.plan ?? "FREE",

    totalImages: totalImages ?? 0,

    imagesToday: imagesToday ?? 0,

    imagesThisMonth: imagesThisMonth ?? 0,

    totalVideos: totalVideos ?? 0,

    videosToday: videosToday ?? 0,

    storageUsed: storageUsedMB,

    recentImages: recentImages ?? [],

    recentVideos: recentVideos ?? [],
  };
}