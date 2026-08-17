import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(
        "Authentication error:",
        authError
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    const {
      data: images,
      error,
    } = await supabaseAdmin
      .from("images")
      .select(
        "id, user_id, image_url, prompt, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Database image fetch error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to load your images.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        images: images || [],
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error(
      "My Images API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load your images.",
      },
      { status: 500 }
    );
  }
}