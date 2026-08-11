import AdminLayout from "@/components/admin/AdminLayout";
import ImageTable from "@/components/admin/ImageTable";
import { getAllImages } from "@/services/adminImageService";

export default async function AdminImagesPage() {
  const images = await getAllImages();

  return (
    <AdminLayout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-white">
            🖼 Image Management
          </h1>

          <p className="mt-3 text-slate-400">
            Manage every AI image generated on SONET AI STUDIO.
          </p>

        </div>

        <ImageTable images={images} />

      </div>

    </AdminLayout>
  );
}