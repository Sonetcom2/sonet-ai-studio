
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminAnalytics } from "@/services/adminAnalyticsService";

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
      <p className="text-sm font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-4xl font-black text-white">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const analytics = await getAdminAnalytics();

  if (!analytics) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-900 bg-red-950/30 p-8">
            <h1 className="text-2xl font-bold text-red-400">
              Unable to load analytics
            </h1>

            <p className="mt-2 text-slate-400">
              No authenticated administrator session was found.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            📊 Analytics
          </h1>

          <p className="mt-2 text-slate-400">
            Monitor SONET AI STUDIO platform activity and performance.
          </p>
        </div>

        {/* Main statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          <StatCard
            label="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            description="Registered platform users"
          />

          <StatCard
            label="Images Generated"
            value={analytics.totalImages.toLocaleString()}
            description="Total images generated"
          />

          <StatCard
            label="Videos Generated"
            value={analytics.totalVideos.toLocaleString()}
            description="Total video generations"
          />

          <StatCard
            label="Active Subscribers"
            value={analytics.activeSubscribers.toLocaleString()}
            description="Currently active subscriptions"
          />

          <StatCard
            label="Revenue"
            value={`₦${Number(
              analytics.totalRevenue
            ).toLocaleString()}`}
            description="Successful payments"
          />

          <StatCard
            label="Credits Used"
            value={analytics.creditsUsed.toLocaleString()}
            description="Credits consumed by video generation"
          />

        </div>

        {/* Analytics overview */}
        <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

          <div className="mb-8">
            <h2 className="text-2xl font-bold">
              Platform Overview
            </h2>

            <p className="mt-2 text-slate-400">
              Current SONET AI STUDIO usage and business metrics.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Users
              </p>

              <p className="mt-2 text-2xl font-bold">
                {analytics.totalUsers.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Images
              </p>

              <p className="mt-2 text-2xl font-bold">
                {analytics.totalImages.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Videos
              </p>

              <p className="mt-2 text-2xl font-bold">
                {analytics.totalVideos.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-500">
                Credits
              </p>

              <p className="mt-2 text-2xl font-bold">
                {analytics.creditsUsed.toLocaleString()}
              </p>
            </div>

          </div>

        </div>

        {/* Revenue summary */}
        <div className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

          <h2 className="text-2xl font-bold">
            Revenue Summary
          </h2>

          <p className="mt-2 text-slate-400">
            Revenue currently recorded in the payments table.
          </p>

          <div className="mt-6">
            <p className="text-sm text-slate-500">
              Successful Payment Revenue
            </p>

            <p className="mt-2 text-5xl font-black">
              ₦{Number(
                analytics.totalRevenue
              ).toLocaleString()}
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}

