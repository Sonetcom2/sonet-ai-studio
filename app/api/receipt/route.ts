import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getReceipt } from "@/services/receiptService";

export async function GET(request: Request) {
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
        { status: 401 }
      );
    }

    // Get reference from URL
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment reference is required.",
        },
        { status: 400 }
      );
    }

    // Get receipt
    const receipt = await getReceipt(reference);

    // Security check:
    // Make sure this receipt belongs to the logged-in user.
    if (receipt.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      receipt,
    });
  } catch (error: any) {
    console.error("Receipt API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to load receipt.",
      },
      { status: 500 }
    );
  }
}