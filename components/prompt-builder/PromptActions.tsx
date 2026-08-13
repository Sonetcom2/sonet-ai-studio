"use client";

type PromptActionsProps = {
  prompt: string;
  onGenerate: () => void;
  onGenerateImage: () => void;
  onEnhance: () => void;
  onSave: () => void;
  onCopy: () => void;
  onGenerateVideo: () => void;
};

export default function PromptActions({
  prompt,
  onGenerate,
  onGenerateImage,
  onEnhance,
  onSave,
  onCopy,
  onGenerateVideo,
}: PromptActionsProps) {
  const buttonClass =
    "w-full rounded-xl px-5 py-3 font-semibold text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onGenerate}
        className={`${buttonClass} bg-indigo-600 hover:bg-indigo-700`}
      >
        ✨ Generate Prompt
      </button>

      <button
        type="button"
        onClick={onGenerateImage}
        disabled={!prompt}
        className={`${buttonClass} bg-purple-600 hover:bg-purple-700`}
      >
        🖼 Generate Image
      </button>

      <button
        type="button"
        onClick={onEnhance}
        disabled={!prompt}
        className={`${buttonClass} bg-blue-600 hover:bg-blue-700`}
      >
        🚀 Enhance Prompt
      </button>

      <button
        type="button"
        onClick={onSave}
        disabled={!prompt}
        className={`${buttonClass} bg-green-600 hover:bg-green-700`}
      >
        💾 Save Prompt
      </button>

      <button
        type="button"
        onClick={onCopy}
        disabled={!prompt}
        className={`${buttonClass} bg-slate-700 hover:bg-slate-600`}
      >
        📋 Copy Prompt
      </button>

      <button
        type="button"
        onClick={onGenerateVideo}
        disabled={!prompt}
        className={`${buttonClass} bg-red-600 hover:bg-red-700`}
      >
        🎥 Generate Video
      </button>
    </div>
  );
}