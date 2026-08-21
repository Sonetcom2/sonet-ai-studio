
import AdminLayout from "@/components/admin/AdminLayout";
import {
  getAdminSubscriptions,
  getSubscriptionStats,
} from "@/services/adminSubscriptionService";

export default async function AdminSubscriptionsPage() {
  const users = await getAdminSubscriptions();
  const stats = getSubscriptionStats(users);

  return (
    <AdminLayout>
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">
            Subscriptions
          </h1>

          <p className="mt-3 text-slate-400">
            Manage SONET AI STUDIO user subscriptions and plans.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Free
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {stats.free}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-5">
            <p className="text-sm text-blue-300">
              Pro
            </p>
            <p className="mt-2 text-3xl font-bold text-blue-400">
              {stats.pro}
            </p>
          </div>

          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-5">
            <p className="text-sm text-purple-300">
              Premium
            </p>
            <p className="mt-2 text-3xl font-bold text-purple-400">
              {stats.premium}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/30 bg-green-950/30 p-5">
            <p className="text-sm text-green-300">
              Active
            </p>
            <p className="mt-2 text-3xl font-bold text-green-400">
              {stats.active}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-5">
            <p className="text-sm text-red-300">
              Suspended
            </p>
            <p className="mt-2 text-3xl font-bold text-red-400">
              {stats.suspended}
            </p>
          </div>

        </div>

        {/* Subscription Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-700 px-6 py-5">
            <h2 className="text-xl font-bold text-white">
              User Subscriptions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Current subscription status for every registered user.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-950/70">
                <tr className="text-left text-sm text-slate-400">

                  <th className="px-6 py-4">
                    User
                  </th>

                  <th className="px-6 py-4">
                    Plan
                  </th>

                  <th className="px-6 py-4">
                    Credits
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Role
                  </th>

                  <th className="px-6 py-4">
                    Created
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">

                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {

                    const plan =
                      user.plan.toUpperCase();

                    const status =
                      user.status.toUpperCase();

                    return (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-800/40"
                      >

                        <td className="px-6 py-5">

                          <div className="font-semibold text-white">
                            {user.fullName || "Unnamed User"}
                          </div>

                          <div className="mt-1 text-sm text-slate-500">
                            {user.email}
                          </div>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              plan === "PREMIUM"
                                ? "bg-purple-500/15 text-purple-400"
                                : plan === "PRO"
                                ? "bg-blue-500/15 text-blue-400"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {plan}
                          </span>

                        </td>

                        <td className="px-6 py-5 font-semibold text-white">
                          {user.credits.toLocaleString()}
                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              status === "ACTIVE"
                                ? "bg-green-500/15 text-green-400"
                                : "bg-red-500/15 text-red-400"
                            }`}
                          >
                            {status}
                          </span>

                        </td>

                        <td className="px-6 py-5 text-slate-300">
                          {user.role}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-400">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
}