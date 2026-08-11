export type VideoGenerationRequest = {
  prompt: string;

  style: string;

  camera: string;

  duration: string;

  aspectRatio: string;

  resolution: string;

  quality: string;

  referenceImage?: string;

  referenceVideo?: string;
};

export type VideoGenerationResponse = {
  success: boolean;

  message: string;

  videoUrl?: string;

  creditsRemaining?: number;
};