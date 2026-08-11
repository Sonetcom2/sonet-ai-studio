import {
  VideoGenerationRequest,
  VideoGenerationResponse,
} from "@/types/video";

import { OpenAIVideoProvider } from "@/providers/openai/videoProvider";

const provider = new OpenAIVideoProvider();

export async function generateVideo(
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  try {
    const result = await provider.generateVideo({
      prompt: request.prompt,
      style: request.style,
      camera: request.camera,
      duration: request.duration,
      aspectRatio: request.aspectRatio,
      resolution: request.resolution,
      quality: request.quality,
    });

    return {
      success: result.success,
      message: result.message || "Video generation started.",
      videoUrl: result.videoUrl || "",
      creditsRemaining: 0,
    };

  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Video generation failed.",
    };
  }
}