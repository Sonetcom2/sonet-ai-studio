import {
  VideoGenerationOptions,
  VideoGenerationResult,
  VideoProvider,
} from "@/services/videoProvider";

export class KlingVideoProvider implements VideoProvider {

  async generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult> {

    try {

      console.log("━━━━━━━━━━━━━━━━━━━━");
      console.log("🚀 KLING DEBUG");
      console.log("━━━━━━━━━━━━━━━━━━━━");

      console.log("API BASE:", process.env.KLING_API_BASE_URL);

      console.log(
        "API KEY PREFIX:",
        process.env.KLING_API_KEY?.substring(0, 8)
      );

      console.log("REQUEST BODY:");

      console.log({
        prompt: options.prompt,
        settings: {
          duration:
            Number(options.duration.replace(/\D/g, "")) || 5,
          resolution:
            options.resolution.toLowerCase(),
          aspect_ratio:
            options.aspectRatio,
        },
      });

      const response = await fetch(
        `${process.env.KLING_API_BASE_URL}/text-to-video/kling-3.0-turbo`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${process.env.KLING_API_KEY}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            prompt: options.prompt,

            settings: {

              duration:
                Number(options.duration.replace(/\D/g, "")) || 5,

              resolution:
                options.resolution.toLowerCase(),

              aspect_ratio:
                options.aspectRatio,

            },

            options: {

              watermark_info: {
                enabled: false,
              },

            },

          }),

        }
      );

      const rawResponse = await response.text();

      console.log("━━━━━━━━━━━━━━━━━━━━");
      console.log("KLING RESPONSE");
      console.log("━━━━━━━━━━━━━━━━━━━━");

      console.log("STATUS:", response.status);

      console.log(rawResponse);

      const data = JSON.parse(rawResponse);

      if (!response.ok) {

        return {

          success: false,

          provider: "Kling AI",

          status: "failed",

          message:
            data.message ||
            "Unable to create Kling task.",

        };

      }

      return {

        success: true,

        provider: "Kling AI",

        status:
          data.data?.task?.status ||
          "processing",

        jobId:
          data.data?.task?.id,

        message:
          "Video generation submitted successfully.",

      };

    } catch (error) {

      console.error("KLING ERROR:", error);

      return {

        success: false,

        provider: "Kling AI",

        status: "failed",

        message:
          "Unable to connect to Kling AI.",

      };

    }

  }

  async getGenerationStatus(
    jobId: string
  ): Promise<VideoGenerationResult> {

    return {

      success: true,

      provider: "Kling AI",

      status: "processing",

      jobId,

    };

  }

}