import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireAdmin";

import {
  deleteAdminVideo,
} from "@/services/adminVideoManagementService";

export async function DELETE(req: Request) {
  try {
    await requireAdmin();

    const body = await req.json();

    const videoId =
      typeof body?.id === "string"
        ? body.id.trim()
        : "";

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "Video ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await deleteAdminVideo(videoId);

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Admin Video Delete API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete video.",
      },
      {
        status: 500,
      }
    );
  }
}