import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import { ReplicateVideoProvider } from "@/providers/replicate/videoProvider";

import { VideoGenerationRequest } from "@/types/video";

import {
  getUserCredits,
  deductCredits,
} from "@/services/creditService";

import { getSettings } from "@/services/settingsService";

export async function POST(req: NextRequest) {
  let userId: string | null = null;
  let originalCredits: number | null = null;

  try {
    console.log("========================================");
    console.log("GENERATE VIDEO API START");
    console.log("========================================");

    const supabase = await createClient();

    // ==========================================
    // 1. GET LOGGED-IN USER
    // ==========================================

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

    userId = user.id;

    // ==========================================
    // 2. GET ADMIN SETTINGS
    // ==========================================

    const settings = await getSettings();

    const videoGenerationCost = Number(
      settings.video_generation_cost
    );

    if (
      !Number.isFinite(videoGenerationCost) ||
      videoGenerationCost <= 0
    ) {
      throw new Error(
        "Invalid video generation cost configured."
      );
    }

    console.log(
      "Video generation cost:",
      videoGenerationCost
    );

    // ==========================================
    // 3. READ REQUEST BODY
    // ==========================================

    const body: VideoGenerationRequest =
      await req.json();

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

    // ==========================================
    // 4. GET CURRENT CREDITS
    // ==========================================

    const { credits } = await getUserCredits(
      user.id
    );

    originalCredits = credits;

    console.log(
      "Current credits:",
      credits
    );

    console.log(
      "Required credits:",
      videoGenerationCost
    );

    // ==========================================
    // 5. CHECK CREDITS
    // ==========================================

    if (credits < videoGenerationCost) {
      return NextResponse.json(
        {
          success: false,
          message: `You need ${videoGenerationCost} credits to generate a video. You currently have ${credits}.`,
          creditsRemaining: credits,
          creditsRequired: videoGenerationCost,
        },
        {
          status: 403,
        }
      );
    }

    console.log(
      "Credit check passed."
    );

    // ==========================================
    // 6. GENERATE VIDEO
    // ==========================================

    const provider =
      new ReplicateVideoProvider();

    console.log(
      "Starting video generation..."
    );

    const result =
      await provider.generateVideo({
        prompt: body.prompt,
        style: body.style,
        camera: body.camera,
        duration: body.duration,
        aspectRatio: body.aspectRatio,
        resolution: body.resolution,
        quality: body.quality,
      });

    console.log(
      "Replicate result:",
      result
    );

    // ==========================================
    // 7. CHECK GENERATION RESULT
    // ==========================================

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            result.message ||
            "Video generation failed.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Video generated successfully."
    );

    // ==========================================
    // 8. DEDUCT CREDITS
    // ==========================================

    const creditsRemaining =
      await deductCredits(
        user.id,
        videoGenerationCost
      );

    console.log(
      `Credits deducted: ${videoGenerationCost}`
    );

    console.log(
      `Credits remaining: ${creditsRemaining}`
    );

    // ==========================================
    // 9. SAVE VIDEO TO DATABASE
    // ==========================================

    const {
      error: videoError,
    } = await supabaseAdmin
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
        video_url:
          result.videoUrl ?? null,
        credits_used:
          videoGenerationCost,
      });

    if (videoError) {
      console.error(
        "Video database error:",
        videoError
      );

      throw new Error(
        "Video generated but could not be saved."
      );
    }

    console.log(
      "Video saved to database."
    );

    // ==========================================
    // 10. SUCCESS
    // ==========================================

    console.log("========================================");
    console.log("GENERATE VIDEO API SUCCESS");
    console.log("========================================");

    return NextResponse.json({
      success: true,
      provider: result.provider,
      status: result.status,
      jobId: result.jobId,
      videoUrl: result.videoUrl,
      message:
        result.message ||
        "Video generated successfully.",
      creditsUsed:
        videoGenerationCost,
      creditsRemaining,
    });
  } catch (error) {
    console.error(
      "Generate Video Error:",
      error
    );

    // ==========================================
    // ROLLBACK CREDITS
    // ==========================================

    if (
      userId &&
      originalCredits !== null
    ) {
      console.log(
        "Rolling back credits..."
      );

      const {
        error: rollbackError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          credits: originalCredits,
        })
        .eq("id", userId);

      if (rollbackError) {
        console.error(
          "Credit rollback error:",
          rollbackError
        );
      } else {
        console.log(
          "Credits successfully rolled back."
        );
      }
    }

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