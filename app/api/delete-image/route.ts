import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function extractStoragePath(
  imageUrl: string
): string | null {
  try {
    const marker =
      "/storage/v1/object/public/generated-images/";

    const index = imageUrl.indexOf(marker);

    if (index === -1) {
      return null;
    }

    const path = imageUrl.substring(
      index + marker.length
    );

    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export async function DELETE(
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

    let body: {
      id?: string;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const imageId = body?.id;

    if (!imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: image,
      error: imageFetchError,
    } = await supabaseAdmin
      .from("images")
      .select(
        "id, user_id, image_url"
      )
      .eq("id", imageId)
      .eq("user_id", user.id)
      .single();

    if (
      imageFetchError ||
      !image
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image not found or you are not authorised to delete it.",
        },
        { status: 404 }
      );
    }

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("images")
      .delete()
      .eq("id", imageId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error(
        "Database image deletion error:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to delete image.",
        },
        { status: 500 }
      );
    }

    const storagePath =
      image.image_url
        ? extractStoragePath(
            image.image_url
          )
        : null;

    if (storagePath) {
      const {
        error: storageError,
      } = await supabaseAdmin.storage
        .from("generated-images")
        .remove([storagePath]);

      if (storageError) {
        console.warn(
          "Storage deletion warning:",
          storageError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Image deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Image API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the image.",
      },
      { status: 500 }
    );
  }
}