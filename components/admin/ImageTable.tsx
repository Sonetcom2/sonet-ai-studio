"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ImagePreviewModal from "./ImagePreviewModal";
import DeleteImageModal from "./DeleteImageModal";
import { deleteImage } from "@/services/adminDeleteImageService";

type ImageItem = {
  id: string;
  image_url: string | null;
  prompt: string;
  user_id: string;
  created_at: string;
};

type Props = {
  images: ImageItem[];
};

export default function ImageTable({ images }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<ImageItem | null>(null);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [imageToDelete, setImageToDelete] =
    useState<ImageItem | null>(null);

  const filteredImages = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return images;

    return images.filter((image) => {
      return (
        image.prompt.toLowerCase().includes(term) ||
        image.user_id.toLowerCase().includes(term) ||
        image.id.toLowerCase().includes(term)
      );
    });
  }, [images, search]);

  async function handleDelete() {
    if (!imageToDelete) return;

    try {
      await deleteImage(imageToDelete.id);

      setDeleteOpen(false);
      setImageToDelete(null);

      alert("✅ Image deleted successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);

      alert("❌ Failed to delete image.");
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900">

      {/* Search */}

      <div className="border-b border-slate-700 p-6">

        <input
          type="text"
          placeholder="🔍 Search by prompt, user or image ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-600 bg-slate-800 px-5 py-3 text-white outline-none focus:border-cyan-500"
        />

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr className="text-left text-slate-300">

              <th className="p-5">Image</th>
              <th className="p-5">Prompt</th>
              <th className="p-5">User</th>
              <th className="p-5">Created</th>
              <th className="p-5">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredImages.length === 0 ? (

              <tr>

                <td
                  colSpan={5}
                  className="p-16 text-center text-slate-400"
                >
                  No matching images found.
                </td>

              </tr>

            ) : (

              filteredImages.map((image) => (

                <tr
                  key={image.id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >

                  <td className="p-5">

                    {image.image_url ? (

                      <img
                        src={image.image_url}
                        alt="Generated"
                        className="h-20 w-20 rounded-xl object-cover"
                      />

                    ) : (

                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-800 text-3xl">
                        🖼
                      </div>

                    )}

                  </td>

                  <td className="max-w-sm p-5 text-white">

                    {image.prompt.length > 80
                      ? `${image.prompt.slice(0, 80)}...`
                      : image.prompt}

                  </td>

                  <td className="p-5 text-slate-300">

                    {image.user_id.slice(0, 8)}...

                  </td>

                  <td className="p-5 text-slate-300">

                    {new Date(image.created_at).toLocaleDateString()}

                  </td>

                  <td className="p-5">

                    <div className="flex gap-3">

                      <button
                        onClick={() => setSelectedImage(image)}
                        className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
                      >
                        👁 View
                      </button>

                      <button
                        onClick={() => {
                          setImageToDelete(image);
                          setDeleteOpen(true);
                        }}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      <ImagePreviewModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      <DeleteImageModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={handleDelete}
      />

    </div>
  );
}