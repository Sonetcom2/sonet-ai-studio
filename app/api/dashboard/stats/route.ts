import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    // Current logged in user
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

    // Profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    // Total Images
    const { count: totalImages } = await supabaseAdmin
      .from("images")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    // Images Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: imagesToday } = await supabaseAdmin
      .from("images")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString());

    // Total Videos (future feature)
    const totalVideos = 0;
    const videosToday = 0;

    // Storage estimate
    const { data: imageRows } = await supabaseAdmin
      .from("images")
      .select("image_url")
      .eq("user_id", user.id);

    const estimatedStorageMB = Number(
      (((imageRows?.length || 0) * 1.2)).toFixed(2)
    );

    return NextResponse.json({
      success: true,

      stats: {
        totalImages: totalImages ?? 0,
        imagesToday: imagesToday ?? 0,

        totalVideos,
        videosToday,

        credits: profile?.credits ?? 0,

        storageUsed: estimatedStorageMB,
      },
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load dashboard statistics.",
      },
      {
        status: 500,
      }
    );
  }
}