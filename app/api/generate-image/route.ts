import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateImage } from "@/services/imageService";

const IMAGE_GENERATION_COST = 10;

const MAX_REFERENCE_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function POST(req: Request) {
  let userId: string | null = null;
  let originalCredits: number | null = null;
  let creditsDeducted = false;

  try {
    console.log("========================================");
    console.log("GENERATE IMAGE API START");
    console.log("========================================");

    const supabase = await createClient();

    // 1. Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    userId = user.id;

    // 2. Read form data
    const formData = await req.formData();

    const prompt = String(
      formData.get("prompt") ?? ""
    ).trim();

    const model = String(
      formData.get("model") ?? "gpt-image-1"
    );

    const qualityValue = String(
      formData.get("quality") ?? "high"
    );

    const quality: "low" | "medium" | "high" | "auto" =
      ["low", "medium", "high", "auto"].includes(
        qualityValue
      )
        ? (qualityValue as
            | "low"
            | "medium"
            | "high"
            | "auto")
        : "high";

    const style = String(
      formData.get("style") ?? "auto"
    );

    const aspectRatio = String(
      formData.get("aspectRatio") ?? "1:1"
    );

    const referenceImage = formData.get(
      "referenceImage"
    );

    // 3. Validate prompt
    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        { status: 400 }
      );
    }

    // 4. Process optional reference image
    let referenceImageDataUrl: string | null = null;

    if (referenceImage instanceof File) {
      console.log(
        "Reference image:",
        referenceImage.name
      );

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          referenceImage.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid reference image format. Please use PNG, JPG, JPEG, or WEBP.",
          },
          { status: 400 }
        );
      }

      if (
        referenceImage.size >
        MAX_REFERENCE_IMAGE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Reference image is too large. Maximum size is 10 MB.",
          },
          { status: 400 }
        );
      }

      if (referenceImage.size === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "The reference image is empty.",
          },
          { status: 400 }
        );
      }

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

    // 5. Get user's profile and credits
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
        { status: 404 }
      );
    }

    const currentCredits = Number(
      profile.credits ?? 0
    );

    originalCredits = currentCredits;

    // 6. Check credits
    if (
      currentCredits <
      IMAGE_GENERATION_COST
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You don't have enough credits to generate an image.",
          creditsRemaining: currentCredits,
        },
        { status: 400 }
      );
    }

    // 7. Deduct credits
    const newCredits =
      currentCredits -
      IMAGE_GENERATION_COST;

    const { error: deductError } =
      await supabaseAdmin
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
        { status: 500 }
      );
    }

    creditsDeducted = true;

    console.log(
      `Credits deducted: ${IMAGE_GENERATION_COST}`
    );

    console.log(
      `Remaining credits: ${newCredits}`
    );

    // 8. Generate image
    console.log(
      "Generating AI image..."
    );

    const generatedImage =
      await generateImage({
        prompt,
        model,
        quality,
        style,
        aspectRatio,
        referenceImage:
          referenceImageDataUrl,
      });

    if (!generatedImage) {
      throw new Error(
        "No image was generated."
      );
    }

    // 9. Convert generated data URL to buffer
    const matches =
      generatedImage.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
      );

    if (!matches) {
      throw new Error(
        "Generated image has an invalid format."
      );
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const imageBuffer = Buffer.from(
      base64Data,
      "base64"
    );

    // 10. Upload generated image
    const filePath =
      `${user.id}/${Date.now()}-${crypto.randomUUID()}.png`;

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("generated-images")
        .upload(
          filePath,
          imageBuffer,
          {
            contentType: mimeType,
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "Storage upload error:",
        uploadError
      );

      throw new Error(
        "Unable to save generated image."
      );
    }

    // 11. Get public URL
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

    // 12. Save image to database
    const { error: imageError } =
      await supabaseAdmin
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

    // 13. Success
    console.log(
      "========================================"
    );
    console.log(
      "GENERATE IMAGE API SUCCESS"
    );
    console.log(
      "========================================"
    );

    return NextResponse.json({
      success: true,
      image: publicUrl,
      creditsUsed:
        IMAGE_GENERATION_COST,
      creditsRemaining: newCredits,
      hasReferenceImage:
        Boolean(referenceImageDataUrl),
    });
  } catch (error) {
    console.error(
      "Generate Image Error:",
      error
    );

    // Roll back credits only if they were actually deducted.
    if (
      userId &&
      originalCredits !== null &&
      creditsDeducted
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
          "Credits successfully restored."
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Image generation failed.",
      },
      { status: 500 }
    );
  }
}