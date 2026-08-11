import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-6 py-32">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -top-24 -left-20"></div>
      <div className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl bottom-0 right-0"></div>

      {/* Hero Content */}
      <div className="relative z-10">

        <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white">
          SONET AI STUDIO
        </h1>

        <p className="mt-6 text-3xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Making Life Lite
        </p>

        <p className="mt-8 max-w-3xl mx-auto text-xl text-gray-300 leading-relaxed">
          Welcome to the Future of AI Creativity.
          Create stunning AI images, cinematic AI videos,
          and professional prompts—all in one intelligent platform.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-6">

          <Link
            href="/ai-image"
            className="bg-blue-600 hover:bg-blue-700 hover:scale-105 duration-300 transition px-8 py-4 rounded-xl font-semibold shadow-xl"
          >
            🎨 AI Image Generator
          </Link>

          <Link
            href="/ai-video"
            className="bg-purple-600 hover:bg-purple-700 hover:scale-105 duration-300 transition px-8 py-4 rounded-xl font-semibold shadow-xl"
          >
            🎬 AI Video Generator
          </Link>

          <Link
            href="/prompt-library"
            className="bg-green-600 hover:bg-green-700 hover:scale-105 duration-300 transition px-8 py-4 rounded-xl font-semibold shadow-xl"
          >
            📚 Prompt Library
          </Link>

        </div>

      </div>

    </section>
  );
}