import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    // Get the currently logged-in user
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

    // Read image ID from request
    const body = await req.json();
    const imageId = body?.id;

    if (!imageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // Find the image and make sure it belongs to this user
    const { data: image, error: imageFetchError } =
      await supabaseAdmin
        .from("images")
        .select("id, user_id, image_url")
        .eq("id", imageId)
        .eq("user_id", user.id)
        .single();

    if (imageFetchError || !image) {
      return NextResponse.json(
        {
          success: false,
          error: "Image not found or you are not authorised to delete it.",
        },
        {
          status: 404,
        }
      );
    }

    // Delete database record
    const { error: deleteError } = await supabaseAdmin
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
        {
          status: 500,
        }
      );
    }

    // Try to remove the corresponding Storage file
    try {
      const imageUrl = image.image_url;

      if (imageUrl) {
        const marker =
          "/storage/v1/object/public/generated-images/";

        const markerIndex =
          imageUrl.indexOf(marker);

        if (markerIndex !== -1) {
          const filePath = decodeURIComponent(
            imageUrl.substring(
              markerIndex + marker.length
            )
          );

          if (filePath) {
            const { error: storageError } =
              await supabaseAdmin.storage
                .from("generated-images")
                .remove([filePath]);

            if (storageError) {
              console.warn(
                "Storage image deletion warning:",
                storageError
              );
            }
          }
        }
      }
    } catch (storageError) {
      console.warn(
        "Unable to remove image from storage:",
        storageError
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully.",
    });
  } catch (error: any) {
    console.error(
      "Delete Image Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Something went wrong while deleting the image.",
      },
      {
        status: 500,
      }
    );
  }
}