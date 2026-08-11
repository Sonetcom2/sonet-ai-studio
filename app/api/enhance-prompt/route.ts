import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

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
`,
    });

    return NextResponse.json({
      prompt: response.output_text,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to enhance prompt",
      },
      {
        status: 500,
      }
    );
  }
}