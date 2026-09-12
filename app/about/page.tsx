import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SONET AI STUDIO | AI Creative Platform",
  description:
    "Learn about SONET AI STUDIO, an AI-powered creative platform designed to help creators, businesses and individuals create professional digital content faster.",
  openGraph: {
    title: "About SONET AI STUDIO | AI Creative Platform",
    description:
      "Discover SONET AI STUDIO and its AI-powered creative tools for images, videos, prompts and digital content.",
    url: "https://www.sonetaistudio.com/about",
    siteName: "SONET AI STUDIO",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="text-center">
          <h1 className="text-5xl font-bold">
            About SONET AI STUDIO
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400">
            SONET AI STUDIO is an AI-powered creative platform designed
            to help users create professional images, videos and other
            digital content from simple ideas and prompts.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <div className="text-4xl">🎨</div>

            <h2 className="mt-5 text-2xl font-bold">
              Creative Tools
            </h2>

            <p className="mt-3 text-slate-400">
              AI-powered tools for creating professional digital content.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <div className="text-4xl">🤖</div>

            <h2 className="mt-5 text-2xl font-bold">
              AI Technology
            </h2>

            <p className="mt-3 text-slate-400">
              Turn your ideas and prompts into high-quality creative
              results.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
            <div className="text-4xl">🚀</div>

            <h2 className="mt-5 text-2xl font-bold">
              Built for Creators
            </h2>

            <p className="mt-3 text-slate-400">
              A growing creative workspace for individuals and businesses.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}