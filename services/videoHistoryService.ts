import { createClient } from "@/lib/supabase/client";

export async function getRecentVideos() {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("video_generations")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(12);

  if (error) {
    console.error(
      "Video History Error:",
      error
    );

    return [];
  }

  // A permanent video_url means the video was
  // successfully generated and stored.
  return (data || []).map((video) => ({
    ...video,

    status: video.video_url
      ? "completed"
      : video.status || "processing",

    style:
      video.style ||
      "Seedance 2.0 Mini",

    duration:
      video.duration ||
      "AI Video",

    resolution:
      video.resolution ||
      "720p",
  }));
}