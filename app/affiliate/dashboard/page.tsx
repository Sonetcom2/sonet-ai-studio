
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Affiliate = {
  id: string;
  referralCode: string;
  commissionRate: number;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarned: number;
  pendingEarnings: number;
  paidEarnings: number;
  status: string;
  createdAt: string;
};

type Referral = {
  id: string;
  referral_code: string;
  status: string;
  created_at: string;
  converted_at: string | null;
  referred_user_id: string;
};

type Commission = {
  id: string;
  payment_reference: string;
  plan: string;
  payment_amount: number;
  commission_rate: number;
  commission_amount: number;
  currency: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  paid_at: string | null;
};

type DashboardResponse = {
  success: boolean;
  error?: string;
  affiliate?: Affiliate;
  referrals?: Referral[];
  commissions?: Commission[];
};

type WithdrawalForm = {
  amount: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

function formatMoney(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AffiliateDashboardPage() {
  const [data, setData] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [withdrawalMessage, setWithdrawalMessage] =
    useState("");

  const [withdrawalError, setWithdrawalError] =
    useState("");

  const [withdrawalForm, setWithdrawalForm] =
    useState<WithdrawalForm>({
      amount: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
    });

  async function loadDashboard() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/affiliate/dashboard",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        (await response.json()) as DashboardResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Unable to load affiliate dashboard."
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "Affiliate dashboard error:",
        error
      );

      setData({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to load affiliate dashboard.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function copyReferralLink() {
    if (!data?.affiliate?.referralCode) return;

    setCopying(true);

    try {
      const link = `${window.location.origin}/register?ref=${encodeURIComponent(
        data.affiliate.referralCode
      )}`;

      await navigator.clipboard.writeText(link);

      alert("Referral link copied successfully!");
    } catch (error) {
      console.error(
        "Copy referral link error:",
        error
      );

      alert(
        "Unable to copy the referral link."
      );
    } finally {
      setCopying(false);
    }
  }

  async function submitWithdrawal(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!data?.affiliate) return;

    setWithdrawing(true);
    setWithdrawalMessage("");
    setWithdrawalError("");

    const amount = Number(
      withdrawalForm.amount
    );

    if (!Number.isFinite(amount)) {
      setWithdrawalError(
        "Please enter a valid withdrawal amount."
      );
      setWithdrawing(false);
      return;
    }

    if (amount < 1000) {
      setWithdrawalError(
        "Minimum withdrawal amount is ₦1,000."
      );
      setWithdrawing(false);
      return;
    }

    if (!Number.isInteger(amount)) {
      setWithdrawalError(
        "Withdrawal amount must be a whole number."
      );
      setWithdrawing(false);
      return;
    }

    if (
      amount >
      data.affiliate.pendingEarnings
    ) {
      setWithdrawalError(
        "The withdrawal amount is greater than your available earnings."
      );
      setWithdrawing(false);
      return;
    }

    if (
      !withdrawalForm.bankName.trim() ||
      !withdrawalForm.accountName.trim() ||
      !withdrawalForm.accountNumber.trim()
    ) {
      setWithdrawalError(
        "Please complete all bank details."
      );
      setWithdrawing(false);
      return;
    }

    if (
      !/^\d{10}$/.test(
        withdrawalForm.accountNumber.trim()
      )
    ) {
      setWithdrawalError(
        "Account number must contain exactly 10 digits."
      );
      setWithdrawing(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/affiliate/withdrawal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount,
            bankName:
              withdrawalForm.bankName.trim(),
            accountName:
              withdrawalForm.accountName.trim(),
            accountNumber:
              withdrawalForm.accountNumber.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "Unable to submit withdrawal request."
        );
      }

      setWithdrawalMessage(
        `Withdrawal request submitted successfully. Reference: ${result.withdrawal.reference}`
      );

      setWithdrawalForm({
        amount: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
      });

      await loadDashboard();
    } catch (error) {
      console.error(
        "Withdrawal request error:",
        error
      );

      setWithdrawalError(
        error instanceof Error
          ? error.message
          : "Unable to submit withdrawal request."
      );
    } finally {
      setWithdrawing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-blue-500/20 bg-slate-900/70 p-10 text-center shadow-2xl">
            <div className="text-4xl">⚡</div>

            <h1 className="mt-4 text-2xl font-bold">
              Loading Affiliate Dashboard...
            </h1>

            <p className="mt-2 text-gray-400">
              Please wait while we load your affiliate data.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!data?.success || !data.affiliate) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-6 py-12 text-white">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-red-500/30 bg-slate-900/80 p-10 text-center shadow-2xl">
            <div className="text-5xl">⚠️</div>

            <h1 className="mt-5 text-2xl font-bold">
              Unable to Load Dashboard
            </h1>

            <p className="mt-3 text-gray-400">
              {data?.error ||
                "Something went wrong."}
            </p>

            <button
              onClick={loadDashboard}
              className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-white transition hover:bg-cyan-400"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const affiliate = data.affiliate;
  const referrals = data.referrals ?? [];
  const commissions = data.commissions ?? [];

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${encodeURIComponent(
          affiliate.referralCode
        )}`
      : `/register?ref=${encodeURIComponent(
          affiliate.referralCode
        )}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              SONET AI STUDIO
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Affiliate Dashboard
            </h1>

            <p className="mt-2 text-gray-400">
              Track referrals, conversions and commissions.
            </p>
          </div>

          <Link
            href="/affiliate"
            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-center font-semibold text-gray-200 transition hover:border-cyan-500 hover:text-cyan-400"
          >
            ← Affiliate Program
          </Link>
        </div>

        {/* Referral Link */}
        <section className="mb-8 rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6 shadow-2xl">
          <h2 className="text-xl font-bold">
            Your Referral Link
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Share this link to earn commissions when your referrals make qualifying payments.
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={referralLink}
              readOnly
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-gray-300 outline-none"
            />

            <button
              type="button"
              onClick={copyReferralLink}
              disabled={copying}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copying
                ? "Copying..."
                : "Copy Link"}
            </button>
          </div>

          <p className="mt-3 text-sm text-gray-500">
            Referral Code:{" "}
            <span className="font-bold text-cyan-400">
              {affiliate.referralCode}
            </span>
          </p>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-gray-400">
              Total Referrals
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {affiliate.totalReferrals}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-gray-400">
              Successful Referrals
            </p>

            <p className="mt-3 text-3xl font-black text-cyan-400">
              {affiliate.successfulReferrals}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-gray-400">
              Total Earned
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {formatMoney(affiliate.totalEarned)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-gray-400">
              Available for Withdrawal
            </p>

            <p className="mt-3 text-3xl font-black text-yellow-400">
              {formatMoney(
                affiliate.pendingEarnings
              )}
            </p>
          </div>

        </section>

        {/* Earnings */}
        <section className="mb-8 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-gray-400">
              Paid Earnings
            </p>

            <p className="mt-3 text-3xl font-black text-green-400">
              {formatMoney(
                affiliate.paidEarnings
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <p className="text-sm text-gray-400">
              Affiliate Status
            </p>

            <p className="mt-3 inline-flex rounded-full bg-green-500/10 px-4 py-2 text-sm font-bold uppercase text-green-400">
              {affiliate.status}
            </p>
          </div>

        </section>

        {/* Withdrawal */}
        <section className="mb-8 rounded-3xl border border-green-500/20 bg-slate-900/70 p-6 shadow-2xl">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
              Affiliate Payout
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Withdraw Earnings
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Request a payout directly to your Nigerian bank account.
              Minimum withdrawal is ₦1,000.
            </p>
          </div>

          <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
            <p className="text-sm text-gray-400">
              Available Balance
            </p>

            <p className="mt-2 text-3xl font-black text-green-400">
              {formatMoney(
                affiliate.pendingEarnings
              )}
            </p>
          </div>

          {withdrawalMessage && (
            <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-300">
              {withdrawalMessage}
            </div>
          )}

          {withdrawalError && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {withdrawalError}
            </div>
          )}

          <form
            onSubmit={submitWithdrawal}
            className="grid gap-5 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Withdrawal Amount
              </label>

              <input
                type="number"
                min="1000"
                step="1"
                value={withdrawalForm.amount}
                onChange={(event) =>
                  setWithdrawalForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="1000"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Bank Name
              </label>

              <input
                type="text"
                value={withdrawalForm.bankName}
                onChange={(event) =>
                  setWithdrawalForm((current) => ({
                    ...current,
                    bankName: event.target.value,
                  }))
                }
                placeholder="e.g. GTBank"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Account Name
              </label>

              <input
                type="text"
                value={withdrawalForm.accountName}
                onChange={(event) =>
                  setWithdrawalForm((current) => ({
                    ...current,
                    accountName: event.target.value,
                  }))
                }
                placeholder="Account holder name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Account Number
              </label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={withdrawalForm.accountNumber}
                onChange={(event) =>
                  setWithdrawalForm((current) => ({
                    ...current,
                    accountNumber:
                      event.target.value.replace(
                        /\D/g,
                        ""
                      ),
                  }))
                }
                placeholder="10-digit account number"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={
                  withdrawing ||
                  affiliate.pendingEarnings < 1000
                }
                className="w-full rounded-xl bg-green-500 px-6 py-4 font-black text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawing
                  ? "Submitting Withdrawal..."
                  : affiliate.pendingEarnings < 1000
                    ? "Minimum ₦1,000 Required"
                    : "Request Withdrawal"}
              </button>
            </div>
          </form>

          <p className="mt-4 text-xs text-gray-500">
            Your withdrawal request will be reviewed and processed by SONET AI STUDIO administration.
          </p>
        </section>

        {/* Referrals */}
        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-2xl font-bold">
              Referral History
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Users who registered through your referral link.
            </p>
          </div>

          {referrals.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No referrals yet.
              <br />
              Share your referral link to start earning.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-sm text-gray-400">
                    <th className="px-6 py-4">
                      Referral Code
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4">
                      Registered
                    </th>
                    <th className="px-6 py-4">
                      Converted
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {referrals.map((referral) => (
                    <tr
                      key={referral.id}
                      className="border-b border-slate-800/70"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {referral.referral_code}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase text-blue-400">
                          {referral.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(
                          referral.created_at
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(
                          referral.converted_at
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Commissions */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-2xl font-bold">
              Commission History
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Earnings generated from qualifying payments.
            </p>
          </div>

          {commissions.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No commissions yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-sm text-gray-400">
                    <th className="px-6 py-4">
                      Plan
                    </th>
                    <th className="px-6 py-4">
                      Payment
                    </th>
                    <th className="px-6 py-4">
                      Rate
                    </th>
                    <th className="px-6 py-4">
                      Commission
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {commissions.map((commission) => (
                    <tr
                      key={commission.id}
                      className="border-b border-slate-800/70"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {commission.plan}
                      </td>

                      <td className="px-6 py-4">
                        {formatMoney(
                          commission.payment_amount,
                          commission.currency
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {commission.commission_rate}%
                      </td>

                      <td className="px-6 py-4 font-bold text-cyan-400">
                        {formatMoney(
                          commission.commission_amount,
                          commission.currency
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold uppercase text-yellow-400">
                          {commission.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {formatDate(
                          commission.created_at
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="py-10 text-center text-sm text-gray-500">
          SONET AI STUDIO Affiliate Program
        </footer>

      </div>
    </main>
  );
}