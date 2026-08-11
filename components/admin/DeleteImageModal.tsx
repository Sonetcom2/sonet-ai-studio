"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteImageModal({
  open,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="text-center">

          <div className="mb-4 text-6xl">
            🗑
          </div>

          <h2 className="text-2xl font-bold text-white">
            Delete Image
          </h2>

          <p className="mt-4 text-slate-400">
            Are you sure you want to permanently delete this image?
          </p>

          <p className="mt-2 text-sm text-red-400">
            This action cannot be undone.
          </p>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-600"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700"
          >
            Delete
          </button>

        </div>

      </div>
    </div>
  );
}