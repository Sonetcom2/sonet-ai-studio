"use client";
import DirectorCard from "./DirectorCard";
import { useRef, useState } from "react";

const suggestions = [
  "🎬 Cinematic Movie Trailer",
  "🧸 Pixar Style Animation",
  "🚗 Luxury Car Commercial",
  "🏝 Tropical Travel Video",
  "🎮 Gaming Intro",
  "📱 Social Media Reel",
];

const examplePrompts = [
  "A young African woman walking confidently through a futuristic Lagos at sunset, cinematic lighting, ultra realistic.",
  "A luxury perfume bottle rotating slowly on a reflective black surface with dramatic lighting and floating golden particles.",
  "An aerial drone shot of a tropical island with crystal-clear water, palm trees, and waves crashing against the shore.",
];

type PromptEditorProps = {
  prompt: string;
  setPrompt: (value: string) => void;
};

export default function PromptEditor({
  prompt,
  setPrompt,
}: PromptEditorProps) {
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

// Video States
const [videoPreview, setVideoPreview] = useState<string | null>(null);

const [videoName, setVideoName] = useState("");

const [videoSize, setVideoSize] = useState("");

const fileInputRef = useRef<HTMLInputElement>(null);

const videoInputRef = useRef<HTMLInputElement>(null);
const [directorSettings, setDirectorSettings] = useState({
  keepFace: true,
  keepClothing: false,
  keepHair: false,
  keepBackground: false,
  keepCamera: false,
  continueScene: false,
});
  function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
 function handleVideoUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];

  if (!file) return;

  const videoURL = URL.createObjectURL(file);

  setVideoPreview(videoURL);

  setVideoName(file.name);

  setVideoSize(
    `${(file.size / 1024 / 1024).toFixed(2)} MB`
  );
}

function removeVideo() {
  if (videoPreview) {
    URL.revokeObjectURL(videoPreview);
  }

  setVideoPreview(null);

  setVideoName("");

  setVideoSize("");

  if (videoInputRef.current) {
    videoInputRef.current.value = "";
  }
} 

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-3xl font-black">
          ✍️ Describe Your Video
        </h2>

        <span className="text-sm text-slate-400">
          {prompt.length}/2000
        </span>

      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
        maxLength={2000}
        placeholder="Describe your video in as much detail as possible..."
        className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-6 text-lg outline-none focus:border-cyan-500 resize-none"
      />

      {/* Quick Ideas */}

      <div className="mt-8">

        <h3 className="text-lg font-bold mb-4">
          ⚡ Quick Ideas
        </h3>

        <div className="flex flex-wrap gap-3">

          {suggestions.map((item) => (
            <button
              key={item}
              onClick={() => setPrompt(item)}
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 hover:bg-cyan-500/20 transition"
            >
              {item}
            </button>
          ))}

        </div>

      </div>

      {/* Example Prompts */}

      <div className="mt-10">

        <h3 className="text-lg font-bold mb-4">
          💡 Example Prompts
        </h3>

        <div className="space-y-4">

          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => {
                setPrompt(example);
                setSelectedExample(index);
              }}
              className={`w-full rounded-2xl border p-5 text-left transition ${
                selectedExample === index
                  ? "border-cyan-500 bg-cyan-500/10"
                  : "border-slate-700 bg-slate-950 hover:border-cyan-500"
              }`}
            >
              {example}
            </button>
          ))}

        </div>

      </div>
     
      {/* Reference Image */}

      <div className="mt-10 rounded-2xl border border-slate-700 bg-slate-950 p-6">

        <h3 className="text-xl font-bold">
          🖼️ Reference Image
        </h3>

        <p className="mt-2 text-slate-400">

          Upload an image to guide the AI when generating your video.

        </p>
{!imagePreview && (
  <div className="mt-6">
        

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="video-image-upload"
            />

            <label
  htmlFor="video-image-upload"
  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/40 bg-slate-900 py-12 transition hover:border-cyan-400 hover:bg-slate-800"
>

  <div className="text-5xl">
    🖼️
  </div>

  <h4 className="mt-5 text-xl font-bold">
    Upload Reference Image
  </h4>

  <p className="mt-2 text-center text-slate-400">
    PNG • JPG • WEBP
    <br />
    Maximum 10 MB
  </p>

</label>

          </div>
        )}

        {imagePreview && (
  <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">

    <div className="flex items-center justify-between mb-4">

      <h4 className="font-bold text-lg">
        🖼 Reference Image
      </h4>

      <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-300">
        Ready
      </span>

    </div>

    <img
      src={imagePreview}
      alt="Reference"
      className="w-full rounded-2xl border border-slate-700 object-cover max-h-80"
    />

    <div className="mt-5 flex justify-end">

      <button
        onClick={removeImage}
        className="rounded-xl bg-red-600 px-5 py-3 font-bold hover:bg-red-500 transition"
      >
        ❌ Remove Image
      </button>

    </div>

  </div>
)}

      </div>
       {/* Reference Video */}

<div className="mt-10 rounded-2xl border border-slate-700 bg-slate-950 p-6">

  <h3 className="text-xl font-bold">
    🎥 Reference Video
  </h3>

  <p className="mt-2 text-slate-400">
    Upload a reference video to guide the AI when creating or extending your video.
  </p>

  {!videoPreview && (
    <div className="mt-6">

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
        id="video-reference-upload"
      />

     <label
  htmlFor="video-reference-upload"
  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/40 bg-slate-900 py-12 transition hover:border-purple-400 hover:bg-slate-800"
>

  <div className="text-5xl">
    🎥
  </div>

  <h4 className="mt-5 text-xl font-bold">
    Upload Reference Video
  </h4>

  <p className="mt-2 text-center text-slate-400">
    MP4 • MOV • WEBM
    <br />
    Maximum 100 MB
  </p>

</label>
    </div>

  )}

  {videoPreview && (
    <div className="mt-6 space-y-5">

      <video
        src={videoPreview}
        controls
        className="w-full rounded-2xl border border-slate-700"
      />

      <div className="rounded-xl bg-slate-900 p-4">

        <p>
          <strong>📄 File:</strong> {videoName}
        </p>

        <p className="mt-2">
          <strong>💾 Size:</strong> {videoSize}
        </p>

      </div>

      <button
        onClick={removeVideo}
        className="rounded-xl bg-red-600 px-6 py-3 font-bold hover:bg-red-500 transition"
      >
        ❌ Remove Video
      </button>

    </div>
  )}

</div>
{/* AI Director */}

<div className="mt-10 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 p-6">

  <div className="flex items-center justify-between">

    <div>

      <h3 className="text-2xl font-black">
        🎬 AI Director
      </h3>

      <p className="mt-2 text-slate-400">
        Tell the AI exactly what should remain consistent.
      </p>

    </div>

    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-sm font-bold text-amber-300">
      Coming Alive Soon
    </span>

  </div>

  <div className="mt-8 grid md:grid-cols-2 gap-4">

   <DirectorCard
  icon="👤"
  title="Keep Face Identity"
  description="Preserve the person's facial appearance across every scene."
  checked={directorSettings.keepFace}
  onChange={(checked) =>
    setDirectorSettings({
      ...directorSettings,
      keepFace: checked,
    })
  }
/>

<DirectorCard
  icon="👕"
  title="Keep Clothing"
  description="Maintain the subject's outfit throughout the video."
  checked={directorSettings.keepClothing}
  onChange={(checked) =>
    setDirectorSettings({
      ...directorSettings,
      keepClothing: checked,
    })
  }
/>

<DirectorCard
  icon="💇"
  title="Keep Hairstyle"
  description="Preserve hairstyle and overall appearance."
  checked={directorSettings.keepHair}
  onChange={(checked) =>
    setDirectorSettings({
      ...directorSettings,
      keepHair: checked,
    })
  }
/>

<DirectorCard
  icon="🏞"
  title="Keep Background"
  description="Maintain the same location and scenery."
  checked={directorSettings.keepBackground}
  onChange={(checked) =>
    setDirectorSettings({
      ...directorSettings,
      keepBackground: checked,
    })
  }
/>

<DirectorCard
  icon="🎥"
  title="Match Camera Angle"
  description="Generate the video using a similar camera perspective."
  checked={directorSettings.keepCamera}
  onChange={(checked) =>
    setDirectorSettings({
      ...directorSettings,
      keepCamera: checked,
    })
  }
/>

<DirectorCard
  icon="▶"
  title="Continue Scene"
  description="Continue naturally from the uploaded reference."
  checked={directorSettings.continueScene}
  onChange={(checked) =>
    setDirectorSettings({
      ...directorSettings,
      continueScene: checked,
    })
  }
/>

  </div>

</div>

    </section>
   
  );
}