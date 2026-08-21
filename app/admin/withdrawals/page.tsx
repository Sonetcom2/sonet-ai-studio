import {
  getAllWithdrawals,
} from "@/services/adminWithdrawalService";

import { requireAdmin } from "@/lib/auth/requireAdmin";

function formatMoney(
  amount: number,
  currency = "NGN"
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(
  date: string | null
) {
  if (!date) return "—";

  return new Date(date).toLocaleString(
    "en-NG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-400";

    case "processing":
      return "bg-blue-500/10 text-blue-400";

    case "paid":
      return "bg-green-500/10 text-green-400";

    case "rejected":
      return "bg-red-500/10 text-red-400";

    default:
      return "bg-slate-700 text-slate-300";
  }
}

export default async function AdminWithdrawalsPage() {
  await requireAdmin();

  const withdrawals =
    await getAllWithdrawals();

  const pending =
    withdrawals.filter(
      (item) =>
        item.status.toLowerCase() ===
        "pending"
    );

  const processing =
    withdrawals.filter(
      (item) =>
        item.status.toLowerCase() ===
        "processing"
    );

  const paid =
    withdrawals.filter(
      (item) =>
        item.status.toLowerCase() ===
        "paid"
    );

  const rejected =
    withdrawals.filter(
      (item) =>
        item.status.toLowerCase() ===
        "rejected"
    );

  const totalRequested =
    withdrawals.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            SONET AI STUDIO
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Affiliate Withdrawals
          </h1>

          <p className="mt-2 text-slate-400">
            Manage affiliate withdrawal requests
            and payout processing.
          </p>
        </div>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm text-slate-400">
              Total Requests
            </p>

            <p className="mt-3 text-3xl font-black">
              {withdrawals.length}
            </p>
          </div>

          <div className="rounded-3xl border border-yellow-500/20 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-3 text-3xl font-black text-yellow-400">
              {pending.length}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm text-slate-400">
              Processing
            </p>

            <p className="mt-3 text-3xl font-black text-blue-400">
              {processing.length}
            </p>
          </div>

          <div className="rounded-3xl border border-green-500/20 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm text-slate-400">
              Paid
            </p>

            <p className="mt-3 text-3xl font-black text-green-400">
              {paid.length}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <p className="text-sm text-slate-400">
              Total Requested
            </p>

            <p className="mt-3 text-2xl font-black text-cyan-400">
              {formatMoney(totalRequested)}
            </p>
          </div>

        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-700 p-6">
            <h2 className="text-2xl font-bold">
              Withdrawal Requests
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Review affiliate payout requests.
            </p>
          </div>

          {withdrawals.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No withdrawal requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1200px] text-left">

                <thead>
                  <tr className="border-b border-slate-700 text-sm text-slate-400">

                    <th className="px-6 py-4">
                      Reference
                    </th>

                    <th className="px-6 py-4">
                      Affiliate
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Bank
                    </th>

                    <th className="px-6 py-4">
                      Account
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Requested
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {withdrawals.map(
                    (withdrawal) => (
                      <tr
                        key={withdrawal.id}
                        className="border-b border-slate-800/70"
                      >

                        <td className="px-6 py-5">

                          <p className="font-semibold text-white">
                            {withdrawal.reference}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {withdrawal.id}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="font-semibold text-white">
                            {withdrawal
                              .affiliate_profiles
                              ?.referral_code ||
                              "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {withdrawal.user_id}
                          </p>

                        </td>

                        <td className="px-6 py-5 font-bold text-cyan-400">
                          {formatMoney(
                            Number(
                              withdrawal.amount
                            ),
                            withdrawal.currency
                          )}
                        </td>

                        <td className="px-6 py-5">
                          {withdrawal.bank_name}
                        </td>

                        <td className="px-6 py-5">

                          <p className="font-semibold">
                            {withdrawal.account_name}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            {withdrawal.account_number}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClass(
                              withdrawal.status
                            )}`}
                          >
                            {withdrawal.status}
                          </span>

                        </td>

                        <td className="px-6 py-5 text-sm text-slate-400">
                          {formatDate(
                            withdrawal.requested_at
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        <section className="mt-8 rounded-3xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="text-xl font-bold">
            Withdrawal Summary
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-400">
                Paid Requests
              </p>

              <p className="mt-2 text-2xl font-black text-green-400">
                {paid.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-400">
                Rejected Requests
              </p>

              <p className="mt-2 text-2xl font-black text-red-400">
                {rejected.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-5">
              <p className="text-sm text-slate-400">
                Processing
              </p>

              <p className="mt-2 text-2xl font-black text-blue-400">
                {processing.length}
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}