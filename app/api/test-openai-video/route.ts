import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    // Simple API connectivity test
    const models = await openai.models.list();

    return NextResponse.json({
      success: true,
      message: "OpenAI connection successful.",
      models: models.data.slice(0, 10).map((m) => m.id),
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json({
      success: false,
      message: error?.message || "Unknown error",
    });
  }
}