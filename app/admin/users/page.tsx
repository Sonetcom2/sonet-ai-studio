
import AdminLayout from "@/components/admin/AdminLayout";
import UserStats from "@/components/admin/UserStats";
import UserSearch from "@/components/admin/UserSearch";
import UserFilters from "@/components/admin/UserFilters";
import UserTable from "@/components/admin/UserTable";

import { getAllUsers } from "@/services/adminUserService";

export default async function AdminUsersPage() {
  const { users, stats } = await getAllUsers();

  return (
    <AdminLayout>

      <div className="space-y-8">

        {/* Page Header */}

        <div>

          <h1 className="text-4xl font-bold text-white">
            👥 User Management
          </h1>

          <p className="mt-3 text-slate-400">
            Manage every registered user on SONET AI STUDIO.
          </p>

        </div>

        {/* Statistics */}

        <UserStats
          totalUsers={stats.totalUsers}
          activeUsers={stats.activeUsers}
          suspendedUsers={stats.suspendedUsers}
          premiumUsers={stats.premiumUsers}
        />

        {/* Search */}

        <UserSearch />

        {/* Filters */}

        <UserFilters />

        {/* Users Table */}

        <UserTable users={users} />

      </div>

    </AdminLayout>
  );
}