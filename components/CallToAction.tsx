import Link from "next/link";

export default function CallToAction() {
  return (
    <section className="py-32 px-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-center text-white">
      <div className="max-w-4xl mx-auto">

        <h2 className="text-5xl md:text-6xl font-black">
          Ready to Build with AI?
        </h2>

        <p className="mt-8 text-xl text-blue-100 leading-8">
          Join the next generation of creators using SONET AI STUDIO to
          generate images, videos, prompts and more—all in one platform.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-6">

          <Link
            href="/pricing"
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:scale-105 transition duration-300 shadow-xl"
          >
            🚀 Start Free
          </Link>

          <Link
            href="/about"
            className="border border-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-700 transition duration-300"
          >
            Learn More
          </Link>

        </div>

      </div>
    </section>
  );
}