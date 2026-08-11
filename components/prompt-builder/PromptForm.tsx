"use client";

import PromptSelector from "./PromptSelector";
import { PromptSelection } from "../../types/prompt";

import {
  subjects,
  styles,
  cameras,
  lighting,
  backgrounds,
  poses,
  clothing,
  hairstyles,
  moods,
  qualities,
} from "../../data/prompt-options";

interface Props {
  prompt: PromptSelection;
  setPrompt: React.Dispatch<React.SetStateAction<PromptSelection>>;
}
const shouldShow = (
  subject: string,
  field:
    | "pose"
    | "clothing"
    | "hair"
    | "camera"
    | "lighting"
) => {

  const s = subject.toLowerCase();

  // FOOD
  if (
    s.includes("burger") ||
    s.includes("pizza") ||
    s.includes("cake") ||
    s.includes("coffee") ||
    s.includes("food") ||
    s.includes("meal")
  ) {

    if (
      field === "pose" ||
      field === "clothing" ||
      field === "hair"
    ) {
      return false;
    }

  }

  // PRODUCTS

  if (
    s.includes("perfume") ||
    s.includes("watch") ||
    s.includes("jewellery") ||
    s.includes("laptop") ||
    s.includes("smartphone") ||
    s.includes("camera") ||
    s.includes("product")
  ) {

    if (
      field === "pose" ||
      field === "clothing" ||
      field === "hair"
    ) {
      return false;
    }

  }

  // LOGO

  if (
    s.includes("logo")
  ) {

    return false;

  }

  // FLYER

  if (
    s.includes("flyer")
  ) {

    if (
      field === "pose" ||
      field === "clothing" ||
      field === "hair" ||
      field === "camera" ||
      field === "lighting"
    ) {
      return false;
    }

  }

  return true;

};
export default function PromptForm({
  prompt,
  setPrompt,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-8 backdrop-blur-xl shadow-2xl">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">
          🎨 Build Your Prompt
        </h2>

        <p className="mt-2 text-slate-400">
          Select your preferred options below.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <PromptSelector
          label="Subject"
          value={prompt.subject}
          options={subjects}
          onChange={(value) =>
            setPrompt({
              ...prompt,
              subject: value,
            })
          }
        />

        <PromptSelector
          label="Style"
          value={prompt.style}
          options={styles}
          onChange={(value) =>
            setPrompt({
              ...prompt,
              style: value,
            })
          }
        />

       {shouldShow(prompt.subject, "camera") && (
  <PromptSelector
    label="Camera"
    value={prompt.camera}
    options={cameras}
    onChange={(value) =>
      setPrompt({
        ...prompt,
        camera: value,
      })
    }
  />
)}

       {shouldShow(prompt.subject, "lighting") && (
  <PromptSelector
    label="Lighting"
    value={prompt.lighting}
    options={lighting}
    onChange={(value) =>
      setPrompt({
        ...prompt,
        lighting: value,
      })
    }
  />
)}

        <PromptSelector
          label="Background"
          value={prompt.background}
          options={backgrounds}
          onChange={(value) =>
            setPrompt({
              ...prompt,
              background: value,
            })
          }
        />

        {shouldShow(prompt.subject, "pose") && (
  <PromptSelector
    label="Pose"
    value={prompt.pose}
    options={poses}
    onChange={(value) =>
      setPrompt({
        ...prompt,
        pose: value,
      })
    }
  />
)}

        {shouldShow(prompt.subject, "clothing") && (
  <PromptSelector
    label="Clothing"
    value={prompt.clothing}
    options={clothing}
    onChange={(value) =>
      setPrompt({
        ...prompt,
        clothing: value,
      })
    }
  />
)}

        {shouldShow(prompt.subject, "hair") && (
  <PromptSelector
    label="Hair Style"
    value={prompt.hair}
    options={hairstyles}
    onChange={(value) =>
      setPrompt({
        ...prompt,
        hair: value,
      })
    }
  />
)}

        <PromptSelector
          label="Mood"
          value={prompt.mood}
          options={moods}
          onChange={(value) =>
            setPrompt({
              ...prompt,
              mood: value,
            })
          }
        />

        <PromptSelector
          label="Quality"
          value={prompt.quality}
          options={qualities}
          onChange={(value) =>
            setPrompt({
              ...prompt,
              quality: value,
            })
          }
        />

      </div>

      <div className="mt-8">

        <label className="mb-3 block text-sm font-semibold text-slate-300">
          Negative Prompt
        </label>

        <textarea
          rows={5}
          value={prompt.negativePrompt}
          onChange={(e) =>
            setPrompt({
              ...prompt,
              negativePrompt: e.target.value,
            })
          }
          placeholder="Things you DON'T want AI to generate..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-purple-500"
        />

      </div>

    </div>
  );
}