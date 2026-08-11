"use client";

import Image from "next/image";

export default function PromptHeader() {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-8">

        {/* LARGE LOGO — LEFT */}
        <div className="shrink-0">
          <Image
            src="/sonet-ai-studio-logo.png"
            alt="SONET AI STUDIO"
            width={420}
            height={140}
            priority
            className="h-auto w-[420px] object-contain"
          />
        </div>

        {/* HEADING — BESIDE LOGO, NOT UNDER IT */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-white">
            AI Prompt Builder
          </h1>

          <p className="mt-2 max-w-2xl text-base text-slate-400">
            Create, enhance and send AI prompts to your creative tools.
          </p>
        </div>

      </div>
    </header>
  );
}