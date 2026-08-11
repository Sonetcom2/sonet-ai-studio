"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Toast from "@/components/Toast";

type ImageItem = {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
};

export default function MyImagesPage() {
  const [images, setImages] = useState<ImageItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState("");

  const [toastType, setToastType] = useState<
    "success" | "error" | "info"
  >("info");

  // ===========================
  // Load Images
  // ===========================

  async function loadImages() {
    try {
      setLoading(true);

      const response = await fetch("/api/my-images");

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setImages(data.images);

    } catch (error: any) {
      console.error(error);

      setToastType("error");

      setToast(
        error.message || "Failed to load images."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  // ===========================
  // Auto Hide Toast
  // ===========================

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);

  }, [toast]);
    // ===========================
  // Download Image
  // ===========================

  async function handleDownload(imageUrl: string) {
    try {
      const response = await fetch(
        `/api/download-image?url=${encodeURIComponent(imageUrl)}`
      );

      if (!response.ok) {
        throw new Error("Download failed.");
      }

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download = `sonet-ai-${Date.now()}.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      setToastType("success");

      setToast("Image downloaded successfully!");

    } catch (error: any) {
      console.error(error);

      setToastType("error");

      setToast(
        error.message || "Download failed."
      );
    }
  }

  // ===========================
  // Delete Image
  // ===========================

  async function handleDelete(
    id: string,
    image_url: string
  ) {
    const confirmed = window.confirm(
      "Delete this image permanently?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "/api/delete-image",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            id,
            image_url,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setImages((prev) =>
        prev.filter((img) => img.id !== id)
      );

      setToastType("success");

      setToast("Image deleted successfully!");

    } catch (error: any) {
      console.error(error);

      setToastType("error");

      setToast(
        error.message || "Delete failed."
      );
    }
  }  return (
    <>
      {toast && (
        <Toast
          message={toast}
          type={toastType}
        />
      )}

      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white px-8 py-10">

        <div className="max-w-7xl mx-auto">

          <div className="mb-12">

            <h1 className="text-5xl font-black">

              🖼 My Images

            </h1>

            <p className="text-gray-400 mt-3">

              All your AI-generated images stored securely in SONET AI Studio.

            </p>

          </div>

          {loading ? (

            <div className="flex justify-center items-center h-[500px]">

              <div className="text-center">

                <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

                <p className="mt-8 text-2xl font-bold">

                  Loading Images...

                </p>

              </div>

            </div>

          ) : images.length === 0 ? (

            <div className="rounded-3xl border border-slate-700 bg-slate-900 p-16 text-center">

              <div className="text-7xl">

                🖼

              </div>

              <h2 className="text-3xl font-bold mt-6">

                No Images Yet

              </h2>

              <p className="text-gray-400 mt-4">

                Generate your first AI image to see it here.

              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

              {images.map((image) => (

                <div
                  key={image.id}
                  className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl hover:shadow-cyan-500/20 transition hover:-translate-y-1"
                >

                  <Image
                    src={image.image_url}
                    alt={image.prompt}
                    width={600}
                    height={600}
                    className="w-full h-72 object-cover"
                  />

                  <div className="p-5">

                    <p className="text-sm text-gray-300 line-clamp-3 min-h-[60px]">

                      {image.prompt}

                    </p>

                    <p className="text-xs text-gray-500 mt-3">

                      {new Date(
                        image.created_at
                      ).toLocaleString()}

                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-5">

                      <button
                        onClick={() =>
                          handleDownload(
                            image.image_url
                          )
                        }
                        className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2 font-semibold hover:scale-105 transition"
                      >

                        ⬇ Download

                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            image.id,
                            image.image_url
                          )
                        }
                        className="rounded-xl bg-red-600 hover:bg-red-700 py-2 font-semibold transition"
                      >

                        🗑 Delete

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </>
  );
}