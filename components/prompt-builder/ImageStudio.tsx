"use client";

import { useState } from "react";

type Props = {
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
  quality = "standard",
  aspectRatio = "1:1",
  onRegenerate,
  onDelete,
}: Props) {
  const [fullscreen, setFullscreen] = useState(false);

  async function downloadImage() {
    if (!image) return;
    const res = await fetch(image);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sonet-ai-image.png";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyPrompt() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    alert("Prompt copied successfully.");
  }

  return (
    <>
      <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-white">🖼 Image Studio</h2>
        <p className="mt-2 text-slate-400">View and manage your AI-generated images.</p>

        {loading ? (
          <div className="mt-8 flex h-96 items-center justify-center text-white">
            Generating image...
          </div>
        ) : !image ? (
          <div className="mt-8 flex h-96 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-slate-400">
            No image generated yet.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <img
                  src={image}
                  alt="Generated"
                  onClick={() => setFullscreen(true)}
                  className="w-full cursor-pointer rounded-2xl border border-slate-700"
                />
              </div>

              <div className="rounded-2xl bg-slate-800 p-5 text-white">
                <h3 className="mb-4 text-xl font-semibold">Image Details</h3>
                <p><strong>Model:</strong> {model}</p>
                <p><strong>Quality:</strong> {quality}</p>
                <p><strong>Aspect Ratio:</strong> {aspectRatio}</p>

                <div className="mt-5">
                  <h4 className="mb-2 font-semibold">Prompt</h4>
                  <div className="rounded-lg bg-slate-900 p-3 text-sm">
                    {prompt || "No prompt available."}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-5">
              <button onClick={downloadImage} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white">⬇ Download</button>
              <button onClick={copyPrompt} className="rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white">📋 Copy Prompt</button>
              <button onClick={onRegenerate} className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">🔄 Regenerate</button>
              <button className="rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white">✨ Variation</button>
              <button onClick={onDelete} className="rounded-xl bg-red-600 px-4 py-3 font-semibold text-white">🗑 Delete</button>
            </div>
          </>
        )}
      </div>

      {fullscreen && image && (
        <div
          onClick={() => setFullscreen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <img
            src={image}
            alt="Fullscreen"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl"
          />
        </div>
      )}
    </>
  );
}
