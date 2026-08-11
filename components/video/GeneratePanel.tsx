"use client";

type GeneratePanelProps = {
  credits: number;
  plan: string;
  generating: boolean;
  onGenerate: () => void;
};

export default function GeneratePanel({
  credits,
  plan,
  generating,
  onGenerate,
}: GeneratePanelProps) {
  const videoCost = plan === "PREMIUM" ? 0 : 50;

  const canGenerate =
    plan === "PREMIUM" || credits >= videoCost;

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">

      <h2 className="text-3xl font-black">
        🚀 Generate Video
      </h2>

      <p className="mt-3 text-slate-400">
        AI will transform your prompt into a cinematic video.
      </p>

      <div className="mt-8 space-y-5">

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-5">

          <span className="text-slate-400">
            Current Plan
          </span>

          <span className="font-bold text-yellow-400">
            👑 {plan}
          </span>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-5">

          <span className="text-slate-400">
            Available Credits
          </span>

          <span className="font-bold text-cyan-400">
            💎 {credits}
          </span>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-5">

          <span className="text-slate-400">
            Video Cost
          </span>

          <span className="font-bold text-white">
            {plan === "PREMIUM"
              ? "Unlimited"
              : `💎 ${videoCost}`}
          </span>

        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-5">

          <span className="text-slate-400">
            Estimated Render Time
          </span>

          <span className="font-bold text-green-400">
            ⏳ 30–90 sec
          </span>

        </div>

      </div>

      <button
        disabled={!canGenerate || generating}
        onClick={onGenerate}
        className="mt-10 w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-5 text-xl font-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating
          ? "🎬 Generating Video..."
          : "🎬 Generate AI Video"}
      </button>

      {!canGenerate && (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-5">

          <h3 className="font-bold text-red-400">
            Insufficient Credits
          </h3>

          <p className="mt-2 text-slate-300">
            You need at least{" "}
            <strong>{videoCost}</strong> credits to
            generate a video.
          </p>

          <button className="mt-5 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400 transition">

            Upgrade Plan

          </button>

        </div>
      )}

      {plan === "PREMIUM" && (
        <div className="mt-6 rounded-2xl border border-green-500/40 bg-green-500/10 p-5">

          <h3 className="font-bold text-green-400">
            Premium Benefits
          </h3>

          <ul className="mt-3 space-y-2 text-slate-300">

            <li>✅ Unlimited AI Videos</li>

            <li>✅ Priority Rendering</li>

            <li>✅ Highest Video Quality</li>

            <li>✅ Future Premium Models Included</li>

          </ul>

        </div>
      )}

    </section>
  );
}