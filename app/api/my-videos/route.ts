import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    const { data: videos, error } =
      await supabaseAdmin
        .from("video_generations")
        .select(
          "id, prompt, video_url, credits_used, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "My Videos Database Error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to load your videos.",
        },
        {
          status: 500,
        }
      );
    }

    const formattedVideos = (videos || []).map(
      (video) => ({
        ...video,

        // A permanent video_url means the video was
        // successfully generated and stored.
        status: video.video_url
          ? "completed"
          : "failed",

        style: "Seedance 2.0 Mini",

        duration: "AI Video",

        resolution: "720p",
      })
    );

    return NextResponse.json({
      success: true,
      videos: formattedVideos,
    });
  } catch (error) {
    console.error(
      "My Videos API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load videos.",
      },
      {
        status: 500,
      }
    );
  }
}