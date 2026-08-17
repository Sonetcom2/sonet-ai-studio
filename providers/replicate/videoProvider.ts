import replicate from "@/services/replicate";

import {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "@/services/videoProvider";

function mapCameraToConcept(
  camera?: string
): string | undefined {
  if (!camera) {
    return undefined;
  }

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

function mapDuration(
  duration?: string
): number {
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

  if (style?.trim()) {
    modifiers.push(
      `Visual style: ${style.trim()}.`
    );
  }

  if (quality?.trim()) {
    modifiers.push(
      `Rendering preference: ${quality.trim()}.`
    );
  }

  if (resolution?.trim()) {
    modifiers.push(
      `Target resolution preference: ${resolution.trim()}.`
    );
  }

  const cleanPrompt = prompt.trim();

  if (modifiers.length === 0) {
    return cleanPrompt;
  }

  return `${cleanPrompt}\n\n${modifiers.join(" ")}`;
}

export class ReplicateVideoProvider
  implements VideoProvider
{
  async generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> {
    try {
      console.log(
        "========================================"
      );
      console.log(
        "REPLICATE VIDEO PROVIDER"
      );
      console.log(
        "========================================"
      );

      if (
        !options.prompt ||
        !options.prompt.trim()
      ) {
        throw new Error(
          "Video prompt is required."
        );
      }

      const duration = mapDuration(
        options.duration
      );

      const concept =
        mapCameraToConcept(
          options.camera
        );

      const finalPrompt =
        buildPrompt(
          options.prompt,
          options.style,
          options.quality,
          options.resolution
        );

      const input: Record<
        string,
        unknown
      > = {
        prompt: finalPrompt,
        duration,
        aspect_ratio:
          options.aspectRatio,
      };

      if (concept) {
        input.concepts = [concept];
      }

      console.log(
        "Replicate model:",
        "luma/ray-2-720p"
      );

      console.log(
        "Video duration:",
        duration
      );

      console.log(
        "Aspect ratio:",
        options.aspectRatio
      );

      console.log(
        "Camera concept:",
        concept || "none"
      );

      console.log(
        "Replicate input:",
        {
          ...input,
          prompt: "[REDACTED]",
        }
      );

      const output =
        await replicate.run(
          "luma/ray-2-720p",
          {
            input,
          }
        );

      console.log(
        "Replicate generation completed."
      );

      let videoUrl:
        | string
        | undefined;

      if (
        output &&
        typeof output ===
          "object" &&
        "url" in output &&
        typeof (
          output as {
            url?: unknown;
          }
        ).url === "function"
      ) {
        videoUrl = (
          output as {
            url: () => string;
          }
        ).url();
      }

      if (
        !videoUrl &&
        typeof output === "string"
      ) {
        videoUrl = output;
      }

      if (!videoUrl) {
        console.error(
          "Replicate output did not contain a usable video URL:",
          output
        );

        throw new Error(
          "Replicate completed successfully but no video URL was returned."
        );
      }

      console.log(
        "Video URL received successfully."
      );

      return {
        success: true,
        provider: "Replicate",
        status: "completed",
        jobId: crypto.randomUUID(),
        videoUrl,
        message:
          "Video generated successfully.",
      };
    } catch (error) {
      console.error(
        "Replicate video generation error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Replicate video generation failed.";

      return {
        success: false,
        provider: "Replicate",
        status: "failed",
        message,
      };
    }
  }

  async getGenerationStatus(
    jobId: string
  ): Promise<VideoGenerationResult> {
    console.log(
      "Checking video generation job:",
      jobId
    );

    return {
      success: true,
      provider: "Replicate",
      status: "processing",
      jobId,
      message:
        "Video generation is still processing.",
    };
  }
}