import replicate from "@/services/replicate";

import {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "@/services/videoProvider";

function mapCameraToConcept(camera: string): string | undefined {
  const cameraMap: Record<string, string> = {
    Static: "static",
    "Pan Left": "pan_left",
    "Pan Right": "pan_right",
    "Zoom In": "zoom_in",
    "Zoom Out": "zoom_out",
    Drone: "aerial_drone",
    "Tracking Shot": "truck_right",
  };

  return cameraMap[camera];
}

function mapDuration(duration: string): number {
  if (duration === "5 sec") {
    return 5;
  }

  if (duration === "9 sec") {
    return 9;
  }

  throw new Error(
    `Unsupported Ray 2 duration: ${duration}. Supported durations are 5 sec and 9 sec.`
  );
}

function buildPrompt(
  prompt: string,
  style?: string,
  quality?: string,
  resolution?: string
): string {
  const modifiers: string[] = [];

  if (style) {
    modifiers.push(`Visual style: ${style}.`);
  }

  if (quality) {
    modifiers.push(`Rendering preference: ${quality}.`);
  }

  if (resolution) {
    modifiers.push(`Target resolution preference: ${resolution}.`);
  }

  if (modifiers.length === 0) {
    return prompt.trim();
  }

  return `${prompt.trim()}\n\n${modifiers.join(" ")}`;
}

export class ReplicateVideoProvider implements VideoProvider {
  async generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> {
    try {
      console.log("━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 REPLICATE VIDEO");
      console.log("━━━━━━━━━━━━━━━━━━━━");

      const duration = mapDuration(options.duration);

      const concept = mapCameraToConcept(options.camera);

      const finalPrompt = buildPrompt(
        options.prompt,
        options.style,
        options.quality,
        options.resolution
      );

      const input: Record<string, unknown> = {
        prompt: finalPrompt,
        duration,
        aspect_ratio: options.aspectRatio,
      };

      if (concept) {
        input.concepts = [concept];
      }

      console.log("🎬 Replicate input:", {
        ...input,
        prompt: "[REDACTED]",
      });

      const output = await replicate.run(
        "luma/ray-2-720p",
        {
          input,
        }
      );

      console.log("🎬 Replicate generation completed.");

      let videoUrl: string | undefined;

      if (
        output &&
        typeof output === "object" &&
        "url" in output &&
        typeof (output as { url?: unknown }).url === "function"
      ) {
        videoUrl = (
          output as {
            url: () => string;
          }
        ).url();
      }

      if (!videoUrl) {
        throw new Error(
          "Replicate completed successfully but no video URL was returned."
        );
      }

      console.log("🎬 Video URL received.");

      return {
        success: true,
        provider: "Replicate",
        status: "completed",
        jobId: crypto.randomUUID(),
        videoUrl,
        message: "Video generated successfully.",
      };
    } catch (error) {
      console.error("❌ REPLICATE VIDEO ERROR");
      console.error(error);

      return {
        success: false,
        provider: "Replicate",
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Replicate video generation failed.",
      };
    }
  }

  async getGenerationStatus(
    jobId: string
  ): Promise<VideoGenerationResult> {
    return {
      success: true,
      provider: "Replicate",
      status: "completed",
      jobId,
    };
  }
}