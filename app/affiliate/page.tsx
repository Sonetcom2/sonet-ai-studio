
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AffiliatePage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setIsLoggedIn(Boolean(user));
      } catch (error) {
        console.error(
          "Affiliate authentication check error:",
          error
        );

        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuthentication();
  }, [supabase]);

  function handleAffiliateJoin() {
    if (checkingAuth) return;

    if (isLoggedIn) {
      router.push("/affiliate/dashboard");
      return;
    }

    router.push(
      "/login?redirect=/affiliate/dashboard"
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-indigo-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 text-sm font-semibold text-yellow-300">
            💰 SONET AI STUDIO Affiliate Program
          </div>

          <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
            Earn by Sharing
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-400 to-cyan-400 bg-clip-text text-transparent">
              the Future of AI
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
            Recommend SONET AI STUDIO to creators, entrepreneurs,
            businesses, and anyone looking for powerful AI tools.
            Share your referral link and earn commissions when
            people join through you.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleAffiliateJoin}
              disabled={checkingAuth}
              className="rounded-xl bg-yellow-500 px-8 py-4 font-bold text-black shadow-xl transition hover:scale-105 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingAuth
                ? "Checking Account..."
                : isLoggedIn
                ? "🚀 Open Affiliate Dashboard"
                : "🚀 Join the Affiliate Program"}
            </button>

            <Link
              href="/"
              className="rounded-xl border border-slate-700 bg-slate-900 px-8 py-4 font-semibold text-white transition hover:border-cyan-500"
            >
              ← Back to SONET AI STUDIO
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-slate-800 bg-slate-950/70 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold sm:text-5xl">
            Why Become a SONET Affiliate?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            Turn your audience, network, and online presence into
            an opportunity to earn while introducing people to
            useful AI tools.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl transition hover:-translate-y-2 hover:border-yellow-500/50">
              <div className="text-4xl">💸</div>

              <h3 className="mt-6 text-2xl font-bold">
                Earn Commissions
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Earn commissions from qualifying customers who
                join SONET AI STUDIO through your referral.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl transition hover:-translate-y-2 hover:border-cyan-500/50">
              <div className="text-4xl">🔗</div>

              <h3 className="mt-6 text-2xl font-bold">
                Share Your Link
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Promote SONET AI STUDIO through WhatsApp,
                Facebook, social media, websites, communities,
                or your personal network.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl transition hover:-translate-y-2 hover:border-purple-500/50">
              <div className="text-4xl">📈</div>

              <h3 className="mt-6 text-2xl font-bold">
                Grow With Us
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Help more people discover AI-powered creativity
                while building your own referral income stream.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Promote */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-4xl font-bold sm:text-5xl">
            What You Can Promote
          </h2>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🤖",
                title: "SONET AI Assistant",
                text: "An AI assistant for creative work, business questions, content, prompts, and everyday tasks.",
              },
              {
                icon: "🎨",
                title: "AI Image Generator",
                text: "Create professional AI-generated images for businesses, creators, products, and personal projects.",
              },
              {
                icon: "🎬",
                title: "AI Video Generator",
                text: "Turn ideas and prompts into cinematic AI-powered video content.",
              },
              {
                icon: "✨",
                title: "Prompt Engineer",
                text: "Build detailed, production-ready prompts for AI creative workflows.",
              },
              {
                icon: "📚",
                title: "Prompt Library",
                text: "Discover useful prompts designed to help users create faster and better.",
              },
              {
                icon: "🚀",
                title: "SONET AI STUDIO",
                text: "Promote the complete AI creativity platform and its growing collection of tools.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-cyan-500/40"
              >
                <div className="text-3xl">{item.icon}</div>

                <h3 className="mt-4 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-800 bg-black/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-4xl font-bold sm:text-5xl">
            How It Works
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-2xl font-black text-cyan-400">
                1
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Join
              </h3>

              <p className="mt-3 text-slate-400">
                Create your SONET AI STUDIO account and become
                eligible to participate in the affiliate program.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-2xl font-black text-purple-400">
                2
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Share
              </h3>

              <p className="mt-3 text-slate-400">
                Share your unique referral link with your
                audience, customers, friends, or business network.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-2xl font-black text-yellow-400">
                3
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Earn
              </h3>

              <p className="mt-3 text-slate-400">
                Earn according to the active SONET AI STUDIO
                affiliate commission terms for qualifying referrals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-cyan-500/10 p-10 text-center shadow-2xl sm:p-14">
          <h2 className="text-4xl font-black sm:text-5xl">
            Ready to Grow With SONET?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-300">
            Join the community, introduce people to SONET AI
            STUDIO, and build an additional income opportunity
            through referrals.
          </p>

          <button
            type="button"
            onClick={handleAffiliateJoin}
            disabled={checkingAuth}
            className="mt-8 inline-flex rounded-xl bg-yellow-500 px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checkingAuth
              ? "Checking Account..."
              : isLoggedIn
              ? "🚀 Open Affiliate Dashboard"
              : "💰 Get Started"}
          </button>
        </div>
      </section>
    </main>
  );
}
