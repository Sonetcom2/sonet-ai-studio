
import { getOpenAI } from "@/lib/openai";
import type { ResponseInput } from "openai/resources/responses/responses";

export type AITextContent =
  | {
      type: "input_text";
      text: string;
    }
  | {
      type: "input_image";
      image_url: string;
      detail: "auto" | "high" | "low" | "original";
    }
  | {
      type: "input_file";
      file_id: string;
    };

export type AIInput =
  | string
  | ResponseInput;

export type AITextOptions = {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  maxOutputTokens?: number;
  input?: AIInput;
};

export async function generateAIText({
  systemPrompt,
  userPrompt,
  model = "gpt-5-mini",
  maxOutputTokens = 2000,
  input,
}: AITextOptions): Promise<string> {
  const openai = getOpenAI();

  const responseInput: AIInput =
    input ?? userPrompt;

  const response = await openai.responses.create({
    model,
    instructions: systemPrompt,
    input: responseInput,
    max_output_tokens: maxOutputTokens,
  });

  const content = response.output_text?.trim();

  if (!content) {
    throw new Error(
      "OpenAI returned an empty response."
    );
  }

  return content;
}