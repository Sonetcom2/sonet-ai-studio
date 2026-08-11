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

const durations = ["5 sec", "10 sec", "15 sec"];

const ratios = ["16:9", "9:16", "1:1"];

const resolutions = ["720P", "1080P"];

const qualities = ["Fast", "Balanced", "Premium"];

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
    onChange: (v: string) => void;
  }) {
    return (
      <div className="rounded-2xl bg-slate-900 border border-slate-700 p-6">

        <h3 className="text-lg font-bold mb-5">
          {title}
        </h3>

        <div className="grid grid-cols-2 gap-3">

          {options.map((option) => (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`rounded-xl py-3 px-4 transition font-semibold ${
                value === option
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-800 hover:bg-slate-700"
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
        title="🎨 Video Style"
        options={styles}
        value={style}
        onChange={setStyle}
      />

      <Selector
        title="🎥 Camera Movement"
        options={cameras}
        value={camera}
        onChange={setCamera}
      />

      <Selector
        title="⏱ Duration"
        options={durations}
        value={duration}
        onChange={setDuration}
      />

      <Selector
        title="📺 Aspect Ratio"
        options={ratios}
        value={aspectRatio}
        onChange={setAspectRatio}
      />

      <Selector
        title="🖥 Resolution"
        options={resolutions}
        value={resolution}
        onChange={setResolution}
      />

      <Selector
        title="⭐ Quality"
        options={qualities}
        value={quality}
        onChange={setQuality}
      />

    </section>
  );
}