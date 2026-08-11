"use client";

import { promptTemplates } from "../../data/prompt-templates";
import { PromptSelection } from "../../types/prompt";

interface QuickTemplatesProps {
  onSelect: (template: PromptSelection) => void;
}

const templateIcons: Record<string, string> = {
  Portrait: "👤",
  Fashion: "👗",
  Food: "🍔",
  Product: "💎",
  RealEstate: "🏠",
  Flyer: "📄",
  Logo: "🎨",
  Cinematic: "🎬",
  Anime: "🤖",
};

export default function QuickTemplates({
  onSelect,
}: QuickTemplatesProps) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-white">
            🚀 Quick Templates
          </h2>

          <p className="mt-2 text-slate-400">
            Select a professionally designed template to instantly populate
            your prompt builder with optimized settings.
          </p>
        </div>

      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">

        {Object.entries(promptTemplates).map(([name, template]) => (

          <button
            key={name}
            onClick={() => onSelect(template)}
            className="group rounded-2xl border border-slate-700 bg-slate-800 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-600 hover:to-blue-600"
          >

            <div className="mb-3 text-4xl">
              {templateIcons[name] || "✨"}
            </div>

            <h3 className="text-lg font-semibold text-white">
              {name}
            </h3>

            <p className="mt-2 text-xs text-slate-400 group-hover:text-white">
              One-click professional preset
            </p>

          </button>

        ))}

      </div>

    </div>
  );
}