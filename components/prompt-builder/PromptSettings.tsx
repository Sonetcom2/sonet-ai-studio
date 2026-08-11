"use client";

type Props = {
  subject: string;
  setSubject: (value: string) => void;

  style: string;
  setStyle: (value: string) => void;

  camera: string;
  setCamera: (value: string) => void;

  lighting: string;
  setLighting: (value: string) => void;

  background: string;
  setBackground: (value: string) => void;

  pose: string;
  setPose: (value: string) => void;

  clothing: string;
  setClothing: (value: string) => void;

  hair: string;
  setHair: (value: string) => void;

  mood: string;
  setMood: (value: string) => void;

  quality: string;
  setQuality: (value: string) => void;

  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
};

export default function PromptSettings({
  subject,
  setSubject,
  style,
  setStyle,
  camera,
  setCamera,
  lighting,
  setLighting,
  background,
  setBackground,
  pose,
  setPose,
  clothing,
  setClothing,
  hair,
  setHair,
  mood,
  setMood,
  quality,
  setQuality,
  negativePrompt,
  setNegativePrompt,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">
          🎨 Build Your Prompt
        </h2>

        <p className="mt-2 text-slate-400">
          Configure every part of your AI prompt before generating.
        </p>
      </div>

      <div className="grid gap-4">

        <SelectField
          label="Subject"
          value={subject}
          onChange={setSubject}
          options={[
            "African Woman",
            "African Man",
            "Luxury House",
            "Burger",
            "Sports Car",
            "Logo",
            "Flyer",
          ]}
        />

        <SelectField
          label="Style"
          value={style}
          onChange={setStyle}
          options={[
            "Luxury Fashion",
            "Portrait",
            "Photorealistic",
            "Anime",
            "Cinematic",
            "Food Photography",
            "Architecture",
          ]}
        />

        <SelectField
          label="Camera"
          value={camera}
          onChange={setCamera}
          options={[
            "85mm Portrait",
            "50mm",
            "Macro",
            "Wide Angle",
            "Drone",
          ]}
        />

        <SelectField
          label="Lighting"
          value={lighting}
          onChange={setLighting}
          options={[
            "Soft Studio",
            "Natural",
            "Golden Hour",
            "Night",
            "Neon",
          ]}
        />

        <SelectField
          label="Background"
          value={background}
          onChange={setBackground}
          options={[
            "Luxury Studio",
            "Nature",
            "White Background",
            "City",
            "Luxury Interior",
          ]}
        />

        <SelectField
          label="Pose"
          value={pose}
          onChange={setPose}
          options={[
            "Standing",
            "Sitting",
            "Walking",
            "Close-up",
            "Side View",
          ]}
        />

        <SelectField
          label="Clothing"
          value={clothing}
          onChange={setClothing}
          options={[
            "Luxury Suit",
            "Casual",
            "Traditional",
            "Streetwear",
            "Elegant Dress",
          ]}
        />

        <SelectField
          label="Hair Style"
          value={hair}
          onChange={setHair}
          options={[
            "Long Wavy",
            "Braids",
            "Curly",
            "Short",
            "Bald",
          ]}
        />

        <SelectField
          label="Mood"
          value={mood}
          onChange={setMood}
          options={[
            "Elegant",
            "Luxury",
            "Happy",
            "Serious",
            "Confident",
          ]}
        />

        <SelectField
          label="Quality"
          value={quality}
          onChange={setQuality}
          options={[
            "high",
            "medium",
            "low",
            "auto",
          ]}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-white">
            Negative Prompt
          </label>

          <textarea
            rows={5}
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="blurry, watermark, low quality..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-purple-500"
          />
        </div>

      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

function SelectField({
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}