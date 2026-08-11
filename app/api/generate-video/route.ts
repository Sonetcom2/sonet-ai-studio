import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { ReplicateVideoProvider } from "@/providers/replicate/videoProvider";

import { VideoGenerationRequest } from "@/types/video";

import {
  getUserCredits,
  deductCredits,
  VIDEO_GENERATION_COST,
} from "@/services/creditService";

export async function POST(req: NextRequest) {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 API START");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const supabase = await createClient();

    const provider = new ReplicateVideoProvider();

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // Read request body
    const body: VideoGenerationRequest = await req.json();

    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt is required.",
        },
        {
          status: 400,
        }
      );
    }

    // Get current credits
    const { credits } = await getUserCredits(user.id);

    console.log("💳 Current credits:", credits);
    console.log("🎬 Video cost:", VIDEO_GENERATION_COST);

    // Check whether user has enough credits
    if (credits < VIDEO_GENERATION_COST) {
      return NextResponse.json(
        {
          success: false,
          message: `You need ${VIDEO_GENERATION_COST} credits to generate a video. You currently have ${credits}.`,
          creditsRemaining: credits,
        },
        {
          status: 403,
        }
      );
    }

    console.log("🔥 STEP A - Credits check passed");

    // Generate video with Replicate
    const result = await provider.generateVideo({
      prompt: body.prompt,
      style: body.style,
      camera: body.camera,
      duration: body.duration,
      aspectRatio: body.aspectRatio,
      resolution: body.resolution,
      quality: body.quality,
    });

    console.log("🎬 Replicate result:", result);

    // Replicate failed
    if (!result.success) {
      return NextResponse.json(result, {
        status: 500,
      });
    }

    console.log("🔥 STEP B - Video generated successfully");

    // Save video to database
    const { error: videoError } = await supabase
      .from("video_generations")
      .insert({
        user_id: user.id,
        prompt: body.prompt,
        style: body.style,
        camera: body.camera,
        duration: body.duration,
        aspect_ratio: body.aspectRatio,
        resolution: body.resolution,
        quality: body.quality,
        status: result.status,
        video_url: result.videoUrl ?? null,
        credits_used: VIDEO_GENERATION_COST,
      });

    if (videoError) {
      console.error("❌ Video database error:", videoError);

      return NextResponse.json(
        {
          success: false,
          message: videoError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log("🔥 STEP C - Video saved");

    // Deduct video credits
    let creditsRemaining: number;

    try {
      creditsRemaining = await deductCredits(
        user.id,
        VIDEO_GENERATION_COST
      );
    } catch (creditError) {
      console.error(
        "❌ Credit deduction error:",
        creditError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            creditError instanceof Error
              ? creditError.message
              : "Unable to deduct video credits.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "💳 Credits remaining:",
      creditsRemaining
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ API FINISHED");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      success: true,
      provider: result.provider,
      status: result.status,
      jobId: result.jobId,
      videoUrl: result.videoUrl,
      message:
        result.message || "Video generated successfully.",
      creditsUsed: VIDEO_GENERATION_COST,
      creditsRemaining,
    });
  } catch (error) {
    console.error("🔥 FATAL ERROR");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}