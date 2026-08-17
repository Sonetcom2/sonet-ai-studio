"use client";

type ImagePreviewModalProps = {
  open: boolean;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  onClose: () => void;
};

export default function ImagePreviewModal({
  open,
  imageUrl,
  prompt,
  createdAt,
  onClose,
}: ImagePreviewModalProps) {
  if (!open) return null;

  async function handleDownload() {
    try {
      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(imageUrl)}`
      );

      if (!response.ok) {
        throw new Error("Unable to download image.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `sonet-ai-${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Unable to download image.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Image Preview
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
          >
            ✕ Close
          </button>
        </div>

        <div className="flex items-center justify-center rounded-2xl bg-black/40 p-4">
          <img
            src={imageUrl}
            alt={prompt || "SONET AI generated image"}
            className="max-h-[65vh] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>

        <div className="mt-6 rounded-2xl bg-slate-800 p-5">
          <h3 className="text-lg font-semibold text-white">
            Prompt
          </h3>

          <p className="mt-3 whitespace-pre-wrap break-words text-slate-300">
            {prompt || "No prompt available."}
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Created: {new Date(createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            ⬇ Download Image
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white transition hover:bg-slate-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}