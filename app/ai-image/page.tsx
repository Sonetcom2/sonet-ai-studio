"use client";

import { useEffect, useRef, useState } from "react";
import Toast from "@/components/Toast";

type HistoryItem = {
  image: string;
  prompt: string;
  date: string;
};

const MAX_REFERENCE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export default function AIImagePage() {
  const [prompt, setPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const [analysingReference, setAnalysingReference] =
    useState(false);

  const [image, setImage] = useState("");

  const [referenceImage, setReferenceImage] =
    useState<File | null>(null);

  const [referencePreview, setReferencePreview] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [promptHistory, setPromptHistory] =
    useState<string[]>([]);

  const [remainingImages, setRemainingImages] =
    useState(5);

  const [toast, setToast] = useState("");

  const [toastType, setToastType] =
    useState<"success" | "error" | "info">("info");

  // ==========================================
  // LOAD REMAINING DAILY IMAGES
  // ==========================================

  useEffect(() => {
    const saved =
      localStorage.getItem("remainingImages");

    if (saved !== null) {
      setRemainingImages(Number(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "remainingImages",
      remainingImages.toString()
    );
  }, [remainingImages]);

  // ==========================================
  // LOAD IMAGE HISTORY
  // ==========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("imageHistory");

      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error(
        "Unable to load image history:",
        error
      );
    }
  }, []);

  // ==========================================
  // LOAD PROMPT HISTORY
  // ==========================================

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem("promptHistory");

      if (saved) {
        setPromptHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error(
        "Unable to load prompt history:",
        error
      );
    }
  }, []);

  // ==========================================
  // TOAST AUTO HIDE
  // ==========================================

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ==========================================
  // CLEAN REFERENCE PREVIEW
  // ==========================================

  useEffect(() => {
    return () => {
      if (referencePreview) {
        URL.revokeObjectURL(referencePreview);
      }
    };
  }, [referencePreview]);

  // ==========================================
  // RESET DAILY IMAGES
  // ==========================================

  function resetImages() {
    localStorage.removeItem("remainingImages");

    setRemainingImages(5);

    setPrompt("");

    setImage("");

    setToastType("success");

    setToast("Daily images have been reset.");
  }

  // ==========================================
  // SELECT REFERENCE IMAGE
  // ==========================================

  function handleReferenceImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setToastType("error");

      setToast(
        "Please upload a PNG, JPG, JPEG, or WEBP image."
      );

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

      setToast(
        "Reference image must be smaller than 10 MB."
      );

      event.target.value = "";

      return;
    }

    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setReferenceImage(file);

    setReferencePreview(previewUrl);

    setToastType("success");

    setToast("Reference photo added.");
  }

  // ==========================================
  // REMOVE REFERENCE IMAGE
  // ==========================================

  function removeReferenceImage() {
    if (referencePreview) {
      URL.revokeObjectURL(referencePreview);
    }

    setReferenceImage(null);

    setReferencePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setToastType("info");

    setToast("Reference photo removed.");
  }

  // ==========================================
  // GENERATE PROMPT FROM REFERENCE PHOTO
  // ==========================================

  async function handleAnalyseReference() {
    if (!referenceImage) {
      setToastType("error");

      setToast(
        "Please upload a reference photo first."
      );

      return;
    }

    if (analysingReference || loading) {
      return;
    }

    setAnalysingReference(true);

    try {
      console.log(
        "✨ Starting reference prompt generation..."
      );

      const formData = new FormData();

      formData.append(
        "reference",
        referenceImage
      );

      const response = await fetch(
        "/api/analyse-reference",
        {
          method: "POST",
          body: formData,
        }
      );

      console.log(
        "Reference analysis response:",
        response.status
      );

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      console.log(
        "Reference analysis result:",
        data
      );

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to generate a prompt from the reference photo."
        );
      }

      if (
        !data.prompt ||
        typeof data.prompt !== "string"
      ) {
        throw new Error(
          "SONET AI did not return a valid prompt."
        );
      }

      // Put the generated prompt directly
      // into the main prompt textarea.
      setPrompt(data.prompt.trim());

      setToastType("success");

      setToast(
        "✨ SONET AI generated a prompt from your reference photo."
      );

      // Bring the prompt area into view.
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);
    } catch (error: any) {
      console.error(
        "Reference prompt generation error:",
        error
      );

      setToastType("error");

      setToast(
        error?.message ||
          "Unable to generate a prompt from the reference photo."
      );
    } finally {
      setAnalysingReference(false);
    }
  }

  // ==========================================
  // DOWNLOAD GENERATED IMAGE
  // ==========================================

  async function handleDownload() {
    if (!image) return;

    try {
      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(
          image
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Download failed."
        );
      }

      const blob =
        await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download =
        `sonet-ai-${Date.now()}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(
        downloadUrl
      );

      setToastType("success");

      setToast(
        "Image downloaded successfully!"
      );
    } catch (error) {
      console.error(
        "Download error:",
        error
      );

      setToastType("error");

      setToast(
        "Failed to download image."
      );
    }
  }

  // ==========================================
  // GENERATE AI IMAGE
  // ==========================================

  async function handleGenerate() {
    if (!prompt.trim()) {
      setToastType("error");

      setToast(
        "Please enter a prompt first."
      );

      return;
    }

    if (remainingImages <= 0) {
      setToastType("info");

      setToast(
        "You've reached today's free image limit."
      );

      return;
    }

    setLoading(true);

    setImage("");

    try {
      const formData = new FormData();

      formData.append(
        "prompt",
        prompt.trim()
      );

      formData.append(
        "model",
        "gpt-image-1"
      );

      formData.append(
        "quality",
        "high"
      );

      formData.append(
        "style",
        "auto"
      );

      formData.append(
        "aspectRatio",
        "1:1"
      );

      if (referenceImage) {
        formData.append(
          "referenceImage",
          referenceImage
        );
      }

      const response = await fetch(
        "/api/generate-image",
        {
          method: "POST",
          body: formData,
        }
      );

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Image generation failed."
        );
      }

      setImage(data.image);

      if (
        typeof data.creditsRemaining ===
        "number"
      ) {
        setRemainingImages(
          data.creditsRemaining
        );
      } else {
        setRemainingImages(
          (previous) =>
            Math.max(
              previous - 1,
              0
            )
        );
      }

      // ========================================
      // SAVE IMAGE HISTORY
      // ========================================

      const newHistory: HistoryItem = {
        image: data.image,
        prompt: prompt.trim(),
        date:
          new Date().toLocaleString(),
      };

      const updatedHistory = [
        newHistory,
        ...history,
      ];

      setHistory(updatedHistory);

      localStorage.setItem(
        "imageHistory",
        JSON.stringify(
          updatedHistory
        )
      );

      // ========================================
      // SAVE PROMPT HISTORY
      // ========================================

      const updatedPrompts = [
        prompt.trim(),
        ...promptHistory.filter(
          (item) =>
            item !== prompt.trim()
        ),
      ].slice(0, 50);

      setPromptHistory(
        updatedPrompts
      );

      localStorage.setItem(
        "promptHistory",
        JSON.stringify(
          updatedPrompts
        )
      );

      setToastType("success");

      setToast(
        data.hasReferenceImage
          ? "Image generated using your reference photo!"
          : "Image generated successfully!"
      );
    } catch (error: any) {
      console.error(
        "Image generation error:",
        error
      );

      setToastType("error");

      setToast(
        error?.message ||
          "Something went wrong while generating the image."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // CLEAR IMAGE HISTORY
  // ==========================================

  function clearHistory() {
    setHistory([]);

    localStorage.removeItem(
      "imageHistory"
    );

    setToastType("success");

    setToast(
      "Image history cleared."
    );
  }

  // ==========================================
  // DELETE HISTORY ITEM
  // ==========================================

  function deleteHistoryItem(
    index: number
  ) {
    const updatedHistory =
      history.filter(
        (_, i) => i !== index
      );

    setHistory(updatedHistory);

    localStorage.setItem(
      "imageHistory",
      JSON.stringify(
        updatedHistory
      )
    );

    setToastType("success");

    setToast("Image deleted.");
  }

  // ==========================================
  // USE PROMPT AGAIN
  // ==========================================

  function usePrompt(
    selectedPrompt: string
  ) {
    setPrompt(selectedPrompt);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    setToastType("info");

    setToast(
      "Prompt loaded. You can edit it before generating."
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast}
          type={toastType}
        />
      )}

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6 py-16 text-white">

        <div className="mx-auto max-w-6xl">

          {/* ================================== */}
          {/* HEADER */}
          {/* ================================== */}

          <div className="mb-12 text-center">

            <h1 className="text-6xl font-black">
              🎨 SONET AI Image Studio
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-xl text-gray-400">
              Create stunning AI-generated
              images from your own prompt
              or use a reference photo to
              automatically create a detailed
              AI prompt.
            </p>

          </div>

          {/* ================================== */}
          {/* DAILY IMAGES */}
          {/* ================================== */}

          <div className="mb-12 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-blue-900/40 to-indigo-900/30 p-8 shadow-2xl backdrop-blur-lg">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-3xl font-bold">
                  🎁 Daily Free Images
                </h2>

                <p className="mt-2 text-cyan-300">
                  Free users receive 5
                  images every day.
                </p>

              </div>

              <div className="text-right">

                <div className="text-6xl font-black">
                  {remainingImages}
                </div>

                <div className="text-blue-300">
                  Remaining
                </div>

              </div>

            </div>

            <div className="mt-8 h-4 w-full overflow-hidden rounded-full bg-slate-800">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 transition-all duration-700"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      (remainingImages / 5) *
                        100,
                      100
                    )
                  )}%`,
                }}
              />

            </div>

            <button
              onClick={resetImages}
              className="mt-8 rounded-xl bg-red-600 px-6 py-3 font-bold transition hover:bg-red-700"
            >
              Reset Daily Images
            </button>

          </div>

          {/* ================================== */}
          {/* PROMPT SECTION */}
          {/* ================================== */}

          <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8 shadow-2xl">

            <h2 className="mb-6 text-3xl font-bold">
              ✍️ Describe Your Image
            </h2>

            <textarea
              value={prompt}
              onChange={(event) =>
                setPrompt(
                  event.target.value
                )
              }
              placeholder="Describe the image you want to create, or upload a reference photo and let SONET AI create the prompt for you..."
              className="h-44 w-full resize-none rounded-2xl border border-slate-600 bg-black/40 p-6 text-lg outline-none transition focus:border-cyan-500"
            />

            {/* ================================= */}
            {/* REFERENCE PHOTO */}
            {/* ================================= */}

            <div className="mt-8">

              <div className="mb-4">

                <h3 className="text-xl font-bold">
                  📷 Reference Photo
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Upload a photo and let
                  SONET AI create a detailed
                  generation prompt from it.
                </p>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={
                  handleReferenceImage
                }
                className="hidden"
              />

              {!referenceImage ? (

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={
                    loading ||
                    analysingReference
                  }
                  className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/30 bg-black/30 p-8 text-center transition hover:border-cyan-400 hover:bg-cyan-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <div className="text-5xl">
                    📷
                  </div>

                  <div className="mt-4 text-lg font-bold">
                    Upload Reference Photo
                  </div>

                  <div className="mt-2 text-sm text-gray-400">
                    PNG, JPG, JPEG or WEBP
                    • Maximum 10 MB
                  </div>

                </button>

              ) : (

                <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-black/40">

                  <img
                    src={referencePreview}
                    alt="Reference preview"
                    className="max-h-[500px] w-full object-contain"
                  />

                  <div className="absolute left-4 top-4 rounded-full bg-black/75 px-4 py-2 text-sm font-semibold backdrop-blur">
                    📷 Reference Photo
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeReferenceImage
                    }
                    disabled={
                      loading ||
                      analysingReference
                    }
                    className="absolute right-4 top-4 rounded-xl bg-red-600 px-4 py-2 font-bold transition hover:bg-red-700 disabled:opacity-50"
                  >
                    ✕ Remove
                  </button>

                  <div className="border-t border-white/10 bg-black/50 p-4">

                    <p className="truncate text-sm text-gray-300">
                      {referenceImage.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {(
                        referenceImage.size /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </p>

                  </div>

                </div>

              )}

              {/* ================================= */}
              {/* AI PROMPT GENERATOR BUTTON */}
              {/* ================================= */}

              {referenceImage && (

                <div className="mt-5">

                  <button
                    type="button"
                    onClick={
                      handleAnalyseReference
                    }
                    disabled={
                      loading ||
                      analysingReference
                    }
                    className={`w-full rounded-2xl py-4 text-lg font-bold transition-all ${
                      analysingReference
                        ? "cursor-not-allowed bg-gray-700"
                        : "bg-gradient-to-r from-purple-600 via-cyan-600 to-blue-700 hover:scale-[1.01]"
                    }`}
                  >

                    {analysingReference ? (
                      <span className="flex items-center justify-center gap-3">

                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                        ✨ SONET AI is analysing your photo...

                      </span>
                    ) : (
                      "✨ Generate Prompt from Reference Photo"
                    )}

                  </button>

                  <p className="mt-3 text-center text-sm text-gray-500">
                    SONET AI will analyse the visible
                    subject, clothing, pose, lighting,
                    composition and other details.
                  </p>

                </div>

              )}

            </div>

            {/* ================================= */}
            {/* GENERATE IMAGE BUTTON */}
            {/* ================================= */}

            <div className="mt-8 flex flex-col gap-4 md:flex-row">

              <button
                onClick={
                  handleGenerate
                }
                disabled={
                  loading ||
                  analysingReference ||
                  remainingImages <= 0
                }
                className={`flex-1 rounded-2xl py-4 text-xl font-bold transition-all duration-300 ${
                  loading ||
                  analysingReference ||
                  remainingImages <= 0
                    ? "cursor-not-allowed bg-gray-700"
                    : "bg-gradient-to-r from-cyan-600 to-blue-700 hover:scale-[1.02]"
                }`}
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

          </div>

          {/* ================================== */}
          {/* GENERATED IMAGE */}
          {/* ================================== */}

          <div className="mt-14">

            {loading ? (

              <div className="flex min-h-[550px] items-center justify-center rounded-3xl border border-dashed border-slate-700">

                <div className="text-center">

                  <div className="mx-auto h-24 w-24 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />

                  <h2 className="mt-10 text-3xl font-bold">
                    Creating Your Masterpiece...
                  </h2>

                  <p className="mt-4 text-gray-400">
                    SONET AI is generating
                    your image.
                  </p>

                </div>

              </div>

            ) : image ? (

              <div className="rounded-3xl border border-slate-700 bg-slate-900/60 p-8 shadow-2xl">

                <h2 className="mb-8 text-3xl font-bold">
                  🖼 Generated Image
                </h2>

                <img
                  src={image}
                  alt="Generated AI"
                  className="w-full rounded-2xl shadow-2xl"
                />

                <div className="mt-8 flex flex-col gap-4 md:flex-row">

                  <button
                    onClick={
                      handleDownload
                    }
                    className="flex-1 rounded-2xl bg-green-600 py-4 text-lg font-bold transition hover:bg-green-700"
                  >
                    ⬇ Download Image
                  </button>

                  <button
                    onClick={() => {
                      setPrompt("");
                      setImage("");
                      removeReferenceImage();
                    }}
                    className="flex-1 rounded-2xl bg-slate-700 py-4 text-lg font-bold transition hover:bg-slate-600"
                  >
                    ✏ New Prompt
                  </button>

                </div>

              </div>

            ) : (

              <div className="flex min-h-[550px] items-center justify-center rounded-3xl border border-dashed border-slate-700">

                <div className="text-center">

                  <div className="text-8xl">
                    🎨
                  </div>

                  <h2 className="mt-8 text-3xl font-bold">
                    Your AI Image Will
                    Appear Here
                  </h2>

                  <p className="mt-4 text-gray-500">
                    Enter a prompt above
                    and click Generate Image.
                  </p>

                </div>

              </div>

            )}

          </div>

          {/* ================================== */}
          {/* IMAGE HISTORY */}
          {/* ================================== */}

          <div className="mt-20">

            <div className="mb-8 flex items-center justify-between">

              <h2 className="text-3xl font-bold">
                🖼 Image History
              </h2>

              {history.length > 0 && (

                <button
                  onClick={
                    clearHistory
                  }
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
                >
                  🗑 Clear History
                </button>

              )}

            </div>

            {history.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-slate-700 p-16 text-center">

                <div className="text-6xl">
                  🖼
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  No Images Yet
                </h3>

                <p className="mt-3 text-gray-500">
                  Your generated images
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

                {history.map(
                  (item, index) => (

                    <div
                      key={`${item.date}-${index}`}
                      className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900/60 shadow-xl"
                    >

                      <img
                        src={item.image}
                        alt={item.prompt}
                        className="aspect-square w-full object-cover"
                      />

                      <div className="p-5">

                        <p className="line-clamp-3 font-semibold">
                          {item.prompt}
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                          {item.date}
                        </p>

                        <div className="mt-6 flex gap-3">

                          <button
                            onClick={() =>
                              window.open(
                                item.image,
                                "_blank"
                              )
                            }
                            className="flex-1 rounded-lg bg-green-600 py-2 font-semibold transition hover:bg-green-700"
                          >
                            👁 View
                          </button>

                          <button
                            onClick={() =>
                              deleteHistoryItem(
                                index
                              )
                            }
                            className="flex-1 rounded-lg bg-red-600 py-2 font-semibold transition hover:bg-red-700"
                          >
                            🗑 Delete
                          </button>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

          {/* ================================== */}
          {/* PROMPT HISTORY */}
          {/* ================================== */}

          <div className="mt-20">

            <h2 className="mb-8 text-3xl font-bold">
              📝 Prompt History
            </h2>

            {promptHistory.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-slate-700 p-12 text-center">

                <div className="text-6xl">
                  ✍️
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  No Prompt History
                </h3>

                <p className="mt-3 text-gray-500">
                  Your previous prompts
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {promptHistory.map(
                  (item, index) => (

                    <div
                      key={`${item}-${index}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 md:flex-row md:items-center md:justify-between"
                    >

                      <p className="flex-1 text-gray-200">
                        {item}
                      </p>

                      <button
                        onClick={() =>
                          usePrompt(item)
                        }
                        className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold transition hover:bg-cyan-700"
                      >
                        🔁 Use Again
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </main>
    </>
  );
}