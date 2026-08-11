"use client";

import { useState } from "react";

type Image = {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
};

type Video = {
  id: string;
  video_url?: string | null;
  prompt: string;
  created_at: string;
  status?: string | null;
  duration?: string | null;
};

type RecentImagesProps = {
  recentImages: Image[];
  recentVideos?: Video[];
};

type Activity = {
  type: "image" | "video";
  id: string;
  url?: string;
  prompt: string;
  created_at: string;
  status: string;
  duration?: string | null;
};

export default function RecentImages({
  recentImages,
  recentVideos = [],
}: RecentImagesProps) {
  const [videoErrors, setVideoErrors] = useState<
    Record<string, boolean>
  >({});

  const activities: Activity[] = [
    ...recentImages.map((image) => ({
      type: "image" as const,
      id: image.id,
      url: image.image_url,
      prompt: image.prompt,
      created_at: image.created_at,
      status: "COMPLETED",
    })),

    ...recentVideos.map((video) => ({
      type: "video" as const,
      id: video.id,
      url: video.video_url ?? undefined,
      prompt: video.prompt,
      created_at: video.created_at,
      status: video.status || "PROCESSING",
      duration: video.duration,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 6);

  function handleVideoError(videoId: string) {
    console.error("Video failed to load:", videoId);

    setVideoErrors((previous) => ({
      ...previous,
      [videoId]: true,
    }));
  }

  function getStatusClass(status: string) {
    const normalizedStatus = status.toUpperCase();

    if (
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "SUCCEEDED" ||
      normalizedStatus === "SUCCESS"
    ) {
      return "bg-emerald-500/20 text-emerald-300";
    }

    if (
      normalizedStatus === "FAILED" ||
      normalizedStatus === "FAILURE"
    ) {
      return "bg-red-500/20 text-red-300";
    }

    return "bg-yellow-500/20 text-yellow-300";
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">
            📜 Recent Activity
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Your latest images and videos.
          </p>
        </div>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          {activities.length} Recent
        </span>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-2 gap-4">
        {activities.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 p-10 text-center">
            <div className="text-5xl">✨</div>

            <h3 className="mt-4 font-semibold text-white">
              No activity yet
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Your generated images and videos will appear here.
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const isVideo = activity.type === "video";
            const videoHasError =
              isVideo && videoErrors[activity.id];

            return (
              <div
                key={`${activity.type}-${activity.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]"
              >
                {/* Preview */}
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  {/* IMAGE */}
                  {activity.type === "image" ? (
                    <img
                      src={activity.url}
                      alt={activity.prompt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : /* VIDEO */ activity.status
                      .toUpperCase()
                      .includes("FAIL") ? (
                    <div className="flex h-full items-center justify-center bg-red-950/30">
                      <div className="px-4 text-center">
                        <div className="text-4xl">
                          ⚠️
                        </div>

                        <p className="mt-2 text-sm font-semibold text-red-300">
                          Video generation failed
                        </p>
                      </div>
                    </div>
                  ) : !activity.url ? (
                    <div className="flex h-full items-center justify-center bg-slate-950">
                      <div className="px-4 text-center">
                        <div className="text-4xl">
                          🎥
                        </div>

                        <p className="mt-2 text-sm font-semibold text-yellow-300">
                          Video processing
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Your video is not ready yet.
                        </p>
                      </div>
                    </div>
                  ) : videoHasError ? (
                    <div className="flex h-full items-center justify-center bg-red-950/20">
                      <div className="px-4 text-center">
                        <div className="text-4xl">
                          🎥
                        </div>

                        <p className="mt-2 text-sm font-semibold text-red-300">
                          Unable to play video
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          The video URL could not be loaded.
                        </p>

                        <a
                          href={activity.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-white/20"
                        >
                          Open Video
                        </a>
                      </div>
                    </div>
                  ) : (
                    <video
                      src={activity.url}
                      className="h-full w-full object-cover"
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      onError={() =>
                        handleVideoError(activity.id)
                      }
                    />
                  )}

                  {/* Type Badge */}
                  <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {activity.type === "image"
                      ? "🖼 Image"
                      : "🎥 Video"}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute right-3 top-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                        activity.status
                      )}`}
                    >
                      {activity.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4">
                  <p className="line-clamp-2 text-sm text-slate-300">
                    {activity.prompt}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      {new Date(
                        activity.created_at
                      ).toLocaleDateString()}
                    </p>

                    {activity.type === "video" &&
                      activity.duration && (
                        <span className="text-xs text-slate-500">
                          {activity.duration}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}