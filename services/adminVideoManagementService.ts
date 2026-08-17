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

  const totalVideos = videos.length;

  const completedVideos = videos.filter(
    (video) =>
      String(video.status ?? "").toLowerCase() === "completed"
  ).length;

  const failedVideos = videos.filter(
    (video) =>
      String(video.status ?? "").toLowerCase() === "failed"
  ).length;

  const processingVideos = videos.filter((video) => {
    const status = String(video.status ?? "").toLowerCase();

    return (
      status === "processing" ||
      status === "pending" ||
      status === "starting"
    );
  }).length;

  return {
    videos,
    stats: {
      totalVideos,
      completedVideos,
      failedVideos,
      processingVideos,
    },
  };
}

export async function deleteAdminVideo(videoId: string) {
  if (!videoId) {
    throw new Error("Video ID is required.");
  }

  const { data: video, error: fetchError } =
    await supabaseAdmin
      .from("video_generations")
      .select("id, video_url")
      .eq("id", videoId)
      .single();

  if (fetchError || !video) {
    throw new Error("Video not found.");
  }

  const { error: deleteError } = await supabaseAdmin
    .from("video_generations")
    .delete()
    .eq("id", videoId);

  if (deleteError) {
    console.error(
      "Admin Video Delete Error:",
      deleteError
    );

    throw new Error("Unable to delete video.");
  }

  // Try to remove the corresponding storage object if the
  // video URL belongs to the Supabase storage bucket.
  try {
    const videoUrl = video.video_url;

    if (videoUrl) {
      const marker =
        "/storage/v1/object/public/generated-videos/";

      const markerIndex = videoUrl.indexOf(marker);

      if (markerIndex !== -1) {
        const filePath = decodeURIComponent(
          videoUrl.substring(
            markerIndex + marker.length
          )
        );

        if (filePath) {
          const { error: storageError } =
            await supabaseAdmin.storage
              .from("generated-videos")
              .remove([filePath]);

          if (storageError) {
            console.warn(
              "Admin video storage deletion warning:",
              storageError
            );
          }
        }
      }
    }
  } catch (storageError) {
    console.warn(
      "Unable to remove video from storage:",
      storageError
    );
  }

  return {
    success: true,
    message: "Video deleted successfully.",
  };
}