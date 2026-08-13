"use client";

import { useState } from "react";

type Props = {
  prompt?: string;
};

export default function VideoStudio({
  prompt = "",
}: Props) {
  const [duration, setDuration] = useState("5");
  const [resolution, setResolution] = useState("720p");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [style, setStyle] = useState("Cinematic");
  const [camera, setCamera] = useState("Smooth Camera");
  const [quality, setQuality] = useState("high");

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateVideo() {
    if (!prompt.trim()) {
      alert("Generate a prompt first.");
      return;
    }

    try {
      setLoading(true);
      setVideoUrl("");

      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          camera,
          duration,
          aspectRatio,
          resolution,
          quality,
        }),
      });

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            data.error ||
            "Video generation failed."
        );
      }

      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
      }

      alert(
        data.message ||
          "Video generated successfully."
      );
    } catch (error: any) {
      console.error(
        "Video generation error:",
        error
      );

      alert(
        error?.message ||
          "Failed to generate video."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadVideo() {
    if (!videoUrl) {
      alert("Generate a video first.");
      return;
    }

    try {
      const response = await fetch(
        `/api/download-video?url=${encodeURIComponent(
          videoUrl
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download video."
        );
      }

      const blob = await response.blob();

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `sonet-ai-video-${Date.now()}.mp4`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Video download error:",
        error
      );

      alert(
        "Unable to download video."
      );
    }
  }

  async function deleteVideo() {
    if (!videoUrl) {
      alert("There is no generated video to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this video?"
    );

    if (!confirmed) return;

    /*
     * The current /api/delete-video route requires
     * the database video ID, not the video URL.
     *
     * We therefore clear the current generated
     * video here. Permanent database deletion will
     * be connected once the generation response
     * exposes the saved video ID.
     */

    setVideoUrl("");

    alert("Video removed from the current studio.");
  }

  function saveVideo() {
    if (!videoUrl) {
      alert("Generate a video first.");
      return;
    }

    /*
     * The video is already saved by
     * /api/generate-video in video_generations.
     */

    alert(
      "Video is already saved to My Videos."
    );
  }

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">
          🎥 Video Studio
        </h2>

        <p className="mt-2 text-slate-400">
          Generate AI videos from your prompts.
        </p>
      </div>

      <div className="space-y-6">

        {/* PROMPT */}

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Prompt
          </label>

          <textarea
            readOnly
            value={prompt}
            rows={6}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none"
            placeholder="Generate a prompt first..."
          />
        </div>

        {/* SETTINGS */}

        <div className="grid gap-6 md:grid-cols-2">

          <div>
            <label className="mb-2 block text-sm text-white">
              Style
            </label>

            <select
              value={style}
              onChange={(e) =>
                setStyle(e.target.value)
              }
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option>Cinematic</option>
              <option>Realistic</option>
              <option>Luxury</option>
              <option>Fashion</option>
              <option>Commercial</option>
              <option>Documentary</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">
              Camera
            </label>

            <select
              value={camera}
              onChange={(e) =>
                setCamera(e.target.value)
              }
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option>Smooth Camera</option>
              <option>Static Camera</option>
              <option>Dolly In</option>
              <option>Dolly Out</option>
              <option>Pan Left</option>
              <option>Pan Right</option>
              <option>Tracking Shot</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">
              Duration
            </label>

            <select
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value)
              }
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
              <option value="15">15 seconds</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">
              Resolution
            </label>

            <select
              value={resolution}
              onChange={(e) =>
                setResolution(e.target.value)
              }
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">
              Aspect Ratio
            </label>

            <select
              value={aspectRatio}
              onChange={(e) =>
                setAspectRatio(e.target.value)
              }
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
              <option value="1:1">1:1</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">
              Quality
            </label>

            <select
              value={quality}
              onChange={(e) =>
                setQuality(e.target.value)
              }
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

        </div>

        {/* VIDEO PREVIEW */}

        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800 p-4">

          {loading ? (
            <div className="text-center text-white">
              <div className="mb-4 text-4xl">
                🎬
              </div>

              <p className="text-lg font-semibold">
                Generating video...
              </p>

              <p className="mt-2 text-sm text-slate-400">
                This may take some time.
              </p>
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="max-h-[500px] w-full rounded-xl"
            />
          ) : (
            <div className="text-center text-slate-400">
              <div className="mb-4 text-5xl">
                🎥
              </div>

              <p>
                No video generated yet.
              </p>
            </div>
          )}

        </div>

        {/* ACTIONS */}

        <div className="grid gap-4 md:grid-cols-4">

          <button
            onClick={generateVideo}
            disabled={loading || !prompt.trim()}
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Generating..."
              : "🎥 Generate Video"}
          </button>

          <button
            onClick={downloadVideo}
            disabled={!videoUrl || loading}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ⬇ Download
          </button>

          <button
            onClick={saveVideo}
            disabled={!videoUrl || loading}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            💾 Save
          </button>

          <button
            onClick={deleteVideo}
            disabled={!videoUrl || loading}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🗑 Delete
          </button>

        </div>

      </div>
    </div>
  );
}