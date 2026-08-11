import replicate from "@/services/replicate";

import {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "@/services/videoProvider";

export class ReplicateVideoProvider implements VideoProvider {

  async generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> {

    try {

      console.log("━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 REPLICATE");
      console.log("━━━━━━━━━━━━━━━━━━━━");

      const output = await replicate.run(
        "luma/ray-2-720p",
        {
          input: {
            prompt: options.prompt,
          },
        }
      );

      console.log("REPLICATE OUTPUT");
      console.log(output);

      let videoUrl: string | null = null;

      if (
        output &&
        typeof output === "object" &&
        "url" in output &&
        typeof (output as any).url === "function"
      ) {
        videoUrl = (output as any).url();
      }

      return {

        success: true,

        provider: "Replicate",

        status: "completed",

        jobId: crypto.randomUUID(),

        videoUrl: videoUrl ?? undefined,

        message: "Video generated successfully.",

      };

    } catch (error) {

      console.error("REPLICATE ERROR");
      console.error(error);

      return {

        success: false,

        provider: "Replicate",

        status: "failed",

        message: "Replicate generation failed.",

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