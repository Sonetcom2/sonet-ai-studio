import { NextResponse } from "next/server";
import { suspendUser } from "@/services/adminSuspendUserService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const user = await suspendUser(userId);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Suspend User API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to suspend user.",
      },
      { status: 500 }
    );
  }
}