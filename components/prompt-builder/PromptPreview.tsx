"use client";

type Props = {
  prompt: string;
  image?: string;
  loading?: boolean;
};

export default function PromptPreview({
  prompt,
  image,
  loading,
}: Props) {

  function downloadImage() {

    if (!image) return;

    const link = document.createElement("a");
    link.href = image;
    link.download = `sonet-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  return (

    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">

      <h2 className="mb-4 text-xl font-semibold text-white">
        Preview
      </h2>

      {loading && (

        <div className="flex h-64 items-center justify-center text-white">
          Generating image...
        </div>

      )}

      {!loading && image && (

        <div className="mb-6 space-y-4">

          <img
            src={image}
            alt="Generated AI artwork"
            className="w-full rounded-xl"
          />

          <button
            onClick={downloadImage}
            className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            ⬇ Download Image
          </button>

        </div>

      )}

      <div className="whitespace-pre-wrap text-sm text-gray-300">

        {prompt || "Your generated prompt will appear here..."}

      </div>

    </div>

  );

}