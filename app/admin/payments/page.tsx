import { getAllPayments } from "@/services/adminPaymentService";
import PaymentTable from "@/components/admin/PaymentTable";

export default async function AdminPaymentsPage() {
  const payments = await getAllPayments();

  const successfulPayments = payments.filter(
    (payment) => payment.status?.toUpperCase() === "SUCCESS"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status?.toUpperCase() === "PENDING"
  );

  const failedPayments = payments.filter(
    (payment) => payment.status?.toUpperCase() === "FAILED"
  );

  const totalRevenue = successfulPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black">
            💰 Payments
          </h1>

          <p className="mt-2 text-slate-400">
            Manage payments, transactions and revenue for SONET AI STUDIO.
          </p>
        </div>

        {/* Statistics */}
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {/* Total Revenue */}
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Total Revenue
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              ₦{totalRevenue.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-emerald-400">
              Successful payments
            </p>
          </div>

          {/* Successful */}
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Successful Payments
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {successfulPayments.length}
            </p>

            <p className="mt-2 text-sm text-cyan-400">
              Transactions
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Pending Payments
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {pendingPayments.length}
            </p>

            <p className="mt-2 text-sm text-yellow-400">
              Awaiting confirmation
            </p>
          </div>

          {/* Failed */}
          <div className="rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-xl">
            <p className="text-sm text-slate-400">
              Failed Payments
            </p>

            <p className="mt-3 text-3xl font-black text-white">
              {failedPayments.length}
            </p>

            <p className="mt-2 text-sm text-red-400">
              Failed transactions
            </p>
          </div>

        </section>

        {/* Transactions */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">

          {/* Section Header */}
          <div className="border-b border-slate-700 p-6">

            <h2 className="text-2xl font-bold">
              Payment Transactions
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              All payment activity on SONET AI STUDIO.
            </p>

          </div>

          {/* Payment Table */}
          <PaymentTable payments={payments} />

        </section>

      </div>
    </main>
  );
}