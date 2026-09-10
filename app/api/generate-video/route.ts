import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import { ReplicateVideoProvider } from "@/providers/replicate/videoProvider";

import {
  getUserCredits,
  deductCredits,
} from "@/services/creditService";

import { getSettings } from "@/services/settingsService";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_REFERENCE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

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
    // 3. READ MULTIPART FORM DATA
    // ==========================================

    const formData = await req.formData();

    const promptValue = formData.get("prompt");
    const styleValue = formData.get("style");
    const cameraValue = formData.get("camera");
    const durationValue = formData.get("duration");
    const aspectRatioValue =
      formData.get("aspectRatio");
    const resolutionValue =
      formData.get("resolution");
    const qualityValue = formData.get("quality");

    const prompt =
      typeof promptValue === "string"
        ? promptValue.trim()
        : "";

    if (!prompt) {
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

    const style =
      typeof styleValue === "string"
        ? styleValue
        : "";

    const camera =
      typeof cameraValue === "string"
        ? cameraValue
        : "";

    const duration =
      typeof durationValue === "string"
        ? durationValue
        : "";

    const aspectRatio =
      typeof aspectRatioValue === "string"
        ? aspectRatioValue
        : "";

    const resolution =
      typeof resolutionValue === "string"
        ? resolutionValue
        : "";

    const quality =
      typeof qualityValue === "string"
        ? qualityValue
        : "";

    // ==========================================
    // 4. READ OPTIONAL REFERENCE IMAGE
    // ==========================================

    const referenceImageValue =
      formData.get("referenceImage");

    let referenceImage:
      | string
      | undefined;

    if (referenceImageValue instanceof File) {
      console.log(
        "Reference image received:",
        referenceImageValue.name
      );

      if (referenceImageValue.size === 0) {
        throw new Error(
          "The reference image is empty."
        );
      }

      if (
        referenceImageValue.size >
        MAX_REFERENCE_IMAGE_SIZE
      ) {
        throw new Error(
          "Reference image must be 10 MB or smaller."
        );
      }

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          referenceImageValue.type
        )
      ) {
        throw new Error(
          "Reference image must be JPG, PNG, or WEBP."
        );
      }

      referenceImage =
        await fileToDataUrl(
          referenceImageValue
        );

      console.log(
        "Reference image converted successfully."
      );
    } else if (
      typeof referenceImageValue === "string" &&
      referenceImageValue.trim()
    ) {
      console.warn(
        "Reference image was received as a string. Ignoring it because video references must be uploaded as files."
      );
    }

    // ==========================================
    // 5. GET CURRENT CREDITS
    // ==========================================

    const { credits } =
      await getUserCredits(user.id);

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
    // 6. CHECK CREDITS
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
    // 7. GENERATE VIDEO
    // ==========================================

    const provider =
      new ReplicateVideoProvider();

    console.log(
      "Starting video generation..."
    );

    const result =
      await provider.generateVideo({
        prompt,
        style,
        camera,
        duration,
        aspectRatio,
        resolution,
        quality,
        referenceImage,
      });

    console.log(
      "Replicate result:",
      result
    );

    // ==========================================
    // 8. CHECK GENERATION RESULT
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
    // 9. DEDUCT CREDITS
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
    // 10. SAVE VIDEO TO DATABASE
    // ==========================================

    const {
      error: videoError,
    } = await supabaseAdmin
      .from("video_generations")
      .insert({
        user_id: user.id,
        prompt,
        style,
        camera,
        duration,
        aspect_ratio: aspectRatio,
        resolution,
        quality,
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
    // 11. SUCCESS
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