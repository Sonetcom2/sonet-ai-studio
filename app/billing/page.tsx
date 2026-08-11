"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  plan: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
};

export default function BillingPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const response = await fetch("/api/payments");
        const data = await response.json();

        if (data.success) {
          setPayments(data.payments);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black text-white p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-black mb-3">
          💳 Billing History
        </h1>

        <p className="text-gray-400 mb-10">
          View all your subscription payments.
        </p>

        <div className="rounded-3xl bg-slate-900 border border-slate-700 overflow-hidden shadow-2xl">

          <table className="w-full">

            <thead className="bg-slate-800">

              <tr>

                <th className="text-left px-6 py-5">
                  Plan
                </th>

                <th className="text-left px-6 py-5">
                  Amount
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
                    colSpan={5}
                    className="text-center py-12"
                  >
                    Loading...
                  </td>

                </tr>

              ) : payments.length === 0 ? (

                <tr>

                  <td
                    colSpan={5}
                    className="text-center py-12 text-gray-400"
                  >
                    No payments yet.
                  </td>

                </tr>

              ) : (

                payments.map((payment) => (

                  <tr
                    key={payment.id}
                    className="border-t border-slate-700 hover:bg-slate-800 transition"
                  >

                    <td className="px-6 py-5 font-semibold">
                      {payment.plan}
                    </td>

                    <td className="px-6 py-5">
                      ₦{(payment.amount / 100).toLocaleString()}
                    </td>

                    <td className="px-6 py-5">

                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">

                        {payment.status}

                      </span>

                    </td>

                    <td className="px-6 py-5">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5 text-cyan-400">
                      {payment.reference}
                    </td>
                    <td className="px-6 py-5">
  <a
    href={`/receipt?reference=${payment.reference}`}
    className="rounded-xl bg-cyan-600 hover:bg-cyan-700 px-4 py-2 text-sm font-semibold transition"
  >
    View Receipt
  </a>
</td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  );
}