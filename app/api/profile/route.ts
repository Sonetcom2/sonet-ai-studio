import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, bio, credits, plan")
      .eq("id", user.id)
      .single();

    const { count: images } = await supabase
      .from("images")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    const { data: imageData } = await supabase
      .from("images")
      .select("image_url")
      .eq("user_id", user.id);

    let storageUsed = 0;

    imageData?.forEach((img) => {
      storageUsed += img.image_url.length;
    });

    return NextResponse.json({
      success: true,
      profile: {
        full_name: profile?.full_name ?? "",
        email: user.email ?? "",
        avatar_url: profile?.avatar_url ?? "",
        bio: profile?.bio ?? "",
        credits: profile?.credits ?? 0,
        plan: profile?.plan ?? "FREE",
        images: images ?? 0,
        storage: `${(storageUsed / 1024 / 1024).toFixed(2)} MB`,
        created_at: user.created_at,
      },
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}