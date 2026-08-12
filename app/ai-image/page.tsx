"use client";

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/Toast";
import ImagePreviewModal from "@/components/prompt-builder/ImagePreviewModal";

type HistoryItem = {
  image: string;
  prompt: string;
  date: string;
};

const MAX_REFERENCE_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

export default function AIImagePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysingReference, setAnalysingReference] = useState(false);
  const [image, setImage] = useState("");
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [selectedHistoryImage, setSelectedHistoryImage] =
    useState<HistoryItem | null>(null);
  const [remainingImages, setRemainingImages] = useState(5);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] =
    useState<"success" | "error" | "info">("info");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedRemaining = localStorage.getItem("remainingImages");
    if (savedRemaining !== null) setRemainingImages(Number(savedRemaining));

    try {
      const savedHistory = localStorage.getItem("imageHistory");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (error) {
      console.error("Unable to load image history:", error);
    }

    try {
      const savedPrompts = localStorage.getItem("promptHistory");
      if (savedPrompts) setPromptHistory(JSON.parse(savedPrompts));
    } catch (error) {
      console.error("Unable to load prompt history:", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("remainingImages", remainingImages.toString());
  }, [remainingImages]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    return () => {
      if (referencePreview) URL.revokeObjectURL(referencePreview);
    };
  }, [referencePreview]);

  function resetImages() {
    localStorage.removeItem("remainingImages");
    setRemainingImages(5);
    setPrompt("");
    setImage("");
    setToastType("success");
    setToast("Daily images have been reset.");
  }

  function handleReferenceImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setToastType("error");
      setToast("Please upload a PNG, JPG, JPEG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setToastType("error");
      setToast("The selected image is empty.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_REFERENCE_IMAGE_SIZE) {
      setToastType("error");
      setToast("Reference image must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    if (referencePreview) URL.revokeObjectURL(referencePreview);

    setReferenceImage(file);
    setReferencePreview(URL.createObjectURL(file));
    setToastType("success");
    setToast("Reference photo added.");
  }

  function removeReferenceImage() {
    if (referencePreview) URL.revokeObjectURL(referencePreview);
    setReferenceImage(null);
    setReferencePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleAnalyseReference() {
    if (!referenceImage) {
      setToastType("error");
      setToast("Please upload a reference photo first.");
      return;
    }

    if (analysingReference || loading) return;
    setAnalysingReference(true);

    try {
      const formData = new FormData();
      formData.append("reference", referenceImage);

      const response = await fetch("/api/analyse-reference", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to generate a prompt from the reference photo."
        );
      }

      if (!data.prompt || typeof data.prompt !== "string") {
        throw new Error("SONET AI did not return a valid prompt.");
      }

      setPrompt(data.prompt.trim());
      setToastType("success");
      setToast("✨ SONET AI generated a prompt from your reference photo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Reference prompt generation error:", error);
      setToastType("error");
      setToast(
        error?.message || "Unable to generate a prompt from the reference photo."
      );
    } finally {
      setAnalysingReference(false);
    }
  }

  async function handleDownload() {
    if (!image) return;

    try {
      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(image)}`
      );

      if (!response.ok) throw new Error("Download failed.");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `sonet-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setToastType("success");
      setToast("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      setToastType("error");
      setToast("Failed to download image.");
    }
  }

  async function handleGenerate() {
    if (!prompt.trim()) {
      setToastType("error");
      setToast("Please enter a prompt first.");
      return;
    }

    if (remainingImages <= 0) {
      setToastType("info");
      setToast("You've reached today's free image limit.");
      return;
    }

    setLoading(true);
    setImage("");

    try {
      const formData = new FormData();
      formData.append("prompt", prompt.trim());
      formData.append("model", "gpt-image-1");
      formData.append("quality", "high");
      formData.append("style", "auto");
      formData.append("aspectRatio", "1:1");

      if (referenceImage) formData.append("referenceImage", referenceImage);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Image generation failed.");
      }

      setImage(data.image);

      setRemainingImages(
        typeof data.creditsRemaining === "number"
          ? data.creditsRemaining
          : (previous) => Math.max(previous - 1, 0)
      );

      const newHistory: HistoryItem = {
        image: data.image,
        prompt: prompt.trim(),
        date: new Date().toLocaleString(),
      };

      const updatedHistory = [newHistory, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("imageHistory", JSON.stringify(updatedHistory));

      const updatedPrompts = [
        prompt.trim(),
        ...promptHistory.filter((item) => item !== prompt.trim()),
      ].slice(0, 50);

      setPromptHistory(updatedPrompts);
      localStorage.setItem("promptHistory", JSON.stringify(updatedPrompts));

      setToastType("success");
      setToast(
        data.hasReferenceImage
          ? "Image generated using your reference photo!"
          : "Image generated successfully!"
      );
    } catch (error: any) {
      console.error("Image generation error:", error);
      setToastType("error");
      setToast(error?.message || "Something went wrong while generating the image.");
    } finally {
      setLoading(false);
    }
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem("imageHistory");
    setToastType("success");
    setToast("Image history cleared.");
  }

  function deleteHistoryItem(index: number) {
    const updatedHistory = history.filter((_, i) => i !== index);
    setHistory(updatedHistory);
    localStorage.setItem("imageHistory", JSON.stringify(updatedHistory));

    if (selectedHistoryImage?.image === history[index]?.image) {
      setSelectedHistoryImage(null);
    }

    setToastType("success");
    setToast("Image deleted.");
  }

  function usePrompt(selectedPrompt: string) {
    setPrompt(selectedPrompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setToastType("info");
    setToast("Prompt loaded. You can edit it before generating.");
  }

  function startNewPrompt() {
    setPrompt("");
    setImage("");
    removeReferenceImage();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {toast && <Toast message={toast} type={toastType} />}

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl">

          <div className="mb-12 text-center">
            <h1 className="text-6xl font-black">🎨 SONET AI Image Studio</h1>
            <p className="mx-auto mt-5 max-w-3xl text-xl text-gray-400">
              Create stunning AI-generated images from your own prompt or use a
              reference photo to automatically create a detailed AI prompt.
            </p>
          </div>

          <div className="mb-12 rounded-3xl border border-cyan-500/30 bg-blue-900/30 p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">🎁 Daily Free Images</h2>
                <p className="mt-2 text-cyan-300">
                  Free users receive 5 images every day.
                </p>
              </div>

              <div className="text-right">
                <div className="text-6xl font-black">{remainingImages}</div>
                <div className="text-blue-300">Remaining</div>
              </div>
            </div>

            <div className="mt-8 h-4 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min((remainingImages / 5) * 100, 100)
                  )}%`,
                }}
              />
            </div>

            <button
              onClick={resetImages}
              className="mt-8 rounded-xl bg-red-600 px-6 py-3 font-bold hover:bg-red-700"
            >
              Reset Daily Images
            </button>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8 shadow-2xl">
            <h2 className="mb-6 text-3xl font-bold">✍️ Describe Your Image</h2>

            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the image you want to create, or upload a reference photo and let SONET AI create the prompt for you..."
              className="h-44 w-full resize-none rounded-2xl border border-slate-600 bg-black/40 p-6 text-lg outline-none focus:border-cyan-500"
            />

            <div className="mt-8">
              <h3 className="text-xl font-bold">📷 Reference Photo</h3>
              <p className="mt-1 text-sm text-gray-400">
                Upload a photo and let SONET AI create a detailed generation
                prompt from it.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleReferenceImage}
                className="hidden"
              />

              {!referenceImage ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || analysingReference}
                  className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/30 bg-black/30 p-8 hover:border-cyan-400 disabled:opacity-50"
                >
                  <div className="text-5xl">📷</div>
                  <div className="mt-4 text-lg font-bold">
                    Upload Reference Photo
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    PNG, JPG, JPEG or WEBP • Maximum 10 MB
                  </div>
                </button>
              ) : (
                <div className="relative mt-4 overflow-hidden rounded-2xl border border-cyan-500/30">
                  <img
                    src={referencePreview}
                    alt="Reference preview"
                    className="max-h-[500px] w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={removeReferenceImage}
                    disabled={loading || analysingReference}
                    className="absolute right-4 top-4 rounded-xl bg-red-600 px-4 py-2 font-bold hover:bg-red-700"
                  >
                    ✕ Remove
                  </button>

                  <div className="bg-black/50 p-4">
                    <p className="truncate text-sm text-gray-300">
                      {referenceImage.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {(referenceImage.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {referenceImage && (
                <button
                  type="button"
                  onClick={handleAnalyseReference}
                  disabled={loading || analysingReference}
                  className="mt-5 w-full rounded-2xl bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-700 py-4 text-lg font-bold hover:scale-[1.01] disabled:bg-gray-700"
                >
                  {analysingReference
                    ? "✨ SONET AI is analysing your photo..."
                    : "✨ Generate Prompt from Reference Photo"}
                </button>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || analysingReference || remainingImages <= 0}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 py-4 text-xl font-bold hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-gray-700"
            >
              {loading
                ? "⏳ Generating..."
                : remainingImages <= 0
                  ? "Daily Limit Reached"
                  : referenceImage
                    ? "🚀 Generate Image from Prompt"
                    : "🚀 Generate Image"}
            </button>
          </div>

          <div className="mt-14">
            {loading ? (
              <div className="flex min-h-[550px] items-center justify-center rounded-3xl border border-dashed border-slate-700">
                <div className="text-center">
                  <div className="mx-auto h-24 w-24 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
                  <h2 className="mt-10 text-3xl font-bold">
                    Creating Your Masterpiece...
                  </h2>
                  <p className="mt-4 text-gray-400">
                    SONET AI is generating your image.
                  </p>
                </div>
              </div>
            ) : image ? (
              <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8 shadow-2xl">
                <h2 className="mb-8 text-3xl font-bold">🖼 Generated Image</h2>

                <img
                  src={image}
                  alt="Generated AI"
                  className="w-full rounded-2xl shadow-2xl"
                />

                <div className="mt-8 flex flex-col gap-4 md:flex-row">
                  <button
                    onClick={handleDownload}
                    className="flex-1 rounded-2xl bg-green-600 py-4 text-lg font-bold hover:bg-green-700"
                  >
                    ⬇ Download Image
                  </button>

                  <button
                    onClick={startNewPrompt}
                    className="flex-1 rounded-2xl bg-slate-700 py-4 text-lg font-bold hover:bg-slate-600"
                  >
                    ✏ New Prompt
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[550px] items-center justify-center rounded-3xl border border-dashed border-slate-700">
                <div className="text-center">
                  <div className="text-8xl">🎨</div>
                  <h2 className="mt-8 text-3xl font-bold">
                    Your AI Image Will Appear Here
                  </h2>
                  <p className="mt-4 text-gray-500">
                    Enter a prompt above and click Generate Image.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-20">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-3xl font-bold">🖼 Image History</h2>

              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
                >
                  🗑 Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 p-16 text-center">
                <div className="text-6xl">🖼</div>
                <h3 className="mt-6 text-2xl font-bold">No Images Yet</h3>
                <p className="mt-3 text-gray-500">
                  Your generated images will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {history.map((item, index) => (
                  <div
                    key={`${item.date}-${index}`}
                    className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/60 shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedHistoryImage(item)}
                      className="block w-full"
                    >
                      <img
                        src={item.image}
                        alt={item.prompt}
                        className="aspect-square w-full object-cover hover:scale-[1.02]"
                      />
                    </button>

                    <div className="p-5">
                      <p className="line-clamp-3 font-semibold">{item.prompt}</p>

                      <p className="mt-3 text-sm text-gray-500">{item.date}</p>

                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedHistoryImage(item)}
                          className="flex-1 rounded-lg bg-green-600 py-2 font-semibold hover:bg-green-700"
                        >
                          👁 View
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteHistoryItem(index)}
                          className="flex-1 rounded-lg bg-red-600 py-2 font-semibold hover:bg-red-700"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-20">
            <h2 className="mb-8 text-3xl font-bold">📝 Prompt History</h2>

            {promptHistory.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 p-12 text-center">
                <div className="text-6xl">✍️</div>
                <h3 className="mt-6 text-2xl font-bold">No Prompt History</h3>
                <p className="mt-3 text-gray-500">
                  Your previous prompts will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {promptHistory.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <p className="flex-1 text-gray-200">{item}</p>

                    <button
                      type="button"
                      onClick={() => usePrompt(item)}
                      className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold hover:bg-cyan-700"
                    >
                      🔁 Use Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedHistoryImage && (
        <ImagePreviewModal
          open={true}
          imageUrl={selectedHistoryImage.image}
          prompt={selectedHistoryImage.prompt}
          createdAt={selectedHistoryImage.date}
          onClose={() => setSelectedHistoryImage(null)}
        />
      )}
    </>
  );
}