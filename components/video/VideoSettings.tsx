"use client";

type VideoSettingsProps = {
  style: string;
  setStyle: (value: string) => void;

  duration: string;
  setDuration: (value: string) => void;

  aspectRatio: string;
  setAspectRatio: (value: string) => void;

  resolution: string;
  setResolution: (value: string) => void;

  quality: string;
  setQuality: (value: string) => void;

  camera: string;
  setCamera: (value: string) => void;
};

const styles = [
  "Cinematic",
  "Realistic",
  "Anime",
  "Pixar",
  "Sci-Fi",
  "Documentary",
];

const cameras = [
  "Static",
  "Pan Left",
  "Pan Right",
  "Zoom In",
  "Zoom Out",
  "Drone",
  "Tracking Shot",
];

const durations = [
  "5 sec",
  "10 sec",
  "15 sec",
  "20 sec",
  "25 sec",
  "30 sec",
];

const ratios = [
  "16:9",
  "9:16",
  "1:1",
];

const resolutions = [
  "720P",
];

const qualities = [
  "Fast",
  "Balanced",
  "Premium",
];

export default function VideoSettings({
  style,
  setStyle,
  duration,
  setDuration,
  aspectRatio,
  setAspectRatio,
  resolution,
  setResolution,
  quality,
  setQuality,
  camera,
  setCamera,
}: VideoSettingsProps) {
  function Selector({
    title,
    options,
    value,
    onChange,
  }: {
    title: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-5 text-lg font-bold text-white">
          {title}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`rounded-xl px-4 py-3 font-semibold transition ${
                value === option
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Selector
        title="Video Style"
        options={styles}
        value={style}
        onChange={setStyle}
      />

      <Selector
        title="Camera Movement"
        options={cameras}
        value={camera}
        onChange={setCamera}
      />

      <Selector
        title="Duration"
        options={durations}
        value={duration}
        onChange={setDuration}
      />

      <Selector
        title="Aspect Ratio"
        options={ratios}
        value={aspectRatio}
        onChange={setAspectRatio}
      />

      <Selector
        title="Resolution"
        options={resolutions}
        value={resolution}
        onChange={setResolution}
      />

      <Selector
        title="Quality"
        options={qualities}
        value={quality}
        onChange={setQuality}
      />

      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
        <p className="text-sm font-semibold text-cyan-300">
          Audio generation is enabled
        </p>

        <p className="mt-1 text-sm text-slate-300">
          Your generated videos include synchronised AI audio
          when supported by the selected generation model.
        </p>
      </div>
    </section>
  );
}
