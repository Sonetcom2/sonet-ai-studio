import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ReplicateVideoProvider } from "@/providers/replicate/videoProvider";
import { getSettings } from "@/services/settingsService";
import { getUserCredits, deductCredits } from "@/services/creditService";

export async function POST(req: Request) {
  let uploadedStoragePath: string | null = null;
  let creditsDeducted = false;
  let videoGenerationCost = 0;

  try {
    // ---------------------------------------------------------
    // 1. CREATE SUPABASE SERVER CLIENT
    // ---------------------------------------------------------
    const supabase = await createClient();

    // ---------------------------------------------------------
    // 2. AUTHENTICATE USER
    // ---------------------------------------------------------
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to generate a video.",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------------------
    // 3. GET VIDEO GENERATION COST
    // ---------------------------------------------------------
    const settings = await getSettings();

    videoGenerationCost = Number(
      settings.video_generation_cost
    );

    if (
      !Number.isFinite(videoGenerationCost) ||
      videoGenerationCost <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Video generation cost is not configured correctly.",
        },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 4. CHECK USER CREDITS
    // ---------------------------------------------------------
    const creditInfo = await getUserCredits(user.id);

    const originalCredits = Number(
      creditInfo.credits
    );

    if (!Number.isFinite(originalCredits)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to determine your current credit balance.",
        },
        { status: 500 }
      );
    }

    if (originalCredits < videoGenerationCost) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient credits. You need ${videoGenerationCost} credits to generate a video.`,
          required: videoGenerationCost,
          available: originalCredits,
        },
        { status: 402 }
      );
    }

    // ---------------------------------------------------------
    // 5. READ FORM DATA
    // ---------------------------------------------------------
    const formData = await req.formData();

    const prompt = String(
      formData.get("prompt") || ""
    );

    const style = String(
      formData.get("style") || ""
    );

    const camera = String(
      formData.get("camera") || ""
    );

    const duration = String(
      formData.get("duration") || "5 sec"
    );

    const aspectRatio = String(
      formData.get("aspectRatio") || "16:9"
    );

    const resolution = String(
      formData.get("resolution") || "720p"
    );

    const quality = String(
      formData.get("quality") || ""
    );

    const referenceImageFile =
      formData.get("referenceImage");

    if (!prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Video prompt is required.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 6. PROCESS REFERENCE IMAGE
    // ---------------------------------------------------------
    let referenceImage: string | undefined;

    if (referenceImageFile instanceof File) {
      const imageBytes =
        await referenceImageFile.arrayBuffer();

      const base64 =
        Buffer.from(imageBytes).toString("base64");

      const contentType =
        referenceImageFile.type || "image/jpeg";

      referenceImage =
        `data:${contentType};base64,${base64}`;
    }

    // ---------------------------------------------------------
    // 7. GENERATE VIDEO WITH REPLICATE
    // ---------------------------------------------------------
    const provider =
      new ReplicateVideoProvider();

    console.log(
      "[SONET VIDEO] Starting Seedance 2.0 Mini generation..."
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

    if (!result.success || !result.videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            result.message ||
            result.error ||
            "Video generation failed.",
          status: result.status,
        },
        { status: 500 }
      );
    }

    const replicateVideoUrl =
      result.videoUrl;

    console.log(
      "[SONET VIDEO] Replicate video generated successfully."
    );

    // ---------------------------------------------------------
    // 8. DOWNLOAD VIDEO FROM REPLICATE
    // ---------------------------------------------------------
    console.log(
      "[SONET VIDEO] Downloading video from Replicate..."
    );

    const videoResponse =
      await fetch(replicateVideoUrl);

    if (!videoResponse.ok) {
      throw new Error(
        `Unable to download video from Replicate. Status: ${videoResponse.status}`
      );
    }

    const videoBuffer =
      await videoResponse.arrayBuffer();

    const contentType =
      videoResponse.headers.get(
        "content-type"
      ) || "video/mp4";

    // ---------------------------------------------------------
    // 9. CREATE PERMANENT STORAGE PATH
    // ---------------------------------------------------------
    const fileName =
      `${user.id}/${Date.now()}-${crypto.randomUUID()}.mp4`;

    uploadedStoragePath = fileName;

    console.log(
      "[SONET VIDEO] Uploading to generated-videos:",
      fileName
    );

    // ---------------------------------------------------------
    // 10. UPLOAD TO SUPABASE STORAGE
    // ---------------------------------------------------------
    const {
      error: uploadError,
    } = await supabase.storage
      .from("generated-videos")
      .upload(
        fileName,
        videoBuffer,
        {
          contentType,
          upsert: false,
        }
      );

    if (uploadError) {
      throw new Error(
        `Failed to permanently store video: ${uploadError.message}`
      );
    }

    console.log(
      "[SONET VIDEO] Video permanently stored in Supabase."
    );

    // ---------------------------------------------------------
    // 11. GET PERMANENT PUBLIC URL
    // ---------------------------------------------------------
    const {
      data: publicUrlData,
    } = supabase.storage
      .from("generated-videos")
      .getPublicUrl(fileName);

    const permanentVideoUrl =
      publicUrlData?.publicUrl;

    if (!permanentVideoUrl) {
      throw new Error(
        "Video was uploaded but a permanent storage URL could not be created."
      );
    }

    console.log(
      "[SONET VIDEO] Permanent Supabase URL created."
    );

    // ---------------------------------------------------------
    // 12. DEDUCT CREDITS
    // ---------------------------------------------------------
    const creditsRemaining =
      await deductCredits(
        user.id,
        videoGenerationCost
      );

    creditsDeducted = true;

    console.log(
      `[SONET VIDEO] ${videoGenerationCost} credits deducted.`
    );

    // ---------------------------------------------------------
    // 13. SAVE VIDEO TO EXISTING DATABASE SCHEMA
    //
    // IMPORTANT:
    // We only use columns already known to exist in the
    // existing SONET video_generations table.
    // ---------------------------------------------------------
    const {
      data: generation,
      error: dbError,
    } = await supabase
      .from("video_generations")
      .insert({
        user_id: user.id,
        prompt,
        video_url: permanentVideoUrl,
        credits_used: videoGenerationCost,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(
        `Video was stored but the database record could not be saved: ${dbError.message}`
      );
    }

    console.log(
      "[SONET VIDEO] Video database record saved successfully."
    );

    // ---------------------------------------------------------
    // 14. SUCCESS
    // ---------------------------------------------------------
    return NextResponse.json({
      success: true,
      video: generation,
      videoUrl: permanentVideoUrl,
      storagePath: uploadedStoragePath,
      status: "completed",
      creditsUsed: videoGenerationCost,
      creditsRemaining,
      message:
        "Video generated and permanently stored successfully.",
    });
  } catch (error) {
    console.error(
      "[SONET VIDEO] Generation error:",
      error
    );

    // ---------------------------------------------------------
    // 15. CLEAN UP SUPABASE STORAGE IF DATABASE SAVE FAILED
    // ---------------------------------------------------------
    if (uploadedStoragePath) {
      try {
        const supabase =
          await createClient();

        await supabase.storage
          .from("generated-videos")
          .remove([
            uploadedStoragePath,
          ]);

        console.log(
          "[SONET VIDEO] Storage cleanup completed."
        );
      } catch (cleanupError) {
        console.error(
          "[SONET VIDEO] Storage cleanup failed:",
          cleanupError
        );
      }
    }

    // ---------------------------------------------------------
    // 16. ROLLBACK CREDITS
    // ---------------------------------------------------------
    if (creditsDeducted) {
      try {
        const supabase =
          await createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const {
            data: profile,
            error: profileError,
          } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", user.id)
            .single();

          if (!profileError && profile) {
            const currentCredits =
              Number(profile.credits);

            await supabase
              .from("profiles")
              .update({
                credits:
                  currentCredits +
                  videoGenerationCost,
              })
              .eq("id", user.id);

            console.log(
              `[SONET VIDEO] ${videoGenerationCost} credits rolled back.`
            );
          }
        }
      } catch (rollbackError) {
        console.error(
          "[SONET VIDEO] Credit rollback failed:",
          rollbackError
        );
      }
    }

    // ---------------------------------------------------------
    // 17. ERROR RESPONSE
    // ---------------------------------------------------------
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Video generation failed.",
      },
      { status: 500 }
    );
  }
}