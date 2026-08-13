"use client";

import { useEffect, useState } from "react";

type Video = {
  id: string;
  prompt: string;
  style: string;
  duration: string;
  resolution: string;
  status: string;
  created_at: string;
  video_url?: string | null;
};

export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const [previewVideo, setPreviewVideo] =
    useState<Video | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  async function loadVideos() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/my-videos"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load your videos."
        );
      }

      setVideos(data.videos || []);
    } catch (error) {
      console.error(
        "My Videos Load Error:",
        error
      );

      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  async function handleDownload(video: Video) {
    if (!video.video_url) {
      alert("Video URL is not available.");
      return;
    }

    try {
      setDownloadingId(video.id);

      const response = await fetch(
        `/api/download-video?url=${encodeURIComponent(
          video.video_url
        )}`
      );

      if (!response.ok) {
        throw new Error("Download failed.");
      }

      const blob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download =
        `sonet-ai-video-${video.id}.mp4`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(
        "Video download error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to download video."
      );
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete(video: Video) {
    const confirmed = window.confirm(
      "Delete this video permanently?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(video.id);

      const response = await fetch(
        "/api/delete-video",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: video.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to delete video."
        );
      }

      setVideos((previousVideos) =>
        previousVideos.filter(
          (item) => item.id !== video.id
        )
      );
    } catch (error) {
      console.error(
        "Video delete error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete video."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-8 py-10 text-white">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-12">

          <h1 className="text-5xl font-black">
            🎥 My Videos
          </h1>

          <p className="mt-3 text-gray-400">
            All your AI-generated videos stored in
            SONET AI Studio.
          </p>

        </div>

        {/* LOADING */}

        {loading ? (

          <div className="flex h-[500px] items-center justify-center">

            <div className="text-center">

              <div className="mx-auto h-20 w-20 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

              <p className="mt-8 text-2xl font-bold">
                Loading Videos...
              </p>

            </div>

          </div>

        ) : videos.length === 0 ? (

          /* EMPTY STATE */

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-16 text-center">

            <div className="text-7xl">
              🎥
            </div>

            <h2 className="mt-6 text-3xl font-bold">
              No Videos Yet
            </h2>

            <p className="mt-4 text-gray-400">
              Generate your first AI video to see
              it here.
            </p>

            <a
              href="/ai-video"
              className="mt-8 inline-block rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold transition hover:scale-105"
            >
              🎬 Create AI Video
            </a>

          </div>

        ) : (

          /* VIDEO GRID */

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {videos.map((video) => (

              <div
                key={video.id}
                className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-xl transition hover:-translate-y-1 hover:shadow-cyan-500/20"
              >

                {/* VIDEO */}

                <div className="relative aspect-video overflow-hidden bg-black">

                  {video.video_url &&
                  video.status === "completed" ? (

                    <video
                      src={video.video_url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900">

                      <div className="text-7xl opacity-30">
                        🎬
                      </div>

                    </div>

                  )}

                  <div className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1 text-sm font-bold">
                    {video.duration}
                  </div>

                  <div className="absolute bottom-4 right-4 rounded-full bg-cyan-500 px-3 py-1 text-sm font-bold text-black">
                    {video.resolution}
                  </div>

                </div>

                {/* CONTENT */}

                <div className="space-y-5 p-5">

                  <h3 className="line-clamp-3 text-lg font-bold">
                    {video.prompt}
                  </h3>

                  <div className="flex items-center justify-between gap-2">

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                      🎨 {video.style}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        video.status ===
                        "completed"
                          ? "bg-green-500/20 text-green-300"
                          : video.status ===
                            "processing"
                          ? "bg-yellow-500/20 text-yellow-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {video.status ===
                      "completed"
                        ? "🟢 Completed"
                        : video.status ===
                          "processing"
                        ? "🟡 Processing"
                        : "🔴 Failed"}
                    </span>

                  </div>

                  <p className="text-xs text-slate-500">
                    {new Date(
                      video.created_at
                    ).toLocaleString()}
                  </p>

                  {/* ACTIONS */}

                  <div className="grid grid-cols-3 gap-2">

                    <button
                      type="button"
                      disabled={
                        !video.video_url ||
                        video.status !==
                          "completed"
                      }
                      onClick={() =>
                        setPreviewVideo(video)
                      }
                      className="rounded-xl border border-slate-700 py-3 text-sm font-semibold transition hover:border-cyan-500 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      ▶
                    </button>

                    <button
                      type="button"
                      disabled={
                        !video.video_url ||
                        video.status !==
                          "completed" ||
                        downloadingId ===
                          video.id
                      }
                      onClick={() =>
                        handleDownload(video)
                      }
                      className="rounded-xl border border-slate-700 py-3 text-sm font-semibold transition hover:border-green-500 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {downloadingId ===
                      video.id
                        ? "⏳"
                        : "⬇"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        deletingId === video.id
                      }
                      onClick={() =>
                        handleDelete(video)
                      }
                      className="rounded-xl border border-red-600 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {deletingId ===
                      video.id
                        ? "⏳"
                        : "🗑"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* PREVIEW MODAL */}

      {previewVideo &&
        previewVideo.video_url && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
            onClick={() =>
              setPreviewVideo(null)
            }
          >

            <div
              className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                onClick={() =>
                  setPreviewVideo(null)
                }
                className="absolute right-4 top-4 z-10 rounded-full bg-black/70 px-4 py-2 text-xl hover:bg-red-600"
              >
                ✕
              </button>

              <video
                src={previewVideo.video_url}
                controls
                autoPlay
                playsInline
                className="max-h-[80vh] w-full bg-black"
              />

              <div className="p-5">

                <h3 className="text-xl font-bold">
                  {previewVideo.prompt}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {previewVideo.style} ·{" "}
                  {previewVideo.duration} ·{" "}
                  {previewVideo.resolution}
                </p>

              </div>

            </div>

          </div>

        )}

    </main>
  );
}