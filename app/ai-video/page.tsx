"use client";

import VideoHero from "@/components/video/VideoHero";
import PromptEditor from "@/components/video/PromptEditor";
import VideoSettings from "@/components/video/VideoSettings";
import GeneratePanel from "@/components/video/GeneratePanel";
import RecentVideos from "@/components/video/RecentVideos";
import StepProgress from "@/components/video/StepProgress";
import DirectorRecommendation from "@/components/video/DirectorRecommendation";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRecentVideos } from "@/services/videoHistoryService";

export default function AIVideoPage() {
  const supabase = createClient();

  // ============================
  // USER
  // ============================

  const [fullName, setFullName] = useState("Creator");
  const [plan, setPlan] = useState("FREE");
  const [credits, setCredits] = useState(0);

  // ============================
  // PROMPT
  // ============================

  const [prompt, setPrompt] = useState("");

  // ============================
  // VIDEO SETTINGS
  // ============================

  const [style, setStyle] = useState("Cinematic");
  const [camera, setCamera] = useState("Static");
  const [duration, setDuration] = useState("5 sec");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720P");
  const [quality, setQuality] = useState("Balanced");

  // ============================
  // GENERATION
  // ============================

  const [generating, setGenerating] = useState(false);

  // ============================
  // VIDEO HISTORY
  // ============================

  const [videos, setVideos] = useState<any[]>([]);

  // ============================
  // LOAD USER PROFILE
  // ============================

  async function loadProfile() {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "Video Auth Error:",
          authError
        );
        return;
      }

      if (!user) {
        console.log("No logged-in user.");
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("full_name, credits, plan")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error(
          "Video Profile Error:",
          profileError
        );
        return;
      }

      setFullName(
        profile?.full_name ||
          user.user_metadata?.full_name ||
          "Creator"
      );

      setPlan(profile?.plan || "FREE");

      setCredits(
        Number(profile?.credits ?? 0)
      );
    } catch (error) {
      console.error(
        "Load Video Profile Error:",
        error
      );
    }
  }

  // ============================
  // LOAD VIDEO HISTORY
  // ============================

  async function loadVideos() {
    try {
      const history = await getRecentVideos();

      setVideos(history || []);
    } catch (error) {
      console.error(
        "Load Video History Error:",
        error
      );

      setVideos([]);
    }
  }

  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {
    loadProfile();
    loadVideos();
  }, []);

  // ============================
  // GENERATE VIDEO
  // ============================

  async function handleGenerate() {
    if (!prompt.trim()) {
      alert(
        "Please describe the video you want to generate."
      );
      return;
    }

    if (credits <= 0) {
      alert(
        "You don't have enough credits to generate a video."
      );
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch(
        "/api/generate-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt,
            style,
            camera,
            duration,
            aspectRatio,
            resolution,
            quality,
          }),
        }
      );

      const result = await response.json();

      console.log(
        "SONET AI Video Response:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Video generation failed."
        );
      }

      // Update credits immediately
      if (
        typeof result.creditsRemaining ===
        "number"
      ) {
        setCredits(
          result.creditsRemaining
        );
      } else {
        await loadProfile();
      }

      // Refresh history
      await loadVideos();

      alert(
        result.message ||
          "Video generation started successfully."
      );
    } catch (error) {
      console.error(
        "Video generation error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to generate video.";

      alert(`❌ ${message}`);
    } finally {
      setGenerating(false);
    }
  }

  // ============================
  // RENDER
  // ============================

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white">
      <div className="mx-auto max-w-7xl space-y-10 px-6 py-10">

        {/* HERO */}
        <VideoHero
          fullName={fullName}
          plan={plan}
          credits={credits}
          totalVideos={videos.length}
        />

        {/* STEP PROGRESS */}
        <StepProgress currentStep={1} />

        {/* PROMPT */}
        <PromptEditor
          prompt={prompt}
          setPrompt={setPrompt}
        />

        {/* AI DIRECTOR */}
        <DirectorRecommendation
          onApply={() => {
            setStyle("Cinematic");
            setCamera("Tracking Shot");
            setQuality("High");

            alert(
              "✨ AI Recommendation Applied!"
            );
          }}
        />

        {/* SETTINGS + GENERATE */}
        <div className="grid gap-8 lg:grid-cols-2">

          <VideoSettings
            style={style}
            setStyle={setStyle}
            camera={camera}
            setCamera={setCamera}
            duration={duration}
            setDuration={setDuration}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            resolution={resolution}
            setResolution={setResolution}
            quality={quality}
            setQuality={setQuality}
          />

          <GeneratePanel
            credits={credits}
            plan={plan}
            generating={generating}
            onGenerate={handleGenerate}
          />

        </div>

        {/* RECENT VIDEOS */}
        <RecentVideos videos={videos} />

      </div>
    </main>
  );
}