import type { Metadata } from "next";
import PromptBuilder from "@/components/prompt-builder/PromptBuilder";

export const metadata: Metadata = {
  title: "AI Prompt Library | SONET AI STUDIO",
  description:
    "Explore useful AI prompts with the SONET AI STUDIO Prompt Library and create better prompts for images, videos, marketing and creative projects.",
  openGraph: {
    title: "AI Prompt Library | SONET AI STUDIO",
    description:
      "Discover useful AI prompts for images, videos, marketing and creative projects with SONET AI STUDIO.",
    url: "https://www.sonetaistudio.com/prompt-library",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function PromptBuilderPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <PromptBuilder />
    </main>
  );
}