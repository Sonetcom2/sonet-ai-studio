import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  req: Request
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const { searchParams } =
      new URL(req.url);

    const imageUrl =
      searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing image URL.",
        },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid image URL.",
        },
        { status: 400 }
      );
    }

    /*
     * Only allow images stored in the
     * SONET generated-images bucket.
     */
    if (
      !parsedUrl.pathname.includes(
        "/storage/v1/object/public/generated-images/"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This image is not a valid SONET image.",
        },
        { status: 400 }
      );
    }

    /*
     * Confirm that this image belongs
     * to the authenticated user.
     */
    const {
      data: image,
      error: imageError,
    } = await supabaseAdmin
      .from("images")
      .select(
        "id, image_url"
      )
      .eq("user_id", user.id)
      .eq("image_url", imageUrl)
      .maybeSingle();

    if (imageError) {
      console.error(
        "Image ownership lookup error:",
        imageError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify image ownership.",
        },
        { status: 500 }
      );
    }

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image not found or you are not authorised to download it.",
        },
        { status: 404 }
      );
    }

    const response =
      await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        "Unable to fetch image from storage."
      );
    }

    const arrayBuffer =
      await response.arrayBuffer();

    const contentType =
      response.headers.get(
        "content-type"
      ) || "image/png";

    return new NextResponse(
      arrayBuffer,
      {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="sonet-ai-${image.id}.png"`,
          "Cache-Control":
            "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Download Image API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to download image.",
      },
      { status: 500 }
    );
  }
}