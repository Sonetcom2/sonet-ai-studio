import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Stats from "../components/Stats";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import CallToAction from "../components/CallToAction";
import Founder from "../components/Founder";
import Footer from "../components/Footer";
import Link from "next/link";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <Script
        id="sonet-ai-studio-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id":
                  "https://www.sonetaistudio.com/#organization",
                name: "SONET AI STUDIO",
                url: "https://www.sonetaistudio.com/",
                logo: {
                  "@type": "ImageObject",
                  url: "https://www.sonetaistudio.com/images/sonet-ai-studio-og.png",
                },
                description:
                  "SONET AI STUDIO is an all-in-one AI creative platform for generating images, videos, prompts, voice content and marketing content faster.",
              },
              {
                "@type": "WebSite",
                "@id":
                  "https://www.sonetaistudio.com/#website",
                url: "https://www.sonetaistudio.com/",
                name: "SONET AI STUDIO",
                publisher: {
                  "@id":
                    "https://www.sonetaistudio.com/#organization",
                },
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-indigo-900 text-white">
        <Navbar />

        <Hero />

        {/* Voice Studio Highlight */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-950/70 to-blue-600/10 p-8 shadow-2xl sm:p-12">

              {/* Background Glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

              <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">

                {/* Content */}
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
                    <span>🎙️</span>
                    New Feature — Voice Studio
                  </div>

                  <h2 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                    Turn Your Words Into{" "}
                    <span className="text-cyan-400">
                      Natural AI Voice
                    </span>
                  </h2>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    Create professional AI voiceovers, announcements,
                    storytelling, social media content, and more directly
                    inside SONET AI STUDIO.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/voice"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                    >
                      <span>🎙️</span>
                      Try Voice Studio
                    </Link>

                    <Link
                      href="/pricing"
                      className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      View Pricing
                    </Link>
                  </div>
                </div>

                {/* Feature Cards */}
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
                    <div className="text-2xl">🎧</div>
                    <h3 className="mt-3 font-semibold">
                      Natural Voices
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Choose from multiple professional AI voices.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
                    <div className="text-2xl">⚡</div>
                    <h3 className="mt-3 font-semibold">
                      Fast Generation
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Convert your written content into speech quickly.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur">
                    <div className="text-2xl">💳</div>
                    <h3 className="mt-3 font-semibold">
                      Credit Based
                    </h3>
                    <p className="mt-1 text-sm leading-5 text-slate-400">
                      Generate voice using your SONET AI STUDIO credits.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <Features />
        <Stats />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
        <CallToAction />
        <Founder />
        <Footer />
      </main>
    </>
  );
}