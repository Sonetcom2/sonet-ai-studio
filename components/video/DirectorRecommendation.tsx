"use client";

type DirectorRecommendationProps = {
  onApply: () => void;
};

export default function DirectorRecommendation({
  onApply,
}: DirectorRecommendationProps) {
  return (
    <section className="mt-10 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 p-8">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-black">

            🧠 AI Director Recommendation

          </h2>

          <p className="mt-2 text-slate-400">

            Based on your uploaded reference, SONET AI recommends the following settings.

          </p>

        </div>

        <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-bold text-green-300">

          96% Match

        </span>

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">

        <Recommendation
          title="🎬 Style"
          value="Cinematic"
        />

        <Recommendation
          title="🎥 Camera"
          value="Tracking Shot"
        />

        <Recommendation
          title="⚡ Motion"
          value="Balanced"
        />

        <Recommendation
          title="😊 Emotion"
          value="Confident"
        />

        <Recommendation
          title="🌅 Colour"
          value="Golden Hour"
        />

        <Recommendation
          title="🌍 Environment"
          value="Natural"
        />

      </div>

      <button
        onClick={onApply}
        className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-xl font-bold hover:scale-105 transition"
      >

        ✨ Apply Recommendation

      </button>

    </section>
  );
}

function Recommendation({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

      <p className="text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-xl font-bold text-cyan-400">
        {value}
      </h3>

    </div>
  );
}