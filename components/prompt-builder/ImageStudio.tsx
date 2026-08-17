"use client";

import { useState } from "react";

type ImageStudioProps = {
  image?: string;
  prompt?: string;
  loading?: boolean;
  model?: string;
  quality?: string;
  aspectRatio?: string;
  onRegenerate?: () => void;
  onDelete?: () => void;
};

export default function ImageStudio({
  image,
  prompt = "",
  loading = false,
  model = "gpt-image-1",
  quality = "medium",
  aspectRatio = "1:1",
  onRegenerate,
  onDelete,
}: ImageStudioProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function downloadImage() {
    if (!image || downloading) return;

    try {
      setDownloading(true);

      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(image)}`
      );

      if (!response.ok) {
        throw new Error("Unable to download image.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `sonet-ai-image-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download image error:", error);
      alert("Unable to download image.");
    } finally {
      setDownloading(false);
    }
  }

  async function copyPrompt() {
    if (!prompt) {
      alert("There is no prompt to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(prompt);
      alert("Prompt copied successfully.");
    } catch (error) {
      console.error("Copy prompt error:", error);
      alert("Unable to copy prompt.");
    }
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-3xl">🖼️</span>

          <h2 className="text-3xl font-bold text-white">
            Image Studio
          </h2>
        </div>

        <p className="text-slate-400">
          View and manage your AI-generated images.
        </p>

        {loading ? (
          <div className="mt-8 flex h-96 flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/50">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-cyan-500" />

            <p className="text-lg font-semibold text-white">
              Generating image...
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Please wait while SONET AI creates your image.
            </p>
          </div>
        ) : !image ? (
          <div className="mt-8 flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/30">
            <span className="text-6xl">🖼️</span>

            <p className="mt-4 text-lg font-semibold text-white">
              No image generated yet.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Generate an image to see it here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => setFullscreen(true)}
                  className="block w-full cursor-zoom-in overflow-hidden rounded-2xl border border-slate-700"
                >
                  <img
                    src={image}
                    alt="SONET AI generated"
                    className="w-full object-contain transition duration-300 hover:scale-[1.01]"
                  />
                </button>
              </div>

              <div className="rounded-2xl bg-slate-800 p-5 text-white">
                <h3 className="mb-5 text-xl font-semibold">
                  Image Details
                </h3>

                <div className="space-y-3 text-sm">
                  <p>
                    <strong>Model:</strong> {model}
                  </p>

                  <p>
                    <strong>Quality:</strong> {quality}
                  </p>

                  <p>
                    <strong>Aspect Ratio:</strong> {aspectRatio}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="mb-2 font-semibold">
                    Prompt
                  </h4>

                  <div className="max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 text-sm leading-6 text-slate-300">
                    {prompt || "No prompt available."}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <button
                type="button"
                onClick={downloadImage}
                disabled={downloading}
                className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading ? "Downloading..." : "⬇ Download"}
              </button>

              <button
                type="button"
                onClick={copyPrompt}
                className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                📋 Copy Prompt
              </button>

              <button
                type="button"
                onClick={onRegenerate}
                disabled={!onRegenerate}
                className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🔄 Regenerate
              </button>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white opacity-60"
                title="Variation generation is not connected yet"
              >
                ✨ Variation
              </button>

              <button
                type="button"
                onClick={onDelete}
                disabled={!onDelete}
                className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🗑 Delete
              </button>
            </div>
          </>
        )}
      </div>

      {fullscreen && image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-5 top-5 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
          >
            ✕ Close
          </button>

          <img
            src={image}
            alt="SONET AI fullscreen preview"
            className="max-h-[92vh] max-w-[95vw] rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}