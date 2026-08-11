"use client";

import VideoPreview from "./VideoPreview";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
  duration: string;
};

export default function VideoHistoryCard({
  video,
}: {
  video: Video;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-lg">

      <VideoPreview
        thumbnail={video.thumbnail}
      />

      <div className="p-5">

        <h3 className="font-bold text-lg line-clamp-2">

          {video.title}

        </h3>

        <div className="mt-3 flex justify-between text-sm text-slate-400">

          <span>
            {video.duration}
          </span>

          <span>
            {video.createdAt}
          </span>

        </div>

        <div className="mt-6 flex gap-3">

          <button className="flex-1 rounded-xl bg-cyan-600 py-2 font-semibold hover:bg-cyan-500 transition">

            ▶ Preview

          </button>

          <button className="flex-1 rounded-xl bg-green-600 py-2 font-semibold hover:bg-green-500 transition">

            ⬇ Download

          </button>

          <button className="rounded-xl bg-red-600 px-4 hover:bg-red-500 transition">

            🗑

          </button>

        </div>

      </div>

    </div>
  );
}