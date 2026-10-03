import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const targetUrl = new URL(imageUrl);

    // Only allow images hosted by your configured Supabase project.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Supabase URL is not configured" },
        { status: 500 }
      );
    }

    const allowedHost = new URL(supabaseUrl).hostname;

    if (targetUrl.hostname !== allowedHost) {
      return NextResponse.json(
        { error: "Invalid image source" },
        { status: 403 }
      );
    }

    const response = await fetch(targetUrl.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve image" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";

    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "The requested resource is not an image" },
        { status: 400 }
      );
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Image preview error:", error);

    return NextResponse.json(
      { error: "Failed to load image preview" },
      { status: 500 }
    );
  }
}