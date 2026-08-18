import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/requireAdmin";
import { updateUser } from "@/services/adminUpdateUserService";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      id,
      fullName,
      role,
      plan,
      status,
      credits,
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof fullName !== "string" ||
      !fullName.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof credits !== "number" ||
      !Number.isFinite(credits) ||
      credits < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Credits must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser({
      id,
      fullName: fullName.trim(),
      role,
      plan,
      status,
      credits: Math.floor(credits),
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "Admin Update User API Error:",
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
        error: "Failed to update user.",
      },
      { status: 500 }
    );
  }
}