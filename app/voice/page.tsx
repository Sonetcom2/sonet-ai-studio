"use client";

import { useEffect, useState } from "react";

type VoiceOption = {
  id: string;
  name: string;
  description: string;
  color: string;
  glow: string;
};

const VOICES: VoiceOption[] = [
  {
    id: "alloy",
    name: "Alloy",
    description: "Balanced and versatile",
    color: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/20",
  },
  {
    id: "ash",
    name: "Ash",
    description: "Clear and confident",
    color: "from-slate-300 to-slate-500",
    glow: "shadow-slate-400/20",
  },
  {
    id: "ballad",
    name: "Ballad",
    description: "Warm and expressive",
    color: "from-pink-400 to-rose-500",
    glow: "shadow-pink-500/20",
  },
  {
    id: "coral",
    name: "Coral",
    description: "Friendly and natural",
    color: "from-orange-400 to-pink-500",
    glow: "shadow-orange-500/20",
  },
  {
    id: "echo",
    name: "Echo",
    description: "Smooth and professional",
    color: "from-violet-400 to-purple-600",
    glow: "shadow-purple-500/20",
  },
  {
    id: "fable",
    name: "Fable",
    description: "Storytelling and engaging",
    color: "from-amber-300 to-orange-500",
    glow: "shadow-amber-500/20",
  },
  {
    id: "onyx",
    name: "Onyx",
    description: "Deep and authoritative",
    color: "from-indigo-400 to-violet-600",
    glow: "shadow-indigo-500/20",
  },
  {
    id: "nova",
    name: "Nova",
    description: "Energetic and modern",
    color: "from-blue-400 to-cyan-400",
    glow: "shadow-blue-500/20",
  },
  {
    id: "sage",
    name: "Sage",
    description: "Calm and intelligent",
    color: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
  },
  {
    id: "shimmer",
    name: "Shimmer",
    description: "Bright and friendly",
    color: "from-fuchsia-400 to-pink-500",
    glow: "shadow-fuchsia-500/20",
  },
];

const MAX_TEXT_LENGTH = 5000;

export default function VoicePage() {
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("alloy");

  const [generationCost, setGenerationCost] = useState(5);
  const [credits, setCredits] = useState<number | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoadingSettings(true);

        const [settingsResponse, profileResponse] = await Promise.all([
          fetch("/api/settings", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/profile", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();

          if (
            mounted &&
            settingsData?.success &&
            Number.isFinite(Number(settingsData.voice_generation_cost))
          ) {
            setGenerationCost(
              Number(settingsData.voice_generation_cost)
            );
          }
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();

          if (!mounted) return;

          const profileCredits =
            profileData?.credits ??
            profileData?.profile?.credits ??
            profileData?.data?.credits;

          if (profileCredits !== undefined && profileCredits !== null) {
            setCredits(Number(profileCredits));
          }
        }
      } catch (err) {
        console.error("Unable to load Voice Studio data:", err);
      } finally {
        if (mounted) {
          setLoadingSettings(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const remainingCharacters = MAX_TEXT_LENGTH - text.length;

  const selectedVoiceData =
    VOICES.find((voice) => voice.id === selectedVoice) ?? VOICES[0];

  const canGenerate =
    text.trim().length > 0 &&
    text.length <= MAX_TEXT_LENGTH &&
    !loading &&
    (credits === null || credits >= generationCost);

  function clearAudio() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setAudioBlob(null);
  }

  function clearAll() {
    setText("");
    setError("");
    setSuccess("");
    clearAudio();
  }

  async function generateVoice() {
    setError("");
    setSuccess("");

    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setError(
        `Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`
      );
      return;
    }

    if (credits !== null && credits < generationCost) {
      setError(
        `You need ${generationCost} credits to generate this voice. You currently have ${credits} credits.`
      );
      return;
    }

    setLoading(true);

    try {
      clearAudio();

      const response = await fetch("/api/generate-voice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice,
          format: "mp3",
        }),
      });

      if (!response.ok) {
        let message = "Unable to generate voice.";

        try {
          const data = await response.json();

          if (data?.error) {
            message = data.error;
          }

          if (
            data?.creditsRemaining !== undefined &&
            data?.creditsRemaining !== null
          ) {
            setCredits(Number(data.creditsRemaining));
          }
        } catch {
          // Ignore JSON parsing errors.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error("No audio was returned.");
      }

      const url = URL.createObjectURL(blob);

      setAudioBlob(blob);
      setAudioUrl(url);

      const remainingHeader = response.headers.get(
        "X-Credits-Remaining"
      );

      if (remainingHeader !== null) {
        const remaining = Number(remainingHeader);

        if (Number.isFinite(remaining)) {
          setCredits(remaining);
        }
      } else if (credits !== null) {
        setCredits(Math.max(0, credits - generationCost));
      }

      setSuccess(
        `Voice generated successfully using ${generationCost} credits.`
      );
    } catch (err) {
      console.error("Voice generation failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate voice. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function downloadAudio() {
    if (!audioBlob || !audioUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `sonet-ai-voice-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* =========================================================
          BACKGROUND LIGHT EFFECTS
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px]" />

        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-600/15 blur-[130px]" />

        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-pink-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* =========================================================
            HEADER
        ========================================================= */}

        <section className="mb-10 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-cyan-300 shadow-lg shadow-cyan-500/5">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            SONET AI STUDIO
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Voice Studio
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Turn your words into natural AI speech with professional
            voices. Create voiceovers, announcements, storytelling,
            social media content, and more.
          </p>

          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
        </section>

        {/* =========================================================
            CREDIT / COST CARDS
        ========================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2">

          {/* Credits */}
          <div className="group relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent p-6 shadow-xl shadow-cyan-500/5 backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition group-hover:bg-cyan-400/20" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl shadow-lg shadow-cyan-500/20">
                💳
              </div>

              <div>
                <p className="text-sm font-medium text-cyan-200/70">
                  Available Credits
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-black text-white">
                    {credits === null
                      ? "—"
                      : credits.toLocaleString()}
                  </span>

                  <span className="mb-1 text-sm text-slate-400">
                    credits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="group relative overflow-hidden rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent p-6 shadow-xl shadow-purple-500/5 backdrop-blur-xl">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-400/10 blur-3xl transition group-hover:bg-purple-400/20" />

            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl shadow-lg shadow-purple-500/20">
                ⚡
              </div>

              <div>
                <p className="text-sm font-medium text-purple-200/70">
                  Generation Cost
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-black text-white">
                    {loadingSettings ? "—" : generationCost}
                  </span>

                  <span className="mb-1 text-sm text-slate-400">
                    credits / generation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            MAIN STUDIO
        ========================================================= */}

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">

          {/* =======================================================
              CREATE VOICE
          ======================================================= */}

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 shadow-2xl backdrop-blur-xl sm:p-8">

            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-500/5 blur-3xl" />

            <div className="relative">

              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-2xl shadow-xl shadow-blue-500/20">
                  🎙️
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    Create AI Voice
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Enter your text and choose a voice to create
                    professional AI speech.
                  </p>
                </div>
              </div>

              {/* Text Input */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="voice-text"
                    className="text-sm font-semibold text-slate-200"
                  >
                    Your Text
                  </label>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      remainingCharacters < 500
                        ? "bg-amber-500/10 text-amber-300"
                        : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {text.length.toLocaleString()} /{" "}
                    {MAX_TEXT_LENGTH.toLocaleString()}
                  </span>
                </div>

                <textarea
                  id="voice-text"
                  value={text}
                  onChange={(event) =>
                    setText(
                      event.target.value.slice(
                        0,
                        MAX_TEXT_LENGTH
                      )
                    )
                  }
                  placeholder="Type or paste the text you want SONET AI STUDIO to speak..."
                  rows={10}
                  disabled={loading}
                  className="w-full resize-y rounded-2xl border border-slate-700/80 bg-black/40 px-5 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-black/50 focus:ring-4 focus:ring-cyan-500/5 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Voice Selection */}
              <div className="mt-8">

                <div className="mb-4">
                  <h3 className="text-base font-semibold text-white">
                    Choose Your Voice
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Select the voice that best matches your content.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {VOICES.map((voice) => {
                    const selected =
                      selectedVoice === voice.id;

                    return (
                      <button
                        key={voice.id}
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          setSelectedVoice(voice.id)
                        }
                        className={`group relative overflow-hidden rounded-2xl border p-[1px] text-left transition-all duration-300 ${
                          selected
                            ? "border-transparent shadow-xl " +
                              voice.glow
                            : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        {selected && (
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${voice.color}`}
                          />
                        )}

                        <div
                          className={`relative rounded-[15px] p-4 ${
                            selected
                              ? "bg-slate-950/95"
                              : "bg-slate-900/70 group-hover:bg-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-3">

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                                selected
                                  ? `bg-gradient-to-br ${voice.color} shadow-lg`
                                  : "bg-slate-800"
                              }`}
                            >
                              🎙️
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-white">
                                {voice.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {voice.description}
                              </p>
                            </div>

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-white/80"
                                  : "border-slate-700"
                              }`}
                            >
                              {selected && (
                                <div
                                  className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${voice.color}`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-rose-500/5 px-4 py-4 text-sm text-red-300">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 px-4 py-4 text-sm text-emerald-300">
                  <span className="text-lg">✓</span>
                  <span>{success}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={generateVoice}
                  disabled={!canGenerate}
                  className="group relative flex min-h-14 flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 via-blue-400 to-pink-500 opacity-0 transition group-hover:opacity-100" />

                  <span className="relative flex items-center gap-3">
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating Voice...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">🎙️</span>
                        <span>Generate Voice</span>

                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                          {generationCost} credits
                        </span>
                      </>
                    )}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  disabled={loading}
                  className="min-h-14 rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear
                </button>
              </div>

              {/* Generated Audio */}
              {audioUrl && (
                <div className="relative mt-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 p-[1px]">

                  <div className="rounded-[23px] bg-slate-950/90 p-5 sm:p-6">

                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 text-xl shadow-lg">
                          🎧
                        </div>

                        <div>
                          <h3 className="font-bold">
                            Generated Voice
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Your MP3 audio is ready to play.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={downloadAudio}
                        className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:from-cyan-300 hover:to-blue-400"
                      >
                        ⬇️ Download MP3
                      </button>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-black/30 p-3">
                      <audio
                        controls
                        preload="metadata"
                        src={audioUrl}
                        className="w-full"
                      />
                    </div>

                  </div>
                </div>
              )}
            </div>
          </section>

          {/* =======================================================
              SIDEBAR
          ======================================================= */}

          <aside className="space-y-5">

            {/* Studio Information */}
            <div className="relative overflow-hidden rounded-[2rem] border border-purple-400/15 bg-gradient-to-br from-purple-500/10 via-slate-950/70 to-cyan-500/5 p-6 shadow-2xl backdrop-blur-xl">

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-xl shadow-lg shadow-purple-500/20">
                    ✨
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Voice Studio
                    </h2>

                    <p className="text-xs text-slate-500">
                      AI-powered speech creation
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-400">
                  Create professional AI speech directly inside
                  SONET AI STUDIO.
                </p>

                <div className="mt-6 space-y-3">

                  <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎙️</span>
                      <div>
                        <p className="font-semibold text-white">
                          Natural Voices
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Multiple expressive AI voices.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-purple-400/10 bg-purple-400/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚡</span>
                      <div>
                        <p className="font-semibold text-white">
                          Fast Generation
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Convert written content into speech.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-pink-400/10 bg-pink-400/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🎧</span>
                      <div>
                        <p className="font-semibold text-white">
                          MP3 Output
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Listen or download your audio.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💳</span>
                      <div>
                        <p className="font-semibold text-white">
                          Credit Based
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Each generation uses SONET credits.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Current Voice */}
            <div className="relative overflow-hidden rounded-[2rem] border border-blue-400/15 bg-slate-950/60 p-6 shadow-xl backdrop-blur-xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Current Voice
              </p>

              <div className="mt-4 flex items-center gap-4">

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${selectedVoiceData.color} text-xl shadow-lg ${selectedVoiceData.glow}`}
                >
                  🎙️
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-bold">
                    {selectedVoiceData.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedVoiceData.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <span className="text-xs text-slate-500">
                  Voice ID
                </span>

                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                  {selectedVoice}
                </span>
              </div>
            </div>

            {/* Generation Information */}
            <div className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 p-6 shadow-xl backdrop-blur-xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/60">
                Generation
              </p>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Cost per generation
                  </span>

                  <span className="font-bold text-cyan-300">
                    {generationCost} credits
                  </span>
                </div>

                <div className="h-px bg-white/5" />

                {credits !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      After generation
                    </span>

                    <span className="font-bold text-white">
                      {Math.max(
                        0,
                        credits - generationCost
                      ).toLocaleString()}{" "}
                      credits
                    </span>
                  </div>
                )}

              </div>
            </div>

          </aside>
        </div>

        {/* =========================================================
            BOTTOM FEATURE STRIP
        ========================================================= */}

        <section className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-500/5 via-purple-500/10 to-pink-500/5 p-6 backdrop-blur-xl sm:p-8">

          <div className="grid gap-6 text-center sm:grid-cols-3">

            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-xl shadow-lg shadow-cyan-500/10">
                🎙️
              </div>

              <h3 className="mt-3 font-bold">
                AI Voice Generation
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Transform written content into natural speech.
              </p>
            </div>

            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-xl shadow-lg shadow-purple-500/10">
                ✨
              </div>

              <h3 className="mt-3 font-bold">
                Professional Results
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Create voiceovers suitable for modern content.
              </p>
            </div>

            <div>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-xl shadow-lg shadow-emerald-500/10">
                🚀
              </div>

              <h3 className="mt-3 font-bold">
                Built Into SONET
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Voice creation is now part of your SONET AI toolkit.
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}