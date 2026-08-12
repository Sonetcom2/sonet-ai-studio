import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        {
          error: "Prompt is required.",
        },
        {
          status: 400,
        }
      );
    }

    const openai = getOpenAI();

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: `
You are a world-class AI prompt engineer.

Rewrite the following prompt into a professional prompt suitable for GPT Image, Flux, Midjourney, Ideogram, and other image/video generation models.

Keep the meaning.
Improve quality.
Add professional photography language.
Do not explain.
Return only the enhanced prompt.

Prompt:

${prompt}
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      prompt: response.output_text,
    });
  } catch (error) {
    console.error("Enhance prompt error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to enhance prompt",
      },
      {
        status: 500,
      }
    );
  }
}