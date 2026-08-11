"use client";

type Props = {
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
}: Props) {

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur">

      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">

        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          ✖ Close
        </button>

        <img
          src={imageUrl}
          alt={prompt}
          className="max-h-[70vh] w-full rounded-2xl object-contain"
        />

        <div className="mt-6">

          <h2 className="text-xl font-bold text-white">

            Prompt

          </h2>

          <p className="mt-2 whitespace-pre-wrap text-slate-300">

            {prompt}

          </p>

          <p className="mt-4 text-sm text-slate-500">

            {new Date(createdAt).toLocaleString()}

          </p>

        </div>

      </div>

    </div>

  );

}