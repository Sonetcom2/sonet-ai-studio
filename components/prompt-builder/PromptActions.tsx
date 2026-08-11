"use client";

type PromptActionsProps = {
  prompt: string;
  onGenerate: () => void;
  onGenerateImage: () => void;
  onEnhance: () => void;
  onSave: () => void;
};


export default function PromptActions({
  prompt,
  onGenerate,
  onGenerateImage,
  onEnhance,
  onSave,
}: PromptActionsProps) {


  return (

    <div className="space-y-4">


      <button
        onClick={onGenerate}
        className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
      >
        ✨ Generate Prompt
      </button>



      <button
        onClick={onGenerateImage}
        disabled={!prompt}
        className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
      >
        🖼 Generate Image
      </button>



      <button
        onClick={onEnhance}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
      >
        🚀 Enhance Prompt
      </button>



      <button
        onClick={onSave}
        disabled={!prompt}
        className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        💾 Save Prompt
      </button>



      <button
        className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
      >
        🎥 Generate Video
      </button>


    </div>

  );

}