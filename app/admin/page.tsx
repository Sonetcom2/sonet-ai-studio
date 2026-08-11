import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminImagesPage() {
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

        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-16 text-center">

          <div className="text-7xl">
            🖼
          </div>

          <h2 className="mt-6 text-3xl font-bold text-white">
            Image Management
          </h2>

          <p className="mt-4 text-slate-400">
            Search, preview and manage generated AI images.
          </p>

        </div>

      </div>
    </AdminLayout>
  );
}