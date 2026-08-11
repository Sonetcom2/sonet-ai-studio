"use client";

import { useState } from "react";
import PaymentModal from "./PaymentModal";

type Payment = {
  id: string;
  user_id: string | null;
  amount: number | string;
  currency: string | null;
  provider: string | null;
  reference: string | null;
  status: string | null;
  created_at: string;
};

type Props = {
  payments: Payment[];
};

export default function PaymentTable({ payments }: Props) {
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");

  const filteredPayments = payments.filter((payment) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      payment.reference?.toLowerCase().includes(query) ||
      payment.user_id?.toLowerCase().includes(query) ||
      payment.provider?.toLowerCase().includes(query) ||
      payment.status?.toLowerCase().includes(query)
    );
  });

  const formatAmount = (
    amount: number | string,
    currency: string | null
  ) => {
    return `${currency || "NGN"} ${Number(
      amount || 0
    ).toLocaleString()}`;
  };

  return (
    <>
      {/* Search */}
      <div className="border-b border-slate-700 p-6">

        <div className="relative max-w-xl">

          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔎
          </span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reference, user ID, provider or status..."
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />

        </div>

        {search && (
          <p className="mt-3 text-sm text-slate-400">
            Showing {filteredPayments.length} of {payments.length} payments
          </p>
        )}

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-slate-800">

            <tr className="text-left text-sm text-slate-300">

              <th className="px-6 py-4">
                Reference
              </th>

              <th className="px-6 py-4">
                User
              </th>

              <th className="px-6 py-4">
                Amount
              </th>

              <th className="px-6 py-4">
                Provider
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

            {filteredPayments.length === 0 ? (

              <tr>

                <td
                  colSpan={7}
                  className="p-16 text-center"
                >

                  <div className="text-5xl">
                    🔎
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">
                    No payments found
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Try a different search term.
                  </p>

                </td>

              </tr>

            ) : (

              filteredPayments.map((payment) => {

                const status =
                  payment.status?.toUpperCase() || "PENDING";

                return (

                  <tr
                    key={payment.id}
                    className="border-t border-slate-800 transition hover:bg-slate-800/50"
                  >

                    <td className="px-6 py-5">

                      <span className="font-mono text-sm text-cyan-400">
                        {payment.reference || "—"}
                      </span>

                    </td>

                    <td className="px-6 py-5">

                      <span className="font-mono text-sm text-slate-300">
                        {payment.user_id
                          ? `${payment.user_id.slice(0, 8)}...`
                          : "—"}
                      </span>

                    </td>

                    <td className="px-6 py-5 font-semibold text-white">

                      {formatAmount(
                        payment.amount,
                        payment.currency
                      )}

                    </td>

                    <td className="px-6 py-5 text-slate-300">
                      {payment.provider || "—"}
                    </td>

                    <td className="px-6 py-5">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "SUCCESS"
                            ? "bg-green-500/20 text-green-300"
                            : status === "FAILED"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                        }`}
                      >
                        {status}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-slate-400">

                      {payment.created_at
                        ? new Date(
                            payment.created_at
                          ).toLocaleDateString()
                        : "—"}

                    </td>

                    <td className="px-6 py-5">

                      <div className="flex justify-center">

                        <button
                          type="button"
                          title="View Payment"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setOpenModal(true);
                          }}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-white transition hover:bg-blue-700"
                        >
                          👁
                        </button>

                      </div>

                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

      {/* Payment Modal */}
      <PaymentModal
        payment={selectedPayment}
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedPayment(null);
        }}
      />
    </>
  );
}