"use client";

type Props = {
  title: string;
  description: string;
  negativePrompt: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setNegativePrompt: (value: string) => void;
};

export default function CustomPromptForm({
  title,
  description,
  negativePrompt,
  setTitle,
  setDescription,
  setNegativePrompt,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 space-y-6">

      <div>
        <h2 className="text-xl font-semibold text-white">
          ✍ Custom Prompt
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Create your own AI prompt or combine it with a template.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Prompt Title
        </label>

        <input
          type="text"
          placeholder="e.g. Luxury Fashion Portrait"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Prompt Description
        </label>

        <textarea
          rows={8}
          placeholder="Describe the image you want AI to generate..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white">
          Negative Prompt (Optional)
        </label>

        <textarea
          rows={3}
          placeholder="e.g. blurry, watermark, low quality, cropped..."
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none"
        />
      </div>

    </div>
  );
}