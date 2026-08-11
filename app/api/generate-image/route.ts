import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateImage } from "@/services/imageService";

const IMAGE_GENERATION_COST = 10;

// Maximum reference image size: 10 MB
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
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 GENERATE IMAGE API START");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

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
    // 2. READ FORM DATA
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
    // 3. VALIDATE PROMPT
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
    // 4. VALIDATE REFERENCE IMAGE
    // ==========================================

    let referenceImageDataUrl: string | null = null;

    if (referenceImage instanceof File) {
      console.log(
        "📷 Reference image received:",
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
        "✅ Reference image converted successfully"
      );
    }

    // ==========================================
    // 5. GET USER PROFILE / CREDITS
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
    // 6. CHECK CREDITS
    // ==========================================

    if (currentCredits < IMAGE_GENERATION_COST) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You don't have enough credits to generate an image.",
          creditsRemaining: currentCredits,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 7. DEDUCT CREDITS
    // ==========================================

    const newCredits =
      currentCredits - IMAGE_GENERATION_COST;

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
      `💳 Credits deducted: ${IMAGE_GENERATION_COST}`
    );

    console.log(
      `💰 Remaining credits: ${newCredits}`
    );

    // ==========================================
    // 8. GENERATE IMAGE
    // ==========================================

    console.log("🎨 Generating AI image...");

    if (referenceImageDataUrl) {
      console.log(
        "📷 Using reference image generation."
      );
    } else {
      console.log(
        "📝 Using text-only generation."
      );
    }

    const image = await generateImage({
      prompt,
      model,
      quality,
      style,
      aspectRatio,
      referenceImage:
        referenceImageDataUrl,
    });

    if (!image) {
      throw new Error(
        "Image generation returned no image."
      );
    }

    console.log(
      "✅ AI image generated successfully."
    );

    // ==========================================
    // 9. CONVERT GENERATED IMAGE
    // ==========================================

    const base64 = image.split(",")[1];

    if (!base64) {
      throw new Error(
        "Generated image data is invalid."
      );
    }

    const buffer = Buffer.from(
      base64,
      "base64"
    );

    // ==========================================
    // 10. UPLOAD TO SUPABASE STORAGE
    // ==========================================

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.png`;

    const filePath =
      `${user.id}/${fileName}`;

    uploadedFilePath = filePath;

    console.log(
      "☁️ Uploading generated image..."
    );

    const {
      error: uploadError,
    } = await supabaseAdmin.storage
      .from("generated-images")
      .upload(filePath, buffer, {
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
    // 11. GET PUBLIC URL
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
      "✅ Generated image uploaded."
    );

    // ==========================================
    // 12. SAVE IMAGE TO DATABASE
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
      "✅ Image saved to database."
    );

    // ==========================================
    // 13. SUCCESS
    // ==========================================

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ GENERATE IMAGE API SUCCESS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return NextResponse.json({
      success: true,
      image: publicUrl,
      creditsUsed: IMAGE_GENERATION_COST,
      creditsRemaining: newCredits,
      hasReferenceImage:
        Boolean(referenceImageDataUrl),
    });
  } catch (error: any) {
    console.error(
      "🔥 Generate Image Error:",
      error
    );

    // ==========================================
    // ROLLBACK
    // ==========================================

    if (userId && originalCredits !== null) {
      console.log(
        "↩️ Rolling back credits..."
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
          "❌ Credit rollback failed:",
          rollbackError
        );
      } else {
        console.log(
          "✅ Credits restored:",
          originalCredits
        );
      }
    }

    // ==========================================
    // DELETE UPLOADED GENERATED IMAGE
    // ==========================================

    if (uploadedFilePath) {
      console.log(
        "🗑 Removing incomplete generated image..."
      );

      const {
        error: removeError,
      } = await supabaseAdmin.storage
        .from("generated-images")
        .remove([
          uploadedFilePath,
        ]);

      if (removeError) {
        console.error(
          "Storage cleanup error:",
          removeError
        );
      }
    }

    // ==========================================
    // RETURN ERROR
    // ==========================================

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Something went wrong while generating the image.",
      },
      {
        status: 500,
      }
    );
  }
}