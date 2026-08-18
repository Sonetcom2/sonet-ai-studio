import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { deleteUser } from "@/services/adminDeleteUserService";

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

    const result = await deleteUser(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Delete User API Error:",
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
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete user.",
      },
      { status: 500 }
    );
  }
}