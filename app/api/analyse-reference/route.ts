import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI } from "@/lib/openai";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
];

export async function POST(req: Request) {
  try {
    // ==========================================
    // 1. AUTHENTICATE USER
    // ==========================================

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please login first.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // 2. READ FORM DATA
    // ==========================================

    const formData = await req.formData();

    const file = formData.get("reference");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a reference photo.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 3. VALIDATE FILE TYPE
    // ==========================================

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported image format. Please use PNG, JPG, JPEG, or WEBP.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 4. VALIDATE FILE SIZE
    // ==========================================

    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Reference image is too large. Maximum size is 10 MB.",
        },
        { status: 400 }
      );
    }

    console.log("📷 Reference analysis started");
    console.log("User:", user.id);
    console.log("File:", file.name);
    console.log("Type:", file.type);
    console.log("Size:", file.size);

    // ==========================================
    // 5. CONVERT IMAGE TO DATA URL
    // ==========================================

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString("base64");

    const imageDataUrl =
      `data:${file.type};base64,${base64}`;

    // ==========================================
    // 6. INITIALISE OPENAI
    // ==========================================

    const openai = getOpenAI();

    // ==========================================
    // 7. ANALYSE REFERENCE IMAGE
    // ==========================================

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",

      input: [
        {
          role: "user",

          content: [
            {
              type: "input_text",

              text: `
Analyse this reference image and create a detailed,
production-ready AI image-generation prompt based ONLY
on what can reasonably be observed.

Describe:

- Main subject
- Appearance
- Clothing
- Accessories
- Hairstyle
- Pose
- Facial expression
- Body positioning
- Background
- Environment
- Composition
- Camera angle
- Framing
- Lighting
- Colours
- Photography style
- Depth of field
- Important visible details

The result must be a single polished generation prompt.

Do not mention that you are analysing an image.

Do not invent details that cannot reasonably be observed.

Do not identify or name a real person.

Do not include analysis, explanations, bullet points,
confidence scores, or commentary.

Return ONLY the final generation prompt.
              `.trim(),
            },

            {
              type: "input_image",
              image_url: imageDataUrl,
              detail: "high",
            },
          ],
        },
      ],
    });

    // ==========================================
    // 8. EXTRACT GENERATED PROMPT
    // ==========================================

    const generatedPrompt =
      response.output_text?.trim();

    if (!generatedPrompt) {
      throw new Error(
        "The AI did not return a generated prompt."
      );
    }

    console.log(
      "✅ Reference prompt generated successfully"
    );

    // ==========================================
    // 9. RETURN RESULT
    // ==========================================

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      mediaType: "image",
    });
  } catch (error: any) {
    console.error(
      "🔥 Reference analysis error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unable to analyse the reference image.",
      },
      { status: 500 }
    );
  }
}