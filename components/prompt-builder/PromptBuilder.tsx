"use client";

import { useState } from "react";

import PromptHeader from "./PromptHeader";
import WorkspaceTabs, { WorkspaceTab } from "./WorkspaceTabs";
import QuickTemplates from "./QuickTemplates";
import PromptWorkspace from "./PromptWorkspace";
import PromptSettings from "./PromptSettings";
import ImageStudio from "./ImageStudio";
import LibraryWorkspace from "./LibraryWorkspace";

import { promptTemplates } from "../../data/prompt-templates";
import { PromptSelection } from "../../types/prompt";

export default function PromptBuilder() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("prompt");

  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptSelection>(promptTemplates.Portrait);

  const [subject, setSubject] = useState("African Woman");
  const [style, setStyle] = useState("Luxury Fashion");
  const [camera, setCamera] = useState("85mm Portrait");
  const [lighting, setLighting] = useState("Soft Studio");
  const [background, setBackground] = useState("Luxury Studio");
  const [pose, setPose] = useState("Standing");
  const [clothing, setClothing] = useState("Luxury Suit");
  const [hair, setHair] = useState("Long Wavy");
  const [mood, setMood] = useState("Elegant");
  const [quality, setQuality] = useState("high");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);

  function generatePrompt() {
    const prompt = `
Subject:
${subject}

Style:
${style}

Camera:
${camera}

Lighting:
${lighting}

Background:
${background}

Pose:
${pose}

Clothing:
${clothing}

Hair Style:
${hair}

Mood:
${mood}

Quality:
${quality}

${title ? `Title:
${title}` : ""}

${description ? `Description:

${description}` : ""}

${negativePrompt ? `Negative Prompt:

${negativePrompt}` : ""}

Ultra realistic.

Professional composition.

8K HDR.

Extremely detailed.
`.trim();

    setGeneratedPrompt(prompt);
  }

  async function generateImage() {
    if (!generatedPrompt.trim()) {
      alert("Generate a prompt first.");
      return;
    }

    try {
      setLoadingImage(true);

      const formData = new FormData();

      formData.append("prompt", generatedPrompt.trim());
      formData.append("model", "gpt-image-1");
      formData.append("quality", quality);
      formData.append("style", "auto");
      formData.append("aspectRatio", "1:1");

      const response = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });

      let data: any;

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Image generation failed.");
      }

      setGeneratedImage(data.image);
      setActiveTab("image");
    } catch (error: any) {
      console.error("Prompt Builder image generation error:", error);
      alert(error?.message || "Failed to generate image.");
    } finally {
      setLoadingImage(false);
    }
  }

  async function savePrompt() {
    if (!generatedPrompt.trim()) {
      alert("Generate a prompt first.");
      return;
    }

    try {
      const response = await fetch("/api/save-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          prompt: generatedPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save prompt.");
      }

      alert("Prompt saved successfully.");
    } catch (error: any) {
      console.error("Save prompt error:", error);
      alert(error?.message || "Unable to save prompt.");
    }
  }

  function enhancePrompt() {
    alert("AI Prompt Enhancement will be connected next.");
  }

  function handleTemplateSelect(template: PromptSelection) {
    setSelectedTemplate(template);
    setSubject(template.subject);
    setStyle(template.style);
    setCamera(template.camera);
    setLighting(template.lighting);
    setBackground(template.background);
    setPose(template.pose);
    setClothing(template.clothing);
    setHair(template.hair);
    setMood(template.mood);
    setNegativePrompt(template.negativePrompt);
  }

  function renderWorkspace() {
    switch (activeTab) {
      case "prompt":
        return (
          <>
            <QuickTemplates onSelect={handleTemplateSelect} />

            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <PromptSettings
                subject={subject}
                setSubject={setSubject}
                style={style}
                setStyle={setStyle}
                camera={camera}
                setCamera={setCamera}
                lighting={lighting}
                setLighting={setLighting}
                background={background}
                setBackground={setBackground}
                pose={pose}
                setPose={setPose}
                clothing={clothing}
                setClothing={setClothing}
                hair={hair}
                setHair={setHair}
                mood={mood}
                setMood={setMood}
                quality={quality}
                setQuality={setQuality}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
              />

              <div className="lg:col-span-2">
                <PromptWorkspace
                  title={title}
                  description={description}
                  negativePrompt={negativePrompt}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setNegativePrompt={setNegativePrompt}
                  generatedPrompt={generatedPrompt}
                  generatedImage={generatedImage}
                  loadingImage={loadingImage}
                  onGenerate={generatePrompt}
                  onGenerateImage={generateImage}
                  onEnhance={enhancePrompt}
                  onSave={savePrompt}
                />
              </div>
            </div>
          </>
        );

      case "image":
        return (
          <ImageStudio image={generatedImage} loading={loadingImage} />
        );

      case "video":
        return (
          <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-12 shadow-2xl">
            <div className="text-center">
              <div className="mb-6 text-7xl">🎥</div>
              <h2 className="text-3xl font-bold text-white">
                Video Studio
              </h2>
              <p className="mt-4 text-slate-400">
                Generate cinematic AI videos from prompts or images.
              </p>
              <button className="mt-8 rounded-xl bg-purple-600 px-8 py-4 font-semibold text-white transition hover:bg-purple-700">
                Coming Soon
              </button>
            </div>
          </div>
        );

      case "library":
        return <LibraryWorkspace />;

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-indigo-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <PromptHeader />

        <div className="mt-8">
          <WorkspaceTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        <div className="mt-8">{renderWorkspace()}</div>
      </div>
    </div>
  );
}