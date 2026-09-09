import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { generateImage } from "@/services/imageService";

export const runtime = "nodejs";
export const maxDuration = 300;

const IMAGE_COST = 10;
const MAX_REFERENCE_SIZE = 10 * 1024 * 1024;
const OPENAI_TIMEOUT = 240000;

type ImageQuality =
  | "low"
  | "medium"
  | "high"
  | "auto";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function isAllowedImageType(type: string) {
  return ALLOWED_IMAGE_TYPES.includes(type);
}

async function fileToDataUrl(
  file: File
): Promise<string> {
  const arrayBuffer =
    await file.arrayBuffer();

  const buffer =
    Buffer.from(arrayBuffer);

  return `data:${file.type};base64,${buffer.toString(
    "base64"
  )}`;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return new Promise<T>(
    (resolve, reject) => {
      const timer = setTimeout(() => {
        reject(
          new Error(
            `Image generation timed out after ${Math.round(
              timeoutMs / 1000
            )} seconds.`
          )
        );
      }, timeoutMs);

      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    }
  );
}

export async function POST(
  request: Request
) {
  console.log(
    "========================================"
  );
  console.log(
    "GENERATE IMAGE API START"
  );
  console.log(
    "========================================"
  );

  const supabase =
    await createClient();

  let userId: string | null = null;
  let creditsDeducted = false;
  let uploadedStoragePath:
    | string
    | null = null;

  try {
    // ---------------------------------------------------------
    // 1. AUTHENTICATION
    // ---------------------------------------------------------

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Authentication error:",
        authError
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    userId = user.id;

    console.log(
      "Authenticated user:",
      user.email
    );

    // ---------------------------------------------------------
    // 2. READ FORM DATA
    // ---------------------------------------------------------

    const formData =
      await request.formData();

    const promptValue =
      formData.get("prompt");

    const referenceImageValue =
      formData.get("referenceImage");

    const requestedModelValue =
      formData.get("model");

    const qualityValue =
      formData.get("quality");

    const styleValue =
      formData.get("style");

    const aspectRatioValue =
      formData.get("aspectRatio");

    const prompt =
      typeof promptValue === "string"
        ? promptValue.trim()
        : "";

    const requestedModel =
      typeof requestedModelValue ===
      "string"
        ? requestedModelValue
        : "gpt-image-2";

    const quality: ImageQuality =
      qualityValue === "low" ||
      qualityValue === "medium" ||
      qualityValue === "high" ||
      qualityValue === "auto"
        ? qualityValue
        : "medium";

    const style =
      typeof styleValue === "string"
        ? styleValue
        : "auto";

    const aspectRatio =
      typeof aspectRatioValue ===
      "string"
        ? aspectRatioValue
        : "1:1";

    // ---------------------------------------------------------
    // 3. VALIDATE PROMPT
    // ---------------------------------------------------------

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please enter an image prompt.",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Prompt is too long. Please shorten your prompt.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 4. FORCE GPT-IMAGE-2
    // ---------------------------------------------------------

    const effectiveModel =
      "gpt-image-2";

    console.log(
      "Requested model:",
      requestedModel
    );

    console.log(
      "Effective model:",
      effectiveModel
    );

    console.log(
      "Quality:",
      quality
    );

    console.log(
      "Style:",
      style
    );

    console.log(
      "Aspect ratio:",
      aspectRatio
    );

    // ---------------------------------------------------------
    // 5. CHECK USER PROFILE / CREDITS
    // ---------------------------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "credits, plan"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Profile lookup error:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify your account credits.",
        },
        { status: 500 }
      );
    }

    const currentCredits =
      Number(
        profile?.credits ?? 0
      );

    console.log(
      "Current credits:",
      currentCredits
    );

    console.log(
      "Image generation cost:",
      IMAGE_COST
    );

    if (
      currentCredits <
      IMAGE_COST
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Insufficient credits. Please upgrade your plan or add more credits.",
          credits:
            currentCredits,
          required:
            IMAGE_COST,
        },
        { status: 402 }
      );
    }

    // ---------------------------------------------------------
    // 6. REFERENCE IMAGE
    // ---------------------------------------------------------

    let referenceImage:
      | string
      | undefined;

    if (
      referenceImageValue instanceof
      File
    ) {
      console.log(
        "Reference image received:",
        referenceImageValue.name
      );

      console.log(
        "Reference image type:",
        referenceImageValue.type
      );

      console.log(
        "Reference image size:",
        referenceImageValue.size,
        "bytes"
      );

      if (
        referenceImageValue.size <=
        0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "The reference image is empty.",
          },
          { status: 400 }
        );
      }

      if (
        referenceImageValue.size >
        MAX_REFERENCE_SIZE
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Reference image is too large. Maximum size is 10MB.",
          },
          { status: 400 }
        );
      }

      if (
        !isAllowedImageType(
          referenceImageValue.type
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Unsupported reference image format. Please use JPG, PNG, or WebP.",
          },
          { status: 400 }
        );
      }

      try {
        referenceImage =
          await fileToDataUrl(
            referenceImageValue
          );

        console.log(
          "Reference image converted successfully."
        );
      } catch (error) {
        console.error(
          "Reference image conversion error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Unable to process the reference image.",
          },
          { status: 400 }
        );
      }
    }

    console.log(
      "Reference image mode:",
      referenceImage
        ? "true"
        : "false"
    );

    // ---------------------------------------------------------
    // 7. DEDUCT CREDITS
    // ---------------------------------------------------------

    const newCredits =
      currentCredits -
      IMAGE_COST;

    const {
      error: creditError,
    } = await supabase
      .from("profiles")
      .update({
        credits: newCredits,
      })
      .eq("id", user.id)
      .eq(
        "credits",
        currentCredits
      );

    if (creditError) {
      console.error(
        "Credit deduction error:",
        creditError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to reserve credits for this generation.",
        },
        { status: 500 }
      );
    }

    creditsDeducted = true;

    console.log(
      "Credits deducted:",
      IMAGE_COST
    );

    console.log(
      "Remaining credits:",
      newCredits
    );

    // ---------------------------------------------------------
    // 8. GENERATE IMAGE
    // ---------------------------------------------------------

    console.log(
      "========================================"
    );

    console.log(
      "Generating AI image..."
    );

    console.log(
      "========================================"
    );

    console.log(
      "IMAGE GENERATION START"
    );

    console.log(
      "Model:",
      effectiveModel
    );

    console.log(
      "Quality:",
      quality
    );

    console.log(
      "Style:",
      style
    );

    console.log(
      "Aspect ratio:",
      aspectRatio
    );

    console.log(
      "Has reference image:",
      Boolean(referenceImage)
    );

    if (referenceImage) {
      console.log(
        "REFERENCE IMAGE EDIT MODE"
      );

      console.log(
        "Identity preservation: ENABLED"
      );

      console.log(
        "Input fidelity parameter: NOT USED — GPT-Image-2 handles image inputs natively"
      );
    }

    const generationPromise =
      generateImage({
        prompt,
        model:
          effectiveModel,
        quality,
        style,
        aspectRatio,
        referenceImage,
      });

    const generationResult =
      await withTimeout(
        generationPromise,
        OPENAI_TIMEOUT
      );

    console.log(
      "IMAGE GENERATION SUCCESS"
    );

    // ---------------------------------------------------------
    // 9. EXTRACT GENERATED IMAGE
    // ---------------------------------------------------------

    let generatedImageUrl:
      | string
      | null = null;

    if (
      typeof generationResult ===
      "string"
    ) {
      generatedImageUrl =
        generationResult;
    } else if (
      generationResult &&
      typeof generationResult ===
        "object"
    ) {
      const resultObject =
        generationResult as Record<
          string,
          unknown
        >;

      if (
        typeof resultObject.url ===
        "string"
      ) {
        generatedImageUrl =
          resultObject.url;
      } else if (
        typeof resultObject.image ===
        "string"
      ) {
        generatedImageUrl =
          resultObject.image;
      } else if (
        typeof resultObject.imageUrl ===
        "string"
      ) {
        generatedImageUrl =
          resultObject.imageUrl;
      } else if (
        typeof resultObject.dataUrl ===
        "string"
      ) {
        generatedImageUrl =
          resultObject.dataUrl;
      }
    }

    if (!generatedImageUrl) {
      console.error(
        "Unable to extract image URL from generation result:",
        generationResult
      );

      throw new Error(
        "AI generated an image, but no image URL was returned."
      );
    }

    console.log(
      "Generated image URL received."
    );

    // ---------------------------------------------------------
    // 10. DOWNLOAD / DECODE IMAGE
    // ---------------------------------------------------------

    let imageBytes: Uint8Array;

    let contentType =
      "image/png";

    if (
      generatedImageUrl.startsWith(
        "data:"
      )
    ) {
      console.log(
        "Generated image is a data URL."
      );

      const match =
        generatedImageUrl.match(
          /^data:([^;]+);base64,(.+)$/
        );

      if (!match) {
        throw new Error(
          "Invalid generated image data URL."
        );
      }

      contentType =
        match[1];

      const base64Data =
        match[2];

      imageBytes =
        Uint8Array.from(
          Buffer.from(
            base64Data,
            "base64"
          )
        );
    } else {
      console.log(
        "Generated image is a remote URL."
      );

      const imageResponse =
        await fetch(
          generatedImageUrl
        );

      if (!imageResponse.ok) {
        throw new Error(
          `Unable to download generated image. HTTP ${imageResponse.status}`
        );
      }

      const responseContentType =
        imageResponse.headers.get(
          "content-type"
        );

      if (
        responseContentType?.startsWith(
          "image/"
        )
      ) {
        contentType =
          responseContentType;
      }

      imageBytes =
        new Uint8Array(
          await imageResponse.arrayBuffer()
        );
    }

    console.log(
      "Generated image bytes:",
      imageBytes.length
    );

    // ---------------------------------------------------------
    // 11. STORAGE FILE NAME
    // ---------------------------------------------------------

    const extension =
      contentType.includes(
        "jpeg"
      ) ||
      contentType.includes(
        "jpg"
      )
        ? "jpg"
        : contentType.includes(
            "webp"
          )
        ? "webp"
        : "png";

    const fileName =
      `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    uploadedStoragePath =
      fileName;

    console.log(
      "Storage path:",
      fileName
    );

    // ---------------------------------------------------------
    // 12. UPLOAD TO SUPABASE STORAGE
    // ---------------------------------------------------------

    console.log(
      "Uploading generated image..."
    );

    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        "generated-images"
      )
      .upload(
        fileName,
        imageBytes,
        {
          contentType,
          upsert: false,
        }
      );

    if (uploadError) {
      console.error(
        "Supabase image upload error:",
        uploadError
      );

      throw new Error(
        "Generated image could not be uploaded."
      );
    }

    console.log(
      "Generated image uploaded successfully."
    );

    // ---------------------------------------------------------
    // 13. GET PUBLIC URL
    // ---------------------------------------------------------

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(
        "generated-images"
      )
      .getPublicUrl(
        fileName
      );

    const publicUrl =
      publicUrlData?.publicUrl;

    if (!publicUrl) {
      throw new Error(
        "Unable to create a public URL for the generated image."
      );
    }

    console.log(
      "Public image URL created."
    );

    // ---------------------------------------------------------
    // 14. SAVE IMAGE HISTORY
    // ---------------------------------------------------------
    //
    // IMPORTANT:
    // The existing `images` table does NOT contain
    // `model` or `quality` columns.
    //
    // Confirmed fields from /api/my-images:
    //
    // id
    // user_id
    // image_url
    // prompt
    // created_at
    //
    // Therefore we only insert fields that exist.
    // ---------------------------------------------------------

    const {
      error: insertError,
    } = await supabase
      .from("images")
      .insert({
        user_id: user.id,
        prompt,
        image_url: publicUrl,
      });

    if (insertError) {
      console.error(
        "Image history insert error:",
        insertError
      );

      throw new Error(
        "Image was generated but could not be saved to your history."
      );
    }

    console.log(
      "Image history saved successfully."
    );

    // ---------------------------------------------------------
    // 15. SUCCESS
    // ---------------------------------------------------------

    console.log(
      "========================================"
    );

    console.log(
      "GENERATE IMAGE SUCCESS"
    );

    console.log(
      "========================================"
    );

    return NextResponse.json(
      {
        success: true,
        image: publicUrl,
        imageUrl: publicUrl,
        creditsUsed:
          IMAGE_COST,
        remainingCredits:
          newCredits,
        model:
          effectiveModel,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // ---------------------------------------------------------
    // 16. ERROR HANDLING
    // ---------------------------------------------------------

    console.error(
      "========================================"
    );

    console.error(
      "GENERATE IMAGE ERROR"
    );

    console.error(error);

    console.error(
      "========================================"
    );

    // ---------------------------------------------------------
    // 17. REMOVE UPLOADED IMAGE
    // ---------------------------------------------------------

    if (uploadedStoragePath) {
      try {
        const {
          error: removeError,
        } = await supabase.storage
          .from(
            "generated-images"
          )
          .remove([
            uploadedStoragePath,
          ]);

        if (removeError) {
          console.error(
            "Uploaded image removal error:",
            removeError
          );
        } else {
          console.log(
            "Uploaded image removed."
          );
        }
      } catch (removeError) {
        console.error(
          "Failed to remove uploaded image:",
          removeError
        );
      }
    }

    // ---------------------------------------------------------
    // 18. ROLLBACK CREDITS
    // ---------------------------------------------------------

    if (
      creditsDeducted &&
      userId
    ) {
      try {
        console.log(
          "Rolling back credits..."
        );

        const {
          data: rollbackProfile,
          error:
            rollbackReadError,
        } = await supabase
          .from("profiles")
          .select("credits")
          .eq(
            "id",
            userId
          )
          .single();

        if (rollbackReadError) {
          console.error(
            "Credit rollback read error:",
            rollbackReadError
          );
        } else {
          const restoredCredits =
            Number(
              rollbackProfile?.credits ??
                0
            ) + IMAGE_COST;

          const {
            error:
              rollbackUpdateError,
          } = await supabase
            .from("profiles")
            .update({
              credits:
                restoredCredits,
            })
            .eq(
              "id",
              userId
            );

          if (
            rollbackUpdateError
          ) {
            console.error(
              "Credit rollback update error:",
              rollbackUpdateError
            );
          } else {
            console.log(
              "Credits successfully rolled back."
            );

            console.log(
              "Restored credits:",
              restoredCredits
            );
          }
        }
      } catch (rollbackError) {
        console.error(
          "Credit rollback exception:",
          rollbackError
        );
      }
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Something went wrong while generating the image.";

    console.error(
      "Final API error:",
      errorMessage
    );

    return NextResponse.json(
      {
        success: false,
        error:
          errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}