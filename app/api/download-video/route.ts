import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json(
      {
        error: "Missing video URL.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(
        `Unable to fetch video. Status: ${response.status}`
      );
    }

    const videoBuffer =
      await response.arrayBuffer();

    const contentType =
      response.headers.get("content-type") ||
      "video/mp4";

    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          `attachment; filename="sonet-ai-video-${Date.now()}.mp4"`,
      },
    });
  } catch (error) {
    console.error(
      "Video download error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to download video.",
      },
      {
        status: 500,
      }
    );
  }
}