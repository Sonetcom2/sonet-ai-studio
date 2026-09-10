export type VideoGenerationOptions = {
  prompt: string;
  style: string;
  camera: string;
  duration: string;
  aspectRatio: string;
  resolution: string;
  quality: string;

  // Optional reference image URL.
  // This will be passed to the video provider
  // after the API uploads the user's image.
  referenceImage?: string;
};

export type VideoGenerationResult = {
  success: boolean;
  jobId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  provider: string;
  status: "processing" | "completed" | "failed";
  message?: string;
};

export interface VideoProvider {
  generateVideo(
    options: VideoGenerationOptions
  ): Promise<VideoGenerationResult>;

  getGenerationStatus(
    jobId: string
  ): Promise<VideoGenerationResult>;
}