"use client";

import { useState } from "react";

type AdminVideo = {
  id: string;
  user_id: string;
  prompt: string;
  style?: string | null;
  camera?: string | null;
  duration?: string | null;
  aspect_ratio?: string | null;
  resolution?: string | null;
  quality?: string | null;
  status?: string | null;
  video_url?: string | null;
  thumbnail_url?: string | null;
  credits_used?: number | null;
  created_at?: string | null;
};

type Props = {
  videos: AdminVideo[];
};

function getStatusClasses(status?: string | null) {
  const value = String(status || "unknown").toLowerCase();

  if (value === "completed") {
    return "bg-green-500/20 text-green-300";
  }

  if (
    value === "processing" ||
    value === "pending" ||
    value === "starting"
  ) {
    return "bg-yellow-500/20 text-yellow-300";
  }

  if (value === "failed") {
    return "bg-red-500/20 text-red-300";
  }

  return "bg-slate-800 text-slate-300";
}

export default function AdminVideoTable({
  videos: initialVideos,
}: Props) {
  const [videos, setVideos] =
    useState<AdminVideo[]>(initialVideos);

  const [previewVideo, setPreviewVideo] =
    useState<AdminVideo | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [downloadingId, setDownloadingId] =
    useState<string | null>(null);

  async function handleDelete(video: AdminVideo) {
    const confirmed = window.confirm(
      "Delete this video permanently from SONET AI STUDIO?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(video.id);

      const response = await fetch(
        "/api/admin/videos",
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

      setVideos((current) =>
        current.filter(
          (item) => item.id !== video.id
        )
      );

      if (previewVideo?.id === video.id) {
        setPreviewVideo(null);
      }
    } catch (error) {
      console.error(
        "Admin video delete error:",
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

  async function handleDownload(video: AdminVideo) {
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
        throw new Error(
          "Unable to download video."
        );
      }

      const blob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;
      link.download =
        `sonet-ai-admin-video-${video.id}.mp4`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(
        "Admin video download error:",
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

  if (videos.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400">
        No video generations found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-700 text-sm text-slate-400">
            <tr>
              <th className="px-6 py-4">
                Prompt
              </th>

              <th className="px-6 py-4">
                User ID
              </th>

              <th className="px-6 py-4">
                Status
              </th>

              <th className="px-6 py-4">
                Duration
              </th>

              <th className="px-6 py-4">
                Resolution
              </th>

              <th className="px-6 py-4">
                Credits
              </th>

              <th className="px-6 py-4">
                Created
              </th>

              <th className="px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {videos.map((video) => {
              const status =
                String(
                  video.status || "unknown"
                ).toLowerCase();

              const completed =
                status === "completed" &&
                Boolean(video.video_url);

              return (
                <tr
                  key={video.id}
                  className="border-b border-slate-800 hover:bg-slate-800/50"
                >
                  <td className="max-w-xs px-6 py-4 text-sm text-white">
                    <div
                      className="truncate"
                      title={video.prompt}
                    >
                      {video.prompt ||
                        "No prompt"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className="max-w-[180px] truncate font-mono text-xs text-slate-400"
                      title={video.user_id}
                    >
                      {video.user_id}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                        video.status
                      )}`}
                    >
                      {video.status ||
                        "unknown"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-300">
                    {video.duration ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-300">
                    {video.resolution ?? "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-300">
                    {video.credits_used ?? 0}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                    {video.created_at
                      ? new Date(
                          video.created_at
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex min-w-[210px] gap-2">
                      <button
                        type="button"
                        disabled={!completed}
                        onClick={() =>
                          setPreviewVideo(
                            video
                          )
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold transition hover:border-cyan-500 hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Preview
                      </button>

                      <button
                        type="button"
                        disabled={
                          !completed ||
                          downloadingId ===
                            video.id
                        }
                        onClick={() =>
                          handleDownload(
                            video
                          )
                        }
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold transition hover:border-green-500 hover:bg-green-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {downloadingId ===
                        video.id
                          ? "Downloading..."
                          : "Download"}
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          video.id
                        }
                        onClick={() =>
                          handleDelete(video)
                        }
                        className="rounded-lg border border-red-600 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {deletingId ===
                        video.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

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
                className="absolute right-4 top-4 z-10 rounded-full bg-black/70 px-4 py-2 text-xl text-white hover:bg-red-600"
              >
                ×
              </button>

              <video
                src={previewVideo.video_url}
                controls
                autoPlay
                playsInline
                className="max-h-[75vh] w-full bg-black"
              />

              <div className="p-6">
                <h3 className="text-xl font-bold text-white">
                  {previewVideo.prompt}
                </h3>

                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                  <span>
                    Style:{" "}
                    {previewVideo.style ||
                      "-"}
                  </span>

                  <span>
                    Camera:{" "}
                    {previewVideo.camera ||
                      "-"}
                  </span>

                  <span>
                    Duration:{" "}
                    {previewVideo.duration ||
                      "-"}
                  </span>

                  <span>
                    Resolution:{" "}
                    {previewVideo.resolution ||
                      "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}