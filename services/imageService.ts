import openai from "@/lib/openai";

type GenerateImageOptions = {
  prompt: string;
  model?: string;
  quality?: "low" | "medium" | "high" | "auto";
  style?: string;
  aspectRatio?: string;

  // Optional reference image.
  // This should be a data URL such as:
  // data:image/png;base64,...
  referenceImage?: string | null;
};

export async function generateImage({
  prompt,
  model = "gpt-image-1",
  quality = "high",
  style = "auto",
  aspectRatio = "1:1",
  referenceImage = null,
}: GenerateImageOptions) {
  console.time("image-generation");

  try {
    console.log("Generating image...");

    const enhancedPrompt = `
${prompt}

Style: ${style}
Aspect Ratio: ${aspectRatio}

${
  referenceImage
    ? "Use the provided reference image as visual guidance. Preserve important characteristics from the reference unless the prompt specifically requests changes."
    : ""
}
`.trim();

    /*
     * TEXT-ONLY GENERATION
     *
     * Keep the existing working path when no reference
     * image has been provided.
     */
    if (!referenceImage) {
      const result = await openai.images.generate({
        model,
        prompt: enhancedPrompt,
        quality,
        size: "auto",
      });

      const base64 = result.data?.[0]?.b64_json;

      if (!base64) {
        throw new Error("OpenAI returned no image.");
      }

      console.timeEnd("image-generation");

      return `data:image/png;base64,${base64}`;
    }

    /*
     * REFERENCE IMAGE GENERATION
     *
     * Convert the data URL into a File so it can be
     * supplied to the OpenAI image editing endpoint.
     */
    const matches = referenceImage.match(
      /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
    );

    if (!matches) {
      throw new Error("Invalid reference image format.");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const imageBuffer = Buffer.from(base64Data, "base64");

    const referenceFile = new File(
      [imageBuffer],
      "reference-image.png",
      {
        type: mimeType,
      }
    );

    const result = await openai.images.edit({
      model,
      image: referenceFile,
      prompt: enhancedPrompt,
      quality,
      size: "auto",
    });

    const base64 = result.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error(
        "OpenAI returned no image from the reference image."
      );
    }

    console.timeEnd("image-generation");

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.timeEnd("image-generation");

    console.error(
      "Image generation error:",
      error
    );

    throw error;
  }
}