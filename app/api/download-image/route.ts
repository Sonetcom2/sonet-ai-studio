import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing image URL" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error("Unable to fetch image");
    }

    const blob = await response.arrayBuffer();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition":
          `attachment; filename="sonet-ai-${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}