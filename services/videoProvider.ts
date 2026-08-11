export type VideoGenerationOptions = {
  prompt: string;
  style: string;
  camera: string;
  duration: string;
  aspectRatio: string;
  resolution: string;
  quality: string;
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