import { getAdminAnalytics } from "@/services/adminAnalyticsService";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminStats from "@/components/admin/AdminStats";

import { getAdminDashboardStats } from "../../../services/adminDashboardService";
export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stats = await getAdminAnalytics();
  const analytics = await getAdminAnalytics();
  

  if (!stats) {
    return null;
  }

  return (
    <AdminLayout>

      <div className="space-y-10">

        <div>

          <h1 className="text-5xl font-black text-white">
            👑 Admin Dashboard
          </h1>

          <p className="mt-3 text-slate-400">
            Welcome back to SONET AI STUDIO Control Center.
          </p>

        </div>

        <AdminStats
  totalUsers={analytics.totalUsers}
  totalImages={analytics.totalImages}
  totalRevenue={analytics.totalRevenue}
  creditsUsed={analytics.creditsUsed}
/>
<div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
    <p className="text-slate-400">🎥 Videos</p>
    <h2 className="mt-2 text-4xl font-bold text-white">
      {analytics.totalVideos}
    </h2>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
    <p className="text-slate-400">⭐ Subscribers</p>
    <h2 className="mt-2 text-4xl font-bold text-white">
      {analytics.activeSubscribers}
    </h2>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
    <p className="text-slate-400">💰 Revenue</p>
    <h2 className="mt-2 text-4xl font-bold text-white">
      ${analytics.totalRevenue}
    </h2>
  </div>

  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
    <p className="text-slate-400">💎 Credits Used</p>
    <h2 className="mt-2 text-4xl font-bold text-white">
      {analytics.creditsUsed}
    </h2>
  </div>

</div>

      </div>

    </AdminLayout>
  );
}