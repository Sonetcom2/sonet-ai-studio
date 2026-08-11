"use client";

type StepProgressProps = {
  currentStep: number;
};

const steps = [
  "Story",
  "Assets",
  "Director",
  "Style",
  "Generate",
];

export default function StepProgress({
  currentStep,
}: StepProgressProps) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

      <h2 className="text-3xl font-black mb-8">

        🎬 AI Video Studio

      </h2>

      <div className="flex items-center">

        {steps.map((step, index) => (
          <div
            key={step}
            className="flex-1 flex items-center"
          >

            <div className="flex flex-col items-center">

              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${
                  index < currentStep
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-slate-400"
                }`}
              >
                {index + 1}
              </div>

              <span className="mt-3 text-sm">
                {step}
              </span>

            </div>

            {index !== steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-3 rounded-full
                ${
                  index < currentStep - 1
                    ? "bg-cyan-500"
                    : "bg-slate-700"
                }`}
              />
            )}

          </div>
        ))}

      </div>

    </section>
  );
}