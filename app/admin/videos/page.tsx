import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminVideos } from "@/services/adminVideoService";

export default async function AdminVideosPage() {
  const { videos, stats } = await getAdminVideos();

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            🎬 AI Videos
          </h1>

          <p className="mt-2 text-slate-400">
            Manage AI-generated videos on SONET AI STUDIO.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">Total Videos</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.totalVideos}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">Completed</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.completedVideos}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">Processing</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.processingVideos}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">Failed</p>
            <h2 className="mt-2 text-4xl font-bold text-white">
              {stats.failedVideos}
            </h2>
          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">

          <div className="border-b border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white">
              Video Generation History
            </h2>
          </div>

          {videos.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No video generations found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b border-slate-700 text-sm text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Prompt</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Resolution</th>
                    <th className="px-6 py-4">Credits</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>

                <tbody>

                  {videos.map((video) => (
                    <tr
                      key={video.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >

                      <td className="max-w-md px-6 py-4 text-sm text-white">
                        <div className="truncate">
                          {video.prompt || "No prompt"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                          {video.status || "unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {video.duration ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {video.resolution ?? "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-300">
                        {video.credits_used ?? 0}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {video.created_at
                          ? new Date(video.created_at).toLocaleString()
                          : "-"}
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}