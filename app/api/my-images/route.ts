import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
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

    // Get all images for this user
    const { data: images, error } = await supabaseAdmin
      .from("images")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      images,
    });

  } catch (error: any) {
    console.error("My Images Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load your images.",
      },
      {
        status: 500,
      }
    );
  }
}