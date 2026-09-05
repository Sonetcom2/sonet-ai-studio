import { NextResponse } from "next/server";
import { getSettings } from "@/services/settingsService";

export async function GET() {
  try {
    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      voice_generation_cost: Number(settings.voice_generation_cost ?? 5),
    });
  } catch (error) {
    console.error("Public settings error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load settings.",
      },
      { status: 500 }
    );
  }
}