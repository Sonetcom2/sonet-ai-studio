"use client";

import CustomPromptForm from "./CustomPromptForm";
import PromptPreview from "./PromptPreview";
import PromptActions from "./PromptActions";

type Props = {
  title: string;
  description: string;
  negativePrompt: string;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setNegativePrompt: (value: string) => void;

  generatedPrompt: string;
  generatedImage: string;
  loadingImage: boolean;

  onGenerate: () => void;
  onGenerateImage: () => void;
  onEnhance: () => void;
  onSave: () => void;
  onCopy: () => void;
  onGenerateVideo: () => void;
};

export default function PromptWorkspace({
  title,
  description,
  negativePrompt,
  setTitle,
  setDescription,
  setNegativePrompt,
  generatedPrompt,
  generatedImage,
  loadingImage,
  onGenerate,
  onGenerateImage,
  onEnhance,
  onSave,
  onCopy,
  onGenerateVideo,
}: Props) {
  return (
    <div className="grid gap-8 xl:grid-cols-3">
      {/* LEFT */}
      <CustomPromptForm
        title={title}
        description={description}
        negativePrompt={negativePrompt}
        setTitle={setTitle}
        setDescription={setDescription}
        setNegativePrompt={setNegativePrompt}
      />

      {/* CENTER */}
      <PromptPreview
        prompt={generatedPrompt}
        image={generatedImage}
        loading={loadingImage}
      />

      {/* RIGHT */}
      <PromptActions
        prompt={generatedPrompt}
        onGenerate={onGenerate}
        onGenerateImage={onGenerateImage}
        onEnhance={onEnhance}
        onSave={onSave}
        onCopy={onCopy}
        onGenerateVideo={onGenerateVideo}
      />
    </div>
  );
}