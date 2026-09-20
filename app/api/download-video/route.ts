import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoUrl = searchParams.get("url");

    if (!videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing video URL.",
        },
        {
          status: 400,
        }
      );
    }

    // Only allow downloads from our Supabase storage.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl || !videoUrl.startsWith(supabaseUrl)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid video URL.",
        },
        {
          status: 400,
        }
      );
    }

    console.log("[SONET VIDEO DOWNLOAD] Downloading:", videoUrl);

    const response = await fetch(videoUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "[SONET VIDEO DOWNLOAD] Supabase response:",
        response.status,
        response.statusText
      );

      return NextResponse.json(
        {
          success: false,
          error: `Unable to fetch video. Status: ${response.status}`,
        },
        {
          status: 500,
        }
      );
    }

    const videoBuffer = await response.arrayBuffer();

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "video/mp4",

        "Content-Disposition": `attachment; filename="sonet-ai-video-${Date.now()}.mp4"`,

        "Content-Length": String(videoBuffer.byteLength),

        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "[SONET VIDEO DOWNLOAD] Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
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