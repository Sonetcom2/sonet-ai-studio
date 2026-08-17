import { NextRequest, NextResponse } from "next/server";
import { generateAIText } from "@/services/aiService";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required.",
        },
        {
          status: 400,
        }
      );
    }

    const enhancedPrompt = await generateAIText({
      systemPrompt: `
You are SONET AI-STUDIO Prompt Engineer, an expert prompt engineer specializing in image and video generation.

Transform the user's simple idea into a professional, detailed generation prompt.

Requirements:
- Preserve the user's original intent.
- Improve specificity and visual clarity.
- Add appropriate subject details.
- Add composition and framing when useful.
- Add professional lighting when appropriate.
- Add camera/lens language when useful.
- Add environment and background details when appropriate.
- Improve realism, texture, detail, and visual quality when relevant.
- Do not unnecessarily change the subject.
- Do not invent important facts that contradict the user's request.
- Do not explain your changes.
- Return ONLY the final optimized prompt.
      `.trim(),
      userPrompt: prompt.trim(),
      model: "gpt-5-mini",
      maxOutputTokens: 2000,
    });

    return NextResponse.json({
      success: true,
      prompt: enhancedPrompt,
    });
  } catch (error) {
    console.error("Enhance prompt error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to enhance prompt.",
      },
      {
        status: 500,
      }
    );
  }
}