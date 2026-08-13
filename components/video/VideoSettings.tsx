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

/*
 * Ray 2 currently supports 5 and 9 seconds.
 */
const durations = [
  "5 sec",
  "9 sec",
];

const ratios = [
  "16:9",
  "9:16",
  "1:1",
];

/*
 * ray-2-720p is a 720p model.
 * 1080P is therefore not offered as a native model setting.
 *
 * We keep the existing resolution state because the application
 * may use it elsewhere, but only expose the supported model level.
 */
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
        <h3 className="mb-5 text-lg font-bold">
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