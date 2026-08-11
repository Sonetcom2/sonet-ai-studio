import { NextRequest, NextResponse } from "next/server";
import { getReceipt } from "@/services/receiptService";

export async function GET(request: NextRequest) {
  try {
    const reference =
      request.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment reference.",
        },
        { status: 400 }
      );
    }

    const receipt = await getReceipt(reference);

    return NextResponse.json({
      success: true,
      receipt,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}