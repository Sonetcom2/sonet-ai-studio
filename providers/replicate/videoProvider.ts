import Replicate from "replicate";

export interface VideoGenerationOptions {
  prompt: string;
  style?: string;
  camera?: string;
  duration?: string;
  aspectRatio?: string;
  resolution?: string;
  quality?: string;
  referenceImage?: string;
}

export interface VideoGenerationResult {
  success: boolean;
  provider?: string;
  status?: string;
  jobId?: string;
  videoUrl?: string;
  message?: string;
  error?: string;
}

export class ReplicateVideoProvider {
  private replicate: Replicate;

  constructor() {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not configured");
    }

    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  /**
   * Seedance 2.0 Mini:
   * - Duration: 5–15 seconds
   * - Resolution: 480p / 720p
   */
  private mapDuration(duration?: string): number {
    if (!duration) {
      return 5;
    }

    const match = duration.match(/(\d+)\s*sec/i);

    if (!match) {
      return 5;
    }

    const seconds = Number(match[1]);

    if (!Number.isFinite(seconds)) {
      return 5;
    }

    if (seconds < 5 || seconds > 15) {
      throw new Error(
        "Seedance 2.0 Mini supports video durations from 5 to 15 seconds."
      );
    }

    return seconds;
  }

  /**
   * Seedance 2.0 Mini supports only 480p and 720p.
   */
  private mapResolution(resolution?: string): string {
    if (!resolution) {
      return "720p";
    }

    const value = resolution.toLowerCase().trim();

    if (value === "480p") {
      return "480p";
    }

    if (value === "720p") {
      return "720p";
    }

    throw new Error(
      "Seedance 2.0 Mini supports only 480p and 720p resolution."
    );
  }

  /**
   * Supported Seedance 2.0 Mini aspect ratios.
   */
  private mapAspectRatio(aspectRatio?: string): string {
    if (!aspectRatio) {
      return "16:9";
    }

    const value = aspectRatio.toLowerCase().trim();

    const supportedRatios = [
      "16:9",
      "4:3",
      "1:1",
      "3:4",
      "9:16",
      "21:9",
      "adaptive",
    ];

    if (supportedRatios.includes(value)) {
      return value;
    }

    return "16:9";
  }

  /**
   * Build the final video prompt.
   */
  private buildPrompt(
    prompt: string,
    style?: string,
    camera?: string,
    quality?: string,
    hasReferenceImage?: boolean
  ): string {
    const parts: string[] = [];

    if (prompt?.trim()) {
      parts.push(prompt.trim());
    }

    if (style?.trim()) {
      parts.push(`Visual style: ${style.trim()}`);
    }

    if (camera?.trim()) {
      parts.push(`Camera: ${camera.trim()}`);
    }

    if (quality?.trim()) {
      parts.push(`Quality: ${quality.trim()}`);
    }

    if (hasReferenceImage) {
      parts.push(
        "Use [Image1] as the visual reference. Preserve the subject's identity, appearance, facial features, clothing and overall visual characteristics unless the prompt explicitly requests a change."
      );
    }

    return parts.join("\n\n");
  }

  /**
   * Generate a video with Seedance 2.0 Mini.
   */
  async generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> {
    try {
      const duration = this.mapDuration(options.duration);
      const resolution = this.mapResolution(options.resolution);
      const aspectRatio = this.mapAspectRatio(options.aspectRatio);

      const hasReferenceImage =
        typeof options.referenceImage === "string" &&
        options.referenceImage.trim().length > 0;

      const finalPrompt = this.buildPrompt(
        options.prompt,
        options.style,
        options.camera,
        options.quality,
        hasReferenceImage
      );

      if (!finalPrompt.trim()) {
        throw new Error("Video prompt is required.");
      }

      /**
       * Seedance 2.0 Mini input.
       */
      const input: Record<string, unknown> = {
        prompt: finalPrompt,
        duration,
        resolution,
        aspect_ratio: aspectRatio,
        generate_audio: true,
      };

      /**
       * Reference image.
       */
      if (hasReferenceImage) {
        input.reference_images = [options.referenceImage];
      }

      console.log(
        "[SONET VIDEO] Starting Seedance 2.0 Mini generation"
      );

      console.log("[SONET VIDEO] Input:", {
        model: "bytedance/seedance-2.0-mini",
        duration,
        resolution,
        aspectRatio,
        hasReferenceImage,
        generateAudio: true,
      });

      const output = await this.replicate.run(
        "bytedance/seedance-2.0-mini",
        {
          input,
        }
      );

      console.log("[SONET VIDEO] Replicate output received");

      let videoUrl: string | undefined;

      /**
       * Handle Replicate output formats.
       */
      if (typeof output === "string") {
        videoUrl = output;
      } else if (
        output &&
        typeof output === "object" &&
        "url" in output &&
        typeof (output as { url?: unknown }).url === "function"
      ) {
        videoUrl = String(
          (output as { url: () => unknown }).url()
        );
      } else if (
        output &&
        typeof output === "object" &&
        "url" in output &&
        typeof (output as { url?: unknown }).url === "string"
      ) {
        videoUrl = String(
          (output as { url: string }).url
        );
      }

      if (!videoUrl) {
        console.error(
          "[SONET VIDEO] Could not extract video URL:",
          output
        );

        throw new Error(
          "Video generation completed but no video URL was returned."
        );
      }

      /**
       * Replicate output does not expose a separate job ID here,
       * so use the generated video URL as the available identifier.
       */
      const jobId = videoUrl;

      console.log(
        "[SONET VIDEO] Video generated successfully"
      );

      return {
        success: true,
        provider: "replicate",
        status: "succeeded",
        jobId,
        videoUrl,
        message: "Video generated successfully.",
      };
    } catch (error) {
      console.error(
        "[SONET VIDEO] Generation failed:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Video generation failed.";

      return {
        success: false,
        provider: "replicate",
        status: "failed",
        jobId: undefined,
        message: errorMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Placeholder for future asynchronous generation support.
   */
  async getGenerationStatus(predictionId: string) {
    return {
      id: predictionId,
      status: "processing",
    };
  }
}