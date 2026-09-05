import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSettings } from "@/services/settingsService";
import { generateVoice } from "@/services/voiceService";

const MAX_TEXT_LENGTH = 5000;

const ALLOWED_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
];

const ALLOWED_FORMATS = [
  "mp3",
  "opus",
  "aac",
  "flac",
  "wav",
  "pcm",
] as const;

type AudioFormat = (typeof ALLOWED_FORMATS)[number];

export async function POST(req: Request) {
  let userId: string | null = null;
  let originalCredits: number | null = null;

  try {
    console.log("========================================");
    console.log("GENERATE VOICE API START");
    console.log("========================================");

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
        {
          status: 401,
        }
      );
    }

    userId = user.id;

    // ==========================================
    // 2. GET ADMIN SETTINGS
    // ==========================================

    const settings = await getSettings();

    const voiceGenerationCost = Number(
      settings.voice_generation_cost
    );

    if (
      !Number.isFinite(voiceGenerationCost) ||
      voiceGenerationCost <= 0
    ) {
      throw new Error(
        "Invalid voice generation cost configured."
      );
    }

    console.log(
      "Voice generation cost:",
      voiceGenerationCost
    );

    // ==========================================
    // 3. READ REQUEST
    // ==========================================

    const body = await req.json();

    const text = String(body.text ?? "").trim();

    const voice = String(
      body.voice ?? "alloy"
    ).trim();

    const instructions = String(
      body.instructions ?? ""
    ).trim();

    const format = String(
      body.format ?? "mp3"
    ).trim() as AudioFormat;

    // ==========================================
    // 4. VALIDATE TEXT
    // ==========================================

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Text is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 5. VALIDATE VOICE
    // ==========================================

    if (!ALLOWED_VOICES.includes(voice)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid voice selected.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 6. VALIDATE FORMAT
    // ==========================================

    if (!ALLOWED_FORMATS.includes(format)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid audio format.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 7. GET USER CREDITS
    // ==========================================

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error(
        "Profile error:",
        profileError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const currentCredits = Number(
      profile.credits ?? 0
    );

    originalCredits = currentCredits;

    // ==========================================
    // 8. CHECK CREDITS
    // ==========================================

    if (currentCredits < voiceGenerationCost) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You don't have enough credits to generate a voice.",
          creditsRemaining: currentCredits,
          creditsRequired: voiceGenerationCost,
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 9. DEDUCT CREDITS
    // ==========================================

    const newCredits =
      currentCredits - voiceGenerationCost;

    const {
      error: deductError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        credits: newCredits,
      })
      .eq("id", user.id);

    if (deductError) {
      console.error(
        "Credit deduction error:",
        deductError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to deduct credits.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      `Credits deducted: ${voiceGenerationCost}`
    );

    console.log(
      `Remaining credits: ${newCredits}`
    );

    // ==========================================
    // 10. GENERATE VOICE
    // ==========================================

    console.log("Generating AI voice...");

    const audioBuffer = await generateVoice({
      text,
      voice,
      instructions: instructions || undefined,
      format,
    });

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error(
        "Voice generation returned no audio."
      );
    }

    // ==========================================
    // 11. RETURN AUDIO
    // ==========================================

    const mimeTypes: Record<AudioFormat, string> = {
      mp3: "audio/mpeg",
      opus: "audio/ogg",
      aac: "audio/aac",
      flac: "audio/flac",
      wav: "audio/wav",
      pcm: "audio/pcm",
    };

    const mimeType = mimeTypes[format];

    console.log(
      "Voice generated successfully."
    );

    console.log("========================================");
    console.log("GENERATE VOICE API SUCCESS");
    console.log("========================================");

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Length": String(
          audioBuffer.length
        ),
        "Cache-Control": "private, no-store",
        "X-Credits-Used": String(
          voiceGenerationCost
        ),
        "X-Credits-Remaining": String(
          newCredits
        ),
      },
    });
  } catch (error) {
    console.error(
      "Generate Voice Error:",
      error
    );

    // ==========================================
    // ROLLBACK CREDITS
    // ==========================================

    if (
      userId &&
      originalCredits !== null
    ) {
      console.log(
        "Rolling back voice generation credits..."
      );

      const {
        error: rollbackError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          credits: originalCredits,
        })
        .eq("id", userId);

      if (rollbackError) {
        console.error(
          "Credit rollback error:",
          rollbackError
        );
      } else {
        console.log(
          "Voice generation credits successfully rolled back."
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate voice.",
      },
      {
        status: 500,
      }
    );
  }
}