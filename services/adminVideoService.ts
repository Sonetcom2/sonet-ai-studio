import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAdminVideos() {
  const { data, error } = await supabaseAdmin
    .from("video_generations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin Videos Error:", error);

    return {
      videos: [],
      stats: {
        totalVideos: 0,
        completedVideos: 0,
        failedVideos: 0,
        processingVideos: 0,
      },
    };
  }

  const videos = data ?? [];

  const stats = {
    totalVideos: videos.length,

    completedVideos: videos.filter(
      (video) =>
        String(video.status).toLowerCase() === "completed"
    ).length,

    failedVideos: videos.filter(
      (video) =>
        String(video.status).toLowerCase() === "failed"
    ).length,

    processingVideos: videos.filter(
      (video) => {
        const status = String(video.status).toLowerCase();

        return (
          status === "processing" ||
          status === "pending" ||
          status === "starting"
        );
      }
    ).length,
  };

  return {
    videos,
    stats,
  };
}