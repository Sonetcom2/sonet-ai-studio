"use client";

type LibraryCardProps = {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

export default function LibraryCard({
  imageUrl,
  prompt,
  createdAt,
  onPreview,
  onDownload,
  onDelete,
}: LibraryCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:shadow-purple-500/20">
      <button
        type="button"
        onClick={onPreview}
        className="block w-full"
      >
        <img
          src={imageUrl}
          alt={prompt || "SONET AI generated image"}
          className="h-64 w-full object-cover transition duration-300 hover:scale-[1.02]"
        />
      </button>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-white">
            {prompt || "Untitled image"}
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {new Date(createdAt).toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onPreview}
            className="rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            👁 View
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            ⬇ Download
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  );
}