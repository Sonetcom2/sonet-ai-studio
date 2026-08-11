
import ProfileCard from "@/components/ProfileCard";
import RecentImages from "@/components/RecentImages";
import QuickActions from "@/components/QuickActions";
import StatsCards from "@/components/StatsCards";
import { getDashboardStats } from "@/services/dashboardService";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Welcome from "@/components/Welcome";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  const stats = await getDashboardStats();

if (!stats) {
  return null;
}
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white p-8">

      <div className="max-w-7xl mx-auto">
<Welcome
  fullName={stats.fullName}
/>

      <StatsCards
  totalImages={stats.totalImages}
  imagesToday={stats.imagesToday}
  imagesThisMonth={stats.imagesThisMonth}
  totalVideos={stats.totalVideos}
  credits={stats.credits}
/>


        <QuickActions />

        {/* Bottom Section */}
        <section className="grid lg:grid-cols-2 gap-8">

          <RecentImages
  recentImages={stats.recentImages ?? []}
  recentVideos={stats.recentVideos ?? []}
/>

          <ProfileCard
  fullName={stats.fullName}
  email={stats.user.email!}
  createdAt={stats.user.created_at}
  storageUsed={stats.storageUsed}
  credits={stats.credits}
  plan={stats.plan}
/>

          </section>

      </div>

    </main>
  );
}