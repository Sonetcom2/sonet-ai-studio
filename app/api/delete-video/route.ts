import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const videoId = body?.id;

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "Video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // Make sure the video belongs to the
    // currently authenticated user.
    const { data: video, error: fetchError } =
      await supabaseAdmin
        .from("video_generations")
        .select("id, user_id")
        .eq("id", videoId)
        .eq("user_id", user.id)
        .single();

    if (fetchError || !video) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Video not found or you are not authorised to delete it.",
        },
        {
          status: 404,
        }
      );
    }

    // Delete only this user's video.
    const { error: deleteError } =
      await supabaseAdmin
        .from("video_generations")
        .delete()
        .eq("id", videoId)
        .eq("user_id", user.id);

    if (deleteError) {
      console.error(
        "Database video deletion error:",
        deleteError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to delete video.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Video Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the video.",
      },
      {
        status: 500,
      }
    );
  }
}