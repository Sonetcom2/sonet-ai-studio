import type { Metadata } from "next";
import PromptBuilder from "@/components/prompt-builder/PromptBuilder";

export const metadata: Metadata = {
  title: "AI Prompt Builder | SONET AI STUDIO",
  description:
    "Create powerful, detailed and production-ready AI prompts with the SONET AI STUDIO Prompt Builder for images, videos and creative projects.",
  openGraph: {
    title: "AI Prompt Builder | SONET AI STUDIO",
    description:
      "Build better AI prompts for images, videos and creative projects with SONET AI STUDIO.",
    url: "https://www.sonetaistudio.com/prompt-builder",
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