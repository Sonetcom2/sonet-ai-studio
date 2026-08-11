import fal from "@/services/fal";
import {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "@/services/videoProvider";

export class FalVideoProvider implements VideoProvider {

  async generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> {

    try {

      console.log("━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 FAL AI");
      console.log("━━━━━━━━━━━━━━━━━━━━");

      const result = await fal.subscribe(
        "fal-ai/ltx-video-v095/text-to-video",
        {
          input: {
            prompt: options.prompt,
          },
        }
      );

      console.log(result);

      return {
        success: true,
        provider: "Fal AI",
        status: "completed",
        videoUrl: result.data.video.url,
        thumbnailUrl: result.data.video.url,
        message: "Video generated successfully.",
      };

    } catch (error) {

      console.error(error);

      return {
        success: false,
        provider: "Fal AI",
        status: "failed",
        message: "Fal AI generation failed.",
      };

    }

  }

  async getGenerationStatus(): Promise<VideoGenerationResult> {

    return {
      success: true,
      provider: "Fal AI",
      status: "completed",
    };

  }

}