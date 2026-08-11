import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Find image
    const { data: image, error } = await supabaseAdmin
      .from("images")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !image) {
      return NextResponse.json(
        {
          success: false,
          error: "Image not found.",
        },
        {
          status: 404,
        }
      );
    }

    // Extract storage path
    const url = new URL(image.image_url);
    const marker = "/generated-images/";
    const index = url.pathname.indexOf(marker);

    if (index !== -1) {
      const filePath = decodeURIComponent(
        url.pathname.substring(index + marker.length)
      );

      await supabaseAdmin.storage
        .from("generated-images")
        .remove([filePath]);
    }

    // Delete database record
    const { error: deleteError } = await supabaseAdmin
      .from("images")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error: any) {
    console.error("Delete Image Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to delete image.",
      },
      {
        status: 500,
      }
    );
  }
}