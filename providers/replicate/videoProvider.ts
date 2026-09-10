import replicate from "@/services/replicate";

import {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "@/services/videoProvider";

function mapDuration(
  duration?: string
): number {
  if (!duration) {
    return 5;
  }

  const match = duration.match(
    /(\d+)\s*sec/i
  );

  if (!match) {
    throw new Error(
      `Unsupported video duration: ${duration}.`
    );
  }

  const seconds = Number(match[1]);

  if (
    !Number.isInteger(seconds) ||
    seconds < 4 ||
    seconds > 30
  ) {
    throw new Error(
      "Seedance 2.5 supports video durations from 4 to 30 seconds."
    );
  }

  return seconds;
}

function mapResolution(
  resolution?: string
): string {
  if (!resolution) {
    return "720p";
  }

  const normalized =
    resolution.trim().toLowerCase();

  if (normalized === "720p") {
    return "720p";
  }

  if (normalized === "1080p") {
    return "1080p";
  }

  if (normalized === "2k") {
    return "2k";
  }

  if (normalized === "4k") {
    return "4k";
  }

  return "720p";
}

function mapAspectRatio(
  aspectRatio?: string
): string {
  if (!aspectRatio) {
    return "16:9";
  }

  const supportedRatios = [
    "16:9",
    "9:16",
    "1:1",
    "adaptive",
  ];

  if (
    supportedRatios.includes(
      aspectRatio
    )
  ) {
    return aspectRatio;
  }

  return "16:9";
}

function buildPrompt(
  prompt: string,
  style?: string,
  camera?: string,
  quality?: string
): string {
  const modifiers: string[] = [];

  if (style?.trim()) {
    modifiers.push(
      `Visual style: ${style.trim()}.`
    );
  }

  if (camera?.trim()) {
    modifiers.push(
      `Camera direction: ${camera.trim()}.`
    );
  }

  if (quality?.trim()) {
    modifiers.push(
      `Quality preference: ${quality.trim()}.`
    );
  }

  const cleanPrompt =
    prompt.trim();

  if (modifiers.length === 0) {
    return cleanPrompt;
  }

  return `${cleanPrompt}\n\n${modifiers.join(
    " "
  )}`;
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

      const duration =
        mapDuration(
          options.duration
        );

      const resolution =
        mapResolution(
          options.resolution
        );

      const aspectRatio =
        mapAspectRatio(
          options.aspectRatio
        );

      const finalPrompt =
        buildPrompt(
          options.prompt,
          options.style,
          options.camera,
          options.quality
        );

      const input: Record<
        string,
        unknown
      > = {
        prompt: finalPrompt,
        duration,
        resolution,
        aspect_ratio:
          aspectRatio,
        generate_audio: true,
        output_format: "mp4",
        watermark: false,
      };

      // ==========================================
      // OPTIONAL REFERENCE IMAGE
      // ==========================================

      if (
        options.referenceImage &&
        options.referenceImage.trim()
      ) {
        input.image =
          options.referenceImage;

        console.log(
          "Reference image:",
          "provided"
        );
      } else {
        console.log(
          "Reference image:",
          "not provided"
        );
      }

      console.log(
        "Replicate model:",
        "bytedance/seedance-2.5"
      );

      console.log(
        "Video duration:",
        duration
      );

      console.log(
        "Video resolution:",
        resolution
      );

      console.log(
        "Aspect ratio:",
        aspectRatio
      );

      console.log(
        "Audio generation:",
        true
      );

      console.log(
        "Output format:",
        "mp4"
      );

      console.log(
        "Replicate input:",
        {
          ...input,
          prompt: "[REDACTED]",
          image: options.referenceImage
            ? "[REFERENCE IMAGE]"
            : undefined,
        }
      );

      const output =
        await replicate.run(
          "bytedance/seedance-2.5",
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
        typeof output ===
          "string"
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