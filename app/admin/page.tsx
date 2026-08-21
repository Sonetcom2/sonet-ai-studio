
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          SONET AI STUDIO
        </p>

        <h1 className="mt-2 text-4xl font-black text-white">
          Admin Control Panel
        </h1>

        <p className="mt-3 text-slate-400">
          Manage users, content, payments, subscriptions,
          withdrawals and platform settings.
        </p>
      </div>

      {/* Admin Sections */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/admin/dashboard"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-7 transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <div className="text-4xl">📊</div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            View platform statistics and activity.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-7 transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <div className="text-4xl">👥</div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Users
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage SONET AI STUDIO users and accounts.
          </p>
        </Link>

        <Link
          href="/admin/payments"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-7 transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <div className="text-4xl">💳</div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Payments
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Monitor transactions and revenue.
          </p>
        </Link>

        <Link
          href="/admin/withdrawals"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-7 transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <div className="text-4xl">💸</div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Affiliate Withdrawals
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Review and manage affiliate payout requests.
          </p>
        </Link>

        <Link
          href="/admin/subscriptions"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-7 transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <div className="text-4xl">💎</div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Subscriptions
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage user subscription plans.
          </p>
        </Link>

        <Link
          href="/admin/settings"
          className="rounded-3xl border border-slate-700 bg-slate-900 p-7 transition hover:border-cyan-500 hover:bg-slate-800"
        >
          <div className="text-4xl">⚙️</div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Settings
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Configure SONET AI STUDIO platform settings.
          </p>
        </Link>
      </div>

      {/* Quick Access */}
      <section className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
        <h2 className="text-2xl font-bold text-white">
          Quick Access
        </h2>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/admin/withdrawals"
            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-500"
          >
            💸 Manage Withdrawals
          </Link>

          <Link
            href="/admin/payments"
            className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            💳 View Payments
          </Link>

          <Link
            href="/admin/users"
            className="rounded-xl bg-slate-800 px-5 py-3 font-semibold text-white transition hover:bg-slate-700"
          >
            👥 Manage Users
          </Link>
        </div>
      </section>
    </div>
  );
}
