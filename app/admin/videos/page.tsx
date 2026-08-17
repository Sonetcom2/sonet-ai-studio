import AdminLayout from "@/components/admin/AdminLayout";
import AdminVideoTable from "@/components/admin/AdminVideoTable";
import { getAdminVideos } from "@/services/adminVideoManagementService";

export default async function AdminVideosPage() {
  const { videos, stats } = await getAdminVideos();

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">
            🎬 AI Videos
          </h1>

          <p className="mt-2 text-slate-400">
            Manage AI-generated videos on SONET AI STUDIO.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">
              Total Videos
            </p>

            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.totalVideos}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">
              Completed
            </p>

            <h2 className="mt-2 text-4xl font-bold text-green-300">
              {stats.completedVideos}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">
              Processing
            </p>

            <h2 className="mt-2 text-4xl font-bold text-yellow-300">
              {stats.processingVideos}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">
              Failed
            </p>

            <h2 className="mt-2 text-4xl font-bold text-red-300">
              {stats.failedVideos}
            </h2>
          </div>

        </div>

        {/* Video History */}
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

          <div className="border-b border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white">
              Video Generation History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review, preview, download, and manage generated videos.
            </p>
          </div>

          <AdminVideoTable videos={videos} />

        </div>

      </div>
    </AdminLayout>
  );
}