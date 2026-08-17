import { getOpenAI } from "@/lib/openai";

export type AITextOptions = {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxOutputTokens?: number;
};

export async function generateAIText({
  systemPrompt,
  userPrompt,
  model = "gpt-5-mini",
  maxOutputTokens = 2000,
}: AITextOptions): Promise<string> {
  const openai = getOpenAI();

  const response = await openai.responses.create({
    model,
    instructions: systemPrompt,
    input: userPrompt,
    max_output_tokens: maxOutputTokens,
  });

  const content = response.output_text?.trim();

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return content;
}