"use client";

export default function VideoPreview({
  thumbnail,
}: {
  thumbnail: string;
}) {
  return (
    <div className="relative">

      <img
        src={thumbnail}
        alt="Video Thumbnail"
        className="h-56 w-full object-cover"
      />

      <div className="absolute inset-0 flex items-center justify-center">

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">

          <span className="text-4xl">
            ▶
          </span>

        </div>

      </div>

    </div>
  );
}