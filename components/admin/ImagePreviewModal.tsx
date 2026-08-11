"use client";

type ImageItem = {
  id: string;
  image_url: string | null;
  prompt: string;
  user_id: string;
  created_at: string;
};

type Props = {
  image: ImageItem | null;
  onClose: () => void;
};

export default function ImagePreviewModal({
  image,
  onClose,
}: Props) {
  if (!image) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-700 px-8 py-5">

          <h2 className="text-2xl font-bold text-white">
            👁 Image Preview
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-red-600"
          >
            ✕
          </button>

        </div>

        {/* Body */}

        <div className="grid gap-8 p-8 lg:grid-cols-2">

          <div>

            {image.image_url ? (

              <img
                src={image.image_url}
                alt="Generated"
                className="w-full rounded-2xl"
              />

            ) : (

              <div className="flex h-96 items-center justify-center rounded-2xl bg-slate-800 text-7xl">
                🖼
              </div>

            )}

          </div>

          <div className="space-y-6">

            <div>

              <h3 className="mb-2 text-lg font-semibold text-cyan-400">
                Prompt
              </h3>

              <div className="rounded-xl bg-slate-800 p-4 text-slate-300">
                {image.prompt}
              </div>

            </div>

            <div>

              <h3 className="mb-2 text-lg font-semibold text-cyan-400">
                User ID
              </h3>

              <p className="break-all text-slate-300">
                {image.user_id}
              </p>

            </div>

            <div>

              <h3 className="mb-2 text-lg font-semibold text-cyan-400">
                Image ID
              </h3>

              <p className="break-all text-slate-300">
                {image.id}
              </p>

            </div>

            <div>

              <h3 className="mb-2 text-lg font-semibold text-cyan-400">
                Created
              </h3>

              <p className="text-slate-300">
                {new Date(image.created_at).toLocaleString()}
              </p>

            </div>

            <div className="flex flex-wrap gap-4 pt-4">

              <button
                onClick={() => navigator.clipboard.writeText(image.prompt)}
                className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
              >
                📋 Copy Prompt
              </button>

              <a
                href={image.image_url ?? "#"}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                ⬇ Download
              </a>

              <button
                onClick={onClose}
                className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-600"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}