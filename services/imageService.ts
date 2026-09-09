import { getOpenAI } from "@/lib/openai";

type GenerateImageOptions = {
  prompt: string;
  model?: string;
  quality?: "low" | "medium" | "high" | "auto";
  style?: string;
  aspectRatio?: string;
  referenceImage?: string | null;
};

export async function generateImage({
  prompt,
  model = "gpt-image-2",
  quality = "medium",
  style = "auto",
  aspectRatio = "1:1",
  referenceImage = null,
}: GenerateImageOptions) {
  console.time("image-generation");

  try {
    console.log("========================================");
    console.log("SONET AI IMAGE GENERATION");
    console.log("========================================");
    console.log("Model:", model);
    console.log("Quality:", quality);
    console.log("Reference:", Boolean(referenceImage));

    const openai = getOpenAI();

    // ==========================================
    // PROMPT
    // ==========================================

    const enhancedPrompt = `
${prompt}

${referenceImage ? `
IMPORTANT REFERENCE IMAGE INSTRUCTIONS:

The uploaded reference photo contains the person who must appear
in the generated image.

Preserve the SAME PERSON and their recognizable identity.

Preserve:
- facial structure
- face shape
- eyes and eye spacing
- eyebrows
- nose
- lips and mouth
- jawline
- cheeks
- chin
- forehead
- skin tone
- hairline
- hairstyle
- distinctive facial characteristics

Do not create a different person.
Do not replace the face with a generic AI face.
Do not redesign the person's facial structure.
Do not unnecessarily beautify or alter the person's identity.

Change only what the user's prompt requests, such as:
- clothing
- background
- environment
- lighting
- pose
- composition
- photography style

The person's identity must remain consistent with the reference photo.
` : ""}

Visual style: ${style}
Requested aspect ratio: ${aspectRatio}
`.trim();

    // ==========================================
    // TEXT-ONLY GENERATION
    // ==========================================

    if (!referenceImage) {
      console.log("TEXT-ONLY GENERATION");

      const result = await openai.images.generate({
        model,
        prompt: enhancedPrompt,
        quality,
        size: "1024x1024",
      });

      const base64 = result.data?.[0]?.b64_json;

      if (!base64) {
        throw new Error("OpenAI returned no image.");
      }

      console.log("TEXT IMAGE SUCCESS");
      console.timeEnd("image-generation");

      return `data:image/png;base64,${base64}`;
    }

    // ==========================================
    // REFERENCE IMAGE
    // ==========================================

    console.log("REFERENCE IMAGE GENERATION");

    const matches = referenceImage.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (!matches) {
      throw new Error("Invalid reference image format.");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    if (!mimeType || !base64Data) {
      throw new Error("Reference image data is incomplete.");
    }

    const imageBuffer = Buffer.from(base64Data, "base64");

    if (!imageBuffer.length) {
      throw new Error("Reference image is empty.");
    }

    console.log("Reference MIME:", mimeType);
    console.log("Reference size:", imageBuffer.length, "bytes");

    const extension =
      mimeType === "image/jpeg"
        ? "jpg"
        : mimeType === "image/webp"
          ? "webp"
          : "png";

    const referenceFile = new File(
      [imageBuffer],
      `reference-image.${extension}`,
      {
        type: mimeType,
      }
    );

    // ==========================================
    // OPENAI IMAGE EDIT
    // ==========================================

    console.log("Calling GPT-Image-2 edit...");
    console.time("openai-image-edit");

    const result = await openai.images.edit({
      model: "gpt-image-2",
      image: referenceFile,
      prompt: enhancedPrompt,
      quality,
      size: "1024x1024",
    });

    console.timeEnd("openai-image-edit");

    // ==========================================
    // RESULT
    // ==========================================

    const base64 = result.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error(
        "OpenAI returned no image from the reference image."
      );
    }

    console.log("REFERENCE IMAGE SUCCESS");
    console.timeEnd("image-generation");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.timeEnd("image-generation");

    console.error("========================================");
    console.error("SONET AI IMAGE ERROR");
    console.error("========================================");
    console.error(error);

    throw error;
  }
}