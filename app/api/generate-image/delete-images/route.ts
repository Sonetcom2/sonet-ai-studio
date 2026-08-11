import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
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

    const { id, image_url } = await req.json();

    // Extract file path from public URL
    const url = new URL(image_url);

    const filePath = url.pathname.split("/generated-images/")[1];

    // Delete from Storage
    const { error: storageError } =
      await supabaseAdmin.storage
        .from("generated-images")
        .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    // Delete database row
    const { error: dbError } =
      await supabaseAdmin
        .from("images")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
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