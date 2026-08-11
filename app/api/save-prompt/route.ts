import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { prompt } = await req.json();

    const { error } = await supabase
      .from("saved_prompts")
      .insert({
        user_id: user.id,
        title: prompt.substring(0, 60),
        prompt,
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save prompt",
      },
      {
        status: 500,
      }
    );

  }
}