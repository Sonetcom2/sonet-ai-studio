import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
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
          error: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // Get only this user's videos
    const { data: videos, error } =
      await supabaseAdmin
        .from("video_generations")
        .select(
          "id, prompt, style, duration, resolution, status, created_at, video_url"
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

    return NextResponse.json({
      success: true,
      videos: videos || [],
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