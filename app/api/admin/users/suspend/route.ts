import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { suspendUser } from "@/services/adminSuspendUserService";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    const user = await suspendUser(userId);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "Suspend User API Error:",
      error
    );

    if (
      error instanceof Error &&
      error.message === "UNAUTHORIZED"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "FORBIDDEN"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to suspend user.",
      },
      { status: 500 }
    );
  }
}