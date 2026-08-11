"use client";

import { useState } from "react";

type Props = {
  prompt?: string;
};

export default function VideoStudio({ prompt = "" }: Props) {
  const [duration, setDuration] = useState("5");
  const [resolution, setResolution] = useState("720p");
  const [aspectRatio, setAspectRatio] = useState("16:9");

  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">🎥 Video Studio</h2>
        <p className="mt-2 text-slate-400">
          Generate AI videos from your prompts.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Prompt
          </label>
          <textarea
            readOnly
            value={prompt}
            rows={5}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white"
            placeholder="Generate or write a prompt first..."
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm text-white">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option>5</option>
              <option>10</option>
              <option>15</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">Resolution</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option>720p</option>
              <option>1080p</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white">Aspect Ratio</label>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="w-full rounded-xl bg-slate-800 p-3 text-white"
            >
              <option>16:9</option>
              <option>9:16</option>
              <option>1:1</option>
            </select>
          </div>
        </div>

        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-800 text-slate-400">
          No video generated yet.
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <button className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700">
            🎥 Generate Video
          </button>
          <button className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
            ⬇ Download
          </button>
          <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
            💾 Save
          </button>
          <button className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700">
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}
