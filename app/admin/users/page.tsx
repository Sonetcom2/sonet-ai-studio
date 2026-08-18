import AdminLayout from "@/components/admin/AdminLayout";
import UserStats from "@/components/admin/UserStats";
import UserManagement from "@/components/admin/UserManagement";

import { getAllUsers } from "@/services/adminUserService";

export default async function AdminUsersPage() {
  const { users, stats } = await getAllUsers();

  return (
    <AdminLayout>
      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-white">
            User Management
          </h1>

          <p className="mt-3 text-slate-400">
            Manage every registered user on SONET AI STUDIO.
          </p>
        </div>

        <UserStats
          totalUsers={stats.totalUsers}
          activeUsers={stats.activeUsers}
          suspendedUsers={stats.suspendedUsers}
          premiumUsers={stats.premiumUsers}
        />

        <UserManagement users={users} />

      </div>
    </AdminLayout>
  );
}