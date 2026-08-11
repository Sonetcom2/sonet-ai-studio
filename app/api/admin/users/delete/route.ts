import { NextResponse } from "next/server";
import { deleteUser } from "@/services/adminDeleteUserService";

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

    const result = await deleteUser(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Delete User API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete user.",
      },
      { status: 500 }
    );
  }
}