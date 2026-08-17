"use client";

import { useEffect, useMemo, useState } from "react";

import LibraryCard from "./LibraryCard";
import LibraryToolbar from "./LibraryToolbar";
import ImagePreviewModal from "./ImagePreviewModal";

type ImageItem = {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
};

export default function LibraryGrid() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] =
    useState<ImageItem | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    loadImages();
  }, []);

  async function loadImages() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/my-images",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load images."
        );
      }

      setImages(data.images || []);
    } catch (error) {
      console.error("Load images error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(
    image: ImageItem
  ) {
    try {
      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(
          image.image_url
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download image."
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `sonet-ai-${image.id}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download image error:",
        error
      );

      alert("Unable to download image.");
    }
  }

  async function deleteImage(
    image: ImageItem
  ) {
    const confirmed = window.confirm(
      "Delete this image permanently?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/delete-image",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: image.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to delete image."
        );
      }

      setImages((current) =>
        current.filter(
          (item) => item.id !== image.id
        )
      );

      if (
        selectedImage?.id === image.id
      ) {
        setSelectedImage(null);
      }

      alert("Image deleted successfully.");
    } catch (error) {
      console.error(
        "Delete image error:",
        error
      );

      alert("Unable to delete image.");
    }
  }

  const filteredImages = useMemo(() => {
    let list = [...images];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      list = list.filter((item) =>
        item.prompt
          ?.toLowerCase()
          .includes(searchValue)
      );
    }

    switch (sort) {
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(
              a.created_at
            ).getTime() -
            new Date(
              b.created_at
            ).getTime()
        );
        break;

      case "az":
        list.sort((a, b) =>
          (a.prompt || "").localeCompare(
            b.prompt || ""
          )
        );
        break;

      case "za":
        list.sort((a, b) =>
          (b.prompt || "").localeCompare(
            a.prompt || ""
          )
        );
        break;

      default:
        list.sort(
          (a, b) =>
            new Date(
              b.created_at
            ).getTime() -
            new Date(
              a.created_at
            ).getTime()
        );
    }

    return list;
  }, [images, search, sort]);

  if (loading) {
    return (
      <div className="flex h-72 flex-col items-center justify-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-600 border-t-purple-500" />

        <p className="text-lg text-white">
          Loading your library...
        </p>
      </div>
    );
  }

  return (
    <>
      <LibraryToolbar
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
      />

      {filteredImages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 p-16 text-center">
          <div className="text-7xl">
            🖼️
          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            No Images Found
          </h2>

          <p className="mt-3 text-slate-400">
            {images.length === 0
              ? "Generate your first AI image to see it here."
              : "Try another search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map(
            (image) => (
              <LibraryCard
                key={image.id}
                id={image.id}
                imageUrl={image.image_url}
                prompt={image.prompt}
                createdAt={
                  image.created_at
                }
                onPreview={() =>
                  setSelectedImage(image)
                }
                onDownload={() =>
                  downloadImage(image)
                }
                onDelete={() =>
                  deleteImage(image)
                }
              />
            )
          )}
        </div>
      )}

      {selectedImage && (
        <ImagePreviewModal
          open={true}
          imageUrl={
            selectedImage.image_url
          }
          prompt={selectedImage.prompt}
          createdAt={
            selectedImage.created_at
          }
          onClose={() =>
            setSelectedImage(null)
          }
        />
      )}
    </>
  );
}