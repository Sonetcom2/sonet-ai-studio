"use client";

import Link from "next/link";

type VideoHeroProps = {
  fullName: string;
  plan: string;
  credits: number;
  totalVideos?: number;
};

export default function VideoHero({
  fullName,
  plan,
  credits,
  totalVideos = 0,
}: VideoHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-10 shadow-2xl">

      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl"></div>

      <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl"></div>

      <div className="relative z-10">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

          {/* Left */}

          <div className="max-w-3xl">

            <span className="inline-flex items-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">

              🎬 Premium AI Video Studio

            </span>

            <h1 className="mt-6 text-5xl lg:text-6xl font-black leading-tight">

              Bring Your Ideas
              <br />

              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">

                To Life With AI

              </span>

            </h1>

            <p className="mt-6 text-lg text-slate-300 leading-8">

              Welcome back,

              <span className="font-bold text-white">
                {" "}
                {fullName}
              </span>

              .

              Create cinematic AI videos from simple prompts in just a few
              clicks.

            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-bold transition hover:scale-105">

                🎬 Generate Video

              </button>

              <Link
                href="/pricing"
                className="rounded-2xl border border-slate-600 px-8 py-4 text-lg font-semibold transition hover:bg-slate-800"
              >

                Upgrade Plan

              </Link>

            </div>

          </div>

          {/* Right */}

          <div className="grid w-full max-w-md gap-5">

            <div className="rounded-2xl border border-yellow-500/30 bg-slate-900/80 p-6">

              <div className="text-sm text-slate-400">

                Current Plan

              </div>

              <div className="mt-2 text-3xl font-black text-yellow-400">

                👑 {plan}

              </div>

            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-6">

              <div className="text-sm text-slate-400">

                Available Credits

              </div>

              <div className="mt-2 text-3xl font-black text-cyan-400">

                💎 {credits}

              </div>

            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-slate-900/80 p-6">

              <div className="text-sm text-slate-400">

                Videos Generated

              </div>

              <div className="mt-2 text-3xl font-black text-purple-400">

                🎥 {totalVideos}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}