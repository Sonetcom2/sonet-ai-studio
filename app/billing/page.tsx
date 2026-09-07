"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  plan: string | null;
  amount: number | string;
  status: string | null;
  reference: string | null;
  provider: string | null;
  payment_method: string | null;
  customer_note: string | null;
  currency: string | null;
  created_at: string;
};

function formatAmount(payment: Payment) {
  const amount = Number(payment.amount ?? 0);

  if (!Number.isFinite(amount)) {
    return "₦0";
  }

  // Paystack stores NGN amounts in kobo.
  // Manual payments are stored directly in NGN.
  const provider = String(payment.provider ?? "").toUpperCase();

  const nairaAmount =
    provider === "PAYSTACK"
      ? amount / 100
      : amount;

  return `₦${nairaAmount.toLocaleString("en-NG")}`;
}

function getStatusClasses(status: string | null) {
  switch (String(status ?? "").toUpperCase()) {
    case "SUCCESS":
      return "bg-green-500/20 text-green-400";

    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400";

    case "FAILED":
      return "bg-red-500/20 text-red-400";

    default:
      return "bg-slate-700 text-gray-300";
  }
}

function getPaymentMethod(payment: Payment) {
  if (payment.payment_method) {
    return payment.payment_method
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  if (payment.provider) {
    return payment.provider;
  }

  return "—";
}

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await fetch("/api/payments");

        if (!response.ok) {
          throw new Error("Unable to load transaction history.");
        }

        const data = await response.json();

        if (data.success) {
          setPayments(data.payments ?? []);
        }
      } catch (error) {
        console.error("Transaction History Error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-5xl font-black mb-3">
            💳 Transaction History
          </h1>

          <p className="text-gray-400">
            View and track all your SONET AI STUDIO payments.
          </p>
        </div>

        {/* Summary */}
        {!loading && payments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

            <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5">
              <p className="text-sm text-gray-400">
                Total Transactions
              </p>

              <p className="text-3xl font-black mt-2">
                {payments.length}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5">
              <p className="text-sm text-gray-400">
                Successful
              </p>

              <p className="text-3xl font-black text-green-400 mt-2">
                {
                  payments.filter(
                    (payment) =>
                      String(payment.status ?? "").toUpperCase() ===
                      "SUCCESS"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5">
              <p className="text-sm text-gray-400">
                Pending
              </p>

              <p className="text-3xl font-black text-yellow-400 mt-2">
                {
                  payments.filter(
                    (payment) =>
                      String(payment.status ?? "").toUpperCase() ===
                      "PENDING"
                  ).length
                }
              </p>
            </div>

          </div>
        )}

        {/* Transaction Table */}
        <div className="rounded-3xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl">

          <div className="px-6 py-5 border-b border-slate-700">
            <h2 className="text-xl font-bold">
              Payment Transactions
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Your complete payment activity.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead className="bg-slate-800">

                <tr>

                  <th className="text-left px-6 py-5">
                    Plan
                  </th>

                  <th className="text-left px-6 py-5">
                    Amount
                  </th>

                  <th className="text-left px-6 py-5">
                    Method
                  </th>

                  <th className="text-left px-6 py-5">
                    Status
                  </th>

                  <th className="text-left px-6 py-5">
                    Date
                  </th>

                  <th className="text-left px-6 py-5">
                    Reference
                  </th>

                  <th className="text-left px-6 py-5">
                    Receipt
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-16 text-gray-400"
                    >
                      Loading transaction history...
                    </td>

                  </tr>

                ) : payments.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="text-center py-16"
                    >
                      <div className="text-5xl mb-4">
                        💳
                      </div>

                      <p className="text-lg font-semibold">
                        No transactions yet
                      </p>

                      <p className="text-gray-400 mt-2">
                        Your subscription payments will appear here.
                      </p>

                    </td>

                  </tr>

                ) : (

                  payments.map((payment) => {

                    const status = String(
                      payment.status ?? "UNKNOWN"
                    ).toUpperCase();

                    return (
                      <tr
                        key={payment.id}
                        className="border-t border-slate-700 hover:bg-slate-800/70 transition"
                      >

                        {/* Plan */}
                        <td className="px-6 py-5">
                          <span className="font-bold">
                            {payment.plan ?? "—"}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-5 font-semibold">
                          {formatAmount(payment)}
                        </td>

                        {/* Payment Method */}
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium">
                              {getPaymentMethod(payment)}
                            </p>

                            {payment.provider && (
                              <p className="text-xs text-gray-500 mt-1">
                                {payment.provider}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 whitespace-nowrap">
                          {new Date(
                            payment.created_at
                          ).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Reference */}
                        <td className="px-6 py-5">

                          <div className="max-w-[260px]">

                            <p
                              className="text-cyan-400 text-sm break-all"
                              title={payment.reference ?? ""}
                            >
                              {payment.reference ?? "—"}
                            </p>

                            {payment.customer_note && (
                              <p
                                className="text-xs text-gray-500 mt-2 break-words"
                                title={payment.customer_note}
                              >
                                Transfer note:{" "}
                                {payment.customer_note}
                              </p>
                            )}

                          </div>

                        </td>

                        {/* Receipt */}
                        <td className="px-6 py-5">

                          {payment.reference ? (
                            <a
                              href={`/receipt?reference=${encodeURIComponent(
                                payment.reference
                              )}`}
                              className="inline-flex rounded-xl bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-sm font-semibold transition"
                            >
                              View Receipt
                            </a>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              —
                            </span>
                          )}

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Manual payment information */}
        {!loading &&
          payments.some(
            (payment) =>
              String(payment.provider ?? "").toUpperCase() ===
              "MANUAL"
          ) && (
            <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">

              <p className="font-semibold text-yellow-400">
                Manual Bank Transfer
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Manual bank-transfer payments remain{" "}
                <span className="text-yellow-400 font-semibold">
                  PENDING
                </span>{" "}
                until they are verified and approved by SONET AI
                STUDIO administration.
              </p>

            </div>
          )}

      </div>
    </main>
  );
}