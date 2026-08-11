import { NextResponse } from "next/server";
import { updateUser } from "@/services/adminUpdateUserService";

export async function POST(request: Request) {
  try {
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
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (!fullName) {
      return NextResponse.json(
        { error: "Full name is required." },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser({
      id,
      fullName,
      role,
      plan,
      status,
      credits: Number(credits),
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin Update User API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to update user.",
      },
      { status: 500 }
    );
  }
}