import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateImage } from "@/services/imageService";
import { getSettings } from "@/services/settingsService";

const MAX_REFERENCE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function POST(req: Request) {
  let userId: string | null = null;
  let originalCredits: number | null = null;
  let uploadedFilePath: string | null = null;

  try {
    console.log("========================================");
    console.log("GENERATE IMAGE API START");
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
          error: "Unauthorized. Please login first.",
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

    const imageGenerationCost = Number(
      settings.image_generation_cost
    );

    if (
      !Number.isFinite(imageGenerationCost) ||
      imageGenerationCost < 0
    ) {
      throw new Error(
        "Invalid image generation cost configured."
      );
    }

    console.log(
      "Image generation cost:",
      imageGenerationCost
    );

    // ==========================================
    // 3. READ FORM DATA
    // ==========================================

    const formData = await req.formData();

    const prompt = String(
      formData.get("prompt") ?? ""
    ).trim();

    const model = String(
      formData.get("model") ?? "gpt-image-1"
    );

    const quality = String(
      formData.get("quality") ?? "high"
    ) as "low" | "medium" | "high" | "auto";

    const style = String(
      formData.get("style") ?? "auto"
    );

    const aspectRatio = String(
      formData.get("aspectRatio") ?? "1:1"
    );

    const referenceImage = formData.get(
      "referenceImage"
    );

    // ==========================================
    // 4. VALIDATE PROMPT
    // ==========================================

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 5. VALIDATE REFERENCE IMAGE
    // ==========================================

    let referenceImageDataUrl: string | null = null;

    if (referenceImage instanceof File) {
      console.log(
        "Reference image received:",
        referenceImage.name
      );

      if (!ALLOWED_IMAGE_TYPES.includes(referenceImage.type)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid reference image format. Please use PNG, JPG, JPEG, or WEBP.",
          },
          {
            status: 400,
          }
        );
      }

      if (referenceImage.size > MAX_REFERENCE_IMAGE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Reference image is too large. Maximum size is 10 MB.",
          },
          {
            status: 400,
          }
        );
      }

      if (referenceImage.size === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "The reference image is empty.",
          },
          {
            status: 400,
          }
        );
      }

      // Convert uploaded image into a data URL.
      const arrayBuffer =
        await referenceImage.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      const base64 = buffer.toString("base64");

      referenceImageDataUrl =
        `data:${referenceImage.type};base64,${base64}`;

      console.log(
        "Reference image converted successfully."
      );
    }

    // ==========================================
    // 6. GET USER PROFILE / CREDITS
    // ==========================================

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "Profile error:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const currentCredits = Number(
      profile.credits ?? 0
    );

    originalCredits = currentCredits;

    // ==========================================
    // 7. CHECK CREDITS
    // ==========================================

    if (currentCredits < imageGenerationCost) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You don't have enough credits to generate an image.",
          creditsRemaining: currentCredits,
          creditsRequired: imageGenerationCost,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 8. DEDUCT CREDITS
    // ==========================================

    const newCredits =
      currentCredits - imageGenerationCost;

    const {
      error: deductError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        credits: newCredits,
      })
      .eq("id", user.id);

    if (deductError) {
      console.error(
        "Credit deduction error:",
        deductError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to deduct credits.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      `Credits deducted: ${imageGenerationCost}`
    );

    console.log(
      `Remaining credits: ${newCredits}`
    );

    // ==========================================
    // 9. GENERATE IMAGE
    // ==========================================

    console.log("Generating AI image...");

    if (referenceImageDataUrl) {
      console.log(
        "Using reference image generation."
      );
    }

    const generatedImage = await generateImage({
      prompt,
      model,
      quality,
      style,
      aspectRatio,
      referenceImage: referenceImageDataUrl,
    });

    if (!generatedImage) {
      throw new Error(
        "Image generation returned no image."
      );
    }

    // ==========================================
    // 10. CONVERT GENERATED IMAGE
    // ==========================================

    let imageBuffer: Buffer;

    if (generatedImage.startsWith("data:")) {
      const matches = generatedImage.match(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/
      );

      if (!matches) {
        throw new Error(
          "Invalid generated image data."
        );
      }

      imageBuffer = Buffer.from(
        matches[1],
        "base64"
      );
    } else {
      throw new Error(
        "Generated image has an invalid format."
      );
    }

    // ==========================================
    // 11. UPLOAD GENERATED IMAGE
    // ==========================================

    const filePath =
      `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`;

    uploadedFilePath = filePath;

    const {
      error: uploadError,
    } = await supabaseAdmin.storage
      .from("generated-images")
      .upload(filePath, imageBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error(
        "Storage upload error:",
        uploadError
      );

      throw new Error(
        "Unable to save generated image."
      );
    }

    // ==========================================
    // 12. GET PUBLIC URL
    // ==========================================

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("generated-images")
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error(
        "Unable to create image URL."
      );
    }

    console.log(
      "Generated image uploaded."
    );

    // ==========================================
    // 13. SAVE IMAGE TO DATABASE
    // ==========================================

    const {
      error: imageError,
    } = await supabaseAdmin
      .from("images")
      .insert({
        user_id: user.id,
        prompt,
        image_url: publicUrl,
      });

    if (imageError) {
      console.error(
        "Database image error:",
        imageError
      );

      throw new Error(
        "Unable to save image information."
      );
    }

    console.log(
      "Image saved to database."
    );

    // ==========================================
    // 14. SUCCESS
    // ==========================================

    console.log("========================================");
    console.log("GENERATE IMAGE API SUCCESS");
    console.log("========================================");

    return NextResponse.json({
      success: true,
      image: publicUrl,
      creditsUsed: imageGenerationCost,
      creditsRemaining: newCredits,
      hasReferenceImage:
        Boolean(referenceImageDataUrl),
    });
  } catch (error) {
    console.error(
      "Generate Image Error:",
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

    // ==========================================
    // CLEAN UP UPLOADED FILE IF NECESSARY
    // ==========================================

    if (uploadedFilePath) {
      const { error: removeError } =
        await supabaseAdmin.storage
          .from("generated-images")
          .remove([uploadedFilePath]);

      if (removeError) {
        console.error(
          "Storage cleanup error:",
          removeError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate image.",
      },
      {
        status: 500,
      }
    );
  }
}