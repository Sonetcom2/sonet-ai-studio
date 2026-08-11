"use client";

type Video = {
  id: string;
  prompt: string;
  style: string;
  duration: string;
  resolution: string;
  status: string;
  created_at: string;
};

type Props = {
  videos: Video[];
};

export default function RecentVideos({ videos }: Props) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-black">
            🎬 Recent Video Generations
          </h2>

          <p className="mt-2 text-slate-400">
            Every video you generate will appear here.
          </p>
        </div>

        <div className="rounded-full bg-cyan-500/20 px-5 py-2 font-bold text-cyan-300">
          {videos.length} Videos
        </div>

      </div>

      {/* Empty State */}

      {videos.length === 0 ? (

        <div className="rounded-3xl border border-dashed border-slate-700 py-20 text-center">

          <div className="mb-6 text-6xl">
            🎥
          </div>

          <h3 className="text-2xl font-bold">
            No Videos Yet
          </h3>

          <p className="mt-4 text-slate-400">
            Generate your first AI video and it will appear here.
          </p>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {videos.map((video) => (

            <div
              key={video.id}
              className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-2xl"
            >

              {/* Premium Thumbnail */}

              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-900">

                <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-20">
                  🎬
                </div>

                <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-3 py-1 text-sm font-bold">
                  {video.duration}
                </div>

                <div className="absolute bottom-4 right-4 rounded-full bg-cyan-500 px-3 py-1 text-sm font-bold text-black">
                  {video.resolution}
                </div>

              </div>

              {/* Card Content */}

              <div className="space-y-5 p-6">

                <h3 className="line-clamp-2 text-lg font-bold">
                  {video.prompt}
                </h3>

                <div className="flex items-center justify-between">

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                    🎨 {video.style}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      video.status === "completed"
                        ? "bg-green-500/20 text-green-300"
                        : video.status === "processing"
                        ? "bg-yellow-500/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {video.status === "completed"
                      ? "🟢 Completed"
                      : video.status === "processing"
                      ? "🟡 Processing"
                      : "🔴 Failed"}
                  </span>

                </div>

                <p className="text-xs text-slate-500">
                  {new Date(video.created_at).toLocaleString()}
                </p>

                {/* Buttons */}

                <div className="grid grid-cols-3 gap-3">

                  <button className="rounded-xl border border-slate-700 py-3 text-sm font-semibold transition hover:border-cyan-500 hover:bg-cyan-500/10">
                    ▶ Preview
                  </button>

                  <button className="rounded-xl border border-slate-700 py-3 text-sm font-semibold transition hover:border-green-500 hover:bg-green-500/10">
                    ⬇ Download
                  </button>

                  <button className="rounded-xl border border-red-600 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-600 hover:text-white">
                    🗑 Delete
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}