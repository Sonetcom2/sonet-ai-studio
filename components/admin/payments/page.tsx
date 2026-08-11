import Link from "next/link";

export default function AdminPaymentsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>
            <h1 className="text-4xl font-black">
              💰 Payments
            </h1>

            <p className="mt-2 text-slate-400">
              Manage payments, transactions and revenue for SONET AI STUDIO.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-center font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            ← Back to Dashboard
          </Link>

        </div>

        {/* Stats */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Total Revenue
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              $0
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              No payment data yet
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Successful Payments
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              0
            </p>

            <p className="mt-2 text-sm text-cyan-400">
              Transactions
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Pending Payments
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              0
            </p>

            <p className="mt-2 text-sm text-yellow-400">
              Awaiting confirmation
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Failed Payments
            </p>

            <p className="mt-3 text-4xl font-black text-white">
              0
            </p>

            <p className="mt-2 text-sm text-red-400">
              Failed transactions
            </p>
          </div>

        </section>

        {/* Transactions */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-700 p-6 md:flex-row md:items-center">

            <div>
              <h2 className="text-2xl font-bold">
                Payment Transactions
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                View and manage payment activity.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700"
            >
              ↻ Refresh
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-800">

                <tr className="text-left text-sm text-slate-300">

                  <th className="px-6 py-4">
                    Transaction
                  </th>

                  <th className="px-6 py-4">
                    User
                  </th>

                  <th className="px-6 py-4">
                    Amount
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Date
                  </th>

                  <th className="px-6 py-4 text-center">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr>

                  <td
                    colSpan={6}
                    className="p-16 text-center"
                  >

                    <div className="text-5xl">
                      💳
                    </div>

                    <h3 className="mt-5 text-xl font-bold text-white">
                      No transactions yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Payment transactions will appear here once users
                      make purchases.
                    </p>

                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </section>

      </div>
    </main>
  );
}