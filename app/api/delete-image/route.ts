import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateImage } from "@/services/imageService";
import {
  getUserCredits,
  deductCredits,
  IMAGE_GENERATION_COST,
} from "@/services/creditService";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // Read request body
    const {
      prompt,
      model = "gpt-image-1",
      quality = "high",
      style = "auto",
      aspectRatio = "1:1",
    } = await req.json();

    if (!prompt || !prompt.trim()) {
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

    // Get current credits
    const { credits } = await getUserCredits(user.id);

    // Credit check
    if (credits < IMAGE_GENERATION_COST) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have enough credits to generate an image.",
          creditsRemaining: credits,
          creditsRequired: IMAGE_GENERATION_COST,
        },
        {
          status: 400,
        }
      );
    }

    // Deduct credits
    let creditsRemaining: number;

    try {
      creditsRemaining = await deductCredits(
        user.id,
        IMAGE_GENERATION_COST
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || "Unable to deduct credits.",
        },
        {
          status: 400,
        }
      );
    }

    console.log("Generating AI image...");

    // Generate image using OpenAI
    const image = await generateImage({
      prompt,
      model,
      quality,
      style,
      aspectRatio,
    });

    // Convert Base64 Data URL to Buffer
    const base64 = image.split(",")[1];

    if (!base64) {
      throw new Error("Invalid image data returned from AI service.");
    }

    const buffer = Buffer.from(base64, "base64");

    const fileName = `${Date.now()}.png`;

    const filePath = `${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } =
      await supabaseAdmin.storage
        .from("generated-images")
        .upload(filePath, buffer, {
          contentType: "image/png",
          upsert: false,
        });

    // Rollback credits if upload fails
    if (uploadError) {
      await supabaseAdmin
        .from("profiles")
        .update({
          credits: credits + IMAGE_GENERATION_COST,
        })
        .eq("id", user.id);

      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("generated-images")
      .getPublicUrl(filePath);

    // Save image to database
    const { error: imageError } = await supabaseAdmin
      .from("images")
      .insert({
        user_id: user.id,
        prompt,
        image_url: publicUrl,
      });

    // Roll back credits and delete uploaded image if DB insert fails
    if (imageError) {
      // Restore credits
      await supabaseAdmin
        .from("profiles")
        .update({
          credits: credits + IMAGE_GENERATION_COST,
        })
        .eq("id", user.id);

      // Remove uploaded file
      await supabaseAdmin.storage
        .from("generated-images")
        .remove([filePath]);

      throw imageError;
    }

    // Success
    return NextResponse.json({
      success: true,
      image: publicUrl,
      creditsRemaining,
      creditsUsed: IMAGE_GENERATION_COST,
    });
  } catch (error: any) {
    console.error("Generate Image Error:", error);

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