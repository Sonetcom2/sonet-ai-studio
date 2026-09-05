import { getOpenAI } from "@/lib/openai";

export type GenerateVoiceOptions = {
  text: string;
  voice?: string;
  instructions?: string;
  format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
};

const DEFAULT_MODEL = "gpt-4o-mini-tts";
const DEFAULT_VOICE = "alloy";

export async function generateVoice({
  text,
  voice = DEFAULT_VOICE,
  instructions,
  format = "mp3",
}: GenerateVoiceOptions): Promise<Buffer> {
  console.time("voice-generation");

  try {
    if (!text.trim()) {
      throw new Error("Text is required.");
    }

    const openai = getOpenAI();

    console.log("Generating AI voice...");
    console.log("Voice:", voice);
    console.log("Format:", format);

    const speech = await openai.audio.speech.create({
      model: DEFAULT_MODEL,
      voice,
      input: text.trim(),
      ...(instructions?.trim()
        ? {
            instructions: instructions.trim(),
          }
        : {}),
      response_format: format,
    });

    const arrayBuffer = await speech.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("OpenAI returned empty audio.");
    }

    console.timeEnd("voice-generation");

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.timeEnd("voice-generation");

    console.error(
      "Voice generation error:",
      error
    );

    throw error;
  }
}